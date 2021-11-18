# Open source projects

Excuses to play with:

- tailwindcss
- AJAX REST APIs
- htmx ?

Create something like https://github.com/mgedmin/project-summary 

Get user info

```
curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/users/USERNAME
```

repo contributors

```
curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/timvink/mkdocs-print-site-plugin/contributors
```

last release

````
curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/timvink/mkdocs-print-site-plugin/releases/latest
````

last commit & number of commits

```
curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/octocat/hello-world/commits
```



pending changes (number of commits)

build status 

Issues  & PRs count

Stars, name, many URLs, last update date, first update date, etc. 

```
curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/timvink/mkdocs-table-reader-plugin
```

stargazers_count
open_issues_count



curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/timvink/mkdocs-table-reader-plugin/stats/contributors
