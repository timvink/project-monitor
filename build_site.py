import requests
import yaml
import os
import datetime
import time
from jinja2 import Template
from pathlib import Path
from typing import List, Dict
from datetime import timezone
from distutils.dir_util import copy_tree
from dotenv import load_dotenv


# For local development, we've also set a GITHUB_TOKEN
# These are used for bigger API rate limits
# set environment variables from .env.
load_dotenv()


class RateLimitError(Exception):
    pass


def get_token() -> str:
    token = os.getenv("GITHUB_TOKEN")
    assert token, "Setup your GITHUB TOKEN in github actions or locally via .env"
    return token


def get_projects() -> List:
    with open("projects.yaml", "r") as stream:
        projects = yaml.safe_load(stream)
    return projects


def get_api(url: str) -> Dict:
    github_header = {
        "Accept": "application/vnd.github.v3+json",
        "authorization": f"Bearer { get_token() }",
    }
    rsp = requests.get(url, headers=github_header)
    return rsp.json()


def get_core_api(user: str, repo: str, endpoint: str) -> Dict:
    url = f"https://api.github.com/repos/{user}/{repo}"
    if endpoint:
        url += f"/{endpoint}"

    return get_api(url)


def get_search_api(user: str, repo: str, query: str) -> Dict:
    url = f"https://api.github.com/search/issues?q=repo:{user}/{repo}/node+type:{query}&per_page=1"
    return get_api(url)


def get_rate_limits() -> Dict:
    github_header = {
        "Accept": "application/vnd.github.v3+json",
        "authorization": f"Bearer { get_token() }",
    }
    rsp = requests.get("https://api.github.com/rate_limit", headers=github_header)
    limits = rsp.json()
    if limits.get("message") == "Bad credentials":
        raise ConnectionError(str(limits))
    else:
        return limits.get("resources")


def get_downloads(repo) -> int:
    rsp = requests.get(f"https://api.pepy.tech/api/v2/projects/{repo}")
    downloads = rsp.json().get("downloads")
    if not downloads:
        return 0
    last_30_days = sorted(downloads.keys())[-30:]
    total_downloads = 0
    for k in last_30_days:
        total_downloads += sum(downloads[k].values())
    return total_downloads


def get_build_date() -> str:
    """
    Build time with military timezone suffix.

    trailing 'Z' indicates UTC.
    We want this timestamp for timeago.js
    """
    dt = datetime.datetime.now(timezone.utc)
    utc_time = dt.replace(tzinfo=timezone.utc)
    return utc_time.strftime("%Y-%m-%dT%H:%M:%SZ")


def date_string_to_unix_timestamp(date_string: str) -> int:
    """
    Convert date string to unix timestamp.

    Example:
    2021-11-21T12:33:26Z -> 1637498006
    """
    out = datetime.datetime.strptime(date_string, "%Y-%m-%dT%H:%M:%SZ")
    out = out.replace(tzinfo=datetime.timezone.utc)
    return int(out.timestamp())


def get_project_data(project: str) -> Dict:
    """
    Gets the data for a single project.
    """
    user, repo = p.split("/")
    print(f"Adding data for {user}/{repo}")

    project = {}
    project["user"] = user
    project["repo"] = repo
    project["release"] = get_core_api(user, repo, "releases/latest")
    project["published_at_timestamp"] = date_string_to_unix_timestamp(
        project["release"].get("published_at")
    )
    project["contributors"] = get_core_api(user, repo, "contributors")
    project["stats"] = get_core_api(user, repo, "")

    issues = get_search_api(user, repo, "issue")
    project["total_issues_count"] = issues.get("total_count")

    prs = get_search_api(user, repo, "pr")
    project["total_pr_count"] = prs.get("total_count")
    open_prs = get_search_api(user, repo, "pr+state:open")
    project["open_pr_count"] = open_prs.get("total_count")

    project["downloads"] = get_downloads(repo)

    # stats.open_issues_counts includes PRs by default
    # Let's update
    project['stats']['open_issues_count'] -= project["open_pr_count"]
    
    # workflows
    # bit hacky. Better approach would be to consistently use
    # the same name of pytest workflow in github actions
    # across all repos.
    workflows = get_core_api(user, repo, "actions/workflows").get("workflows")
    if workflows:
        for w in workflows:
            if not "publish" in w.get("path"):
                project["badge_url"] = w.get("badge_url")
    else:
        project["badge_url"] = "#"

    return project


def check_rate_limits(required_core_api=4, required_search_api=3):
    """
    Check API rate limits.
    
    Limits Search API: (https://docs.github.com/en/rest/reference/search#rate-limit)
    Public: 10 / minute 
    authenticated: 30 / minute

    Limits Core API:
    Public: 60 / minute
    Authenticated: 5000 / minute
    """
    limits = get_rate_limits()

    core_limit = limits.get("core").get("remaining")
    if core_limit < required_core_api:
        print(f"Rate limit: Not enough github core api calls remaining. Waiting 60 seconds.")
        time.sleep(60)

    search_limit = required_search_api
    if search_limit < 3:
        print(f"Rate limit: Not enough github search api calls remaining. Waiting 60 seconds.")
        time.sleep(60)


if __name__ == "__main__":
    # Read config
    projects = get_projects()

    # Get data from Github API
    data = []
    for p in projects:
        check_rate_limits()
        data.append(get_project_data(p))

    # Fill in the HTML template using jinja2
    template = Template(Path("templates/index.html").read_text())
    built = template.render(projects=data, build_date=get_build_date())

    # Build the site
    copy_tree("css", "build/css")
    copy_tree("js", "build/js")
    copy_tree("img", "build/img")
    with open("build/index.html", "w") as out:
        out.write(built)



