import requests
import yaml
import os
import datetime
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


projects = get_projects()
# 3 search api calls per project
# 3 core api calls per project
# Rate limit
# Search API: 10 / minute (https://docs.github.com/en/rest/reference/search#rate-limit)
# authenticated = 30
# Core API: 60 / minute
# authenticated = 5000
if len(projects) * 3 > 30:
    raise NotImplementedError(
        "We use 3 search API requests per request. The rate limit is 30 / minute. Implement a wait."
    )


data = []
for p in projects:
    user, repo = p.split("/")

    # Check API rate limits
    limits = get_rate_limits()
    core_limit = limits.get("core").get("remaining")
    if core_limit < 4:
        msg = f"Not enough core api calls remaining for repo {repo}:"
        msg + f"{core_limit} but need 4. Implement a wait, or less projects"
        raise RateLimitError(msg)
    search_limit = limits.get("search").get("remaining")
    if search_limit < 3:
        msg = f"Not enough search api calls remaining for repo {repo}:"
        msg + f"{search_limit} but need 3. Implement a wait, or less projects"
        raise RateLimitError(msg)

    project = {}
    project["user"] = user
    project["repo"] = repo
    project["release"] = get_core_api(user, repo, "releases/latest")
    project["contributors"] = get_core_api(user, repo, "contributors")
    project["stats"] = get_core_api(user, repo, "")

    issues = get_search_api(user, repo, "issue")
    project["total_issues_count"] = issues.get("total_count")

    prs = get_search_api(user, repo, "pr")
    project["total_pr_count"] = prs.get("total_count")
    open_prs = get_search_api(user, repo, "pr+state:open")
    project["open_pr_count"] = open_prs.get("total_count")

    project["downloads"] = get_downloads(repo)

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

    data.append(project)


template = Template(Path("templates/index.html").read_text())
built = template.render(projects=data, build_date=get_build_date())

# Build the site
copy_tree("css", "build/css")
copy_tree("js", "build/js")
copy_tree("img", "build/img")
with open("build/index.html", "w") as out:
    out.write(built)
