# Contributing.md

> More of a technical guide how I set this up.

## Tailwindcss

[tailwindcss](https://tailwindcss.com/) is a nice framework where you style HTML elements fully using CSS classes. To get a clean `.css` file, install [nodejs](https://nodejs.org/en/), see [guide](https://www.geeksforgeeks.org/installation-of-node-js-on-linux/):

We also use [nightwind](https://github.com/jjranalli/nightwind) for automatic dark mode.

```shell
# On linux
sudo apt install nodejs
sudo apt install npm
```

```shell
npm install tailwindcss
npm install nightwind
npm install postcss
```

Then you can generate a tailwindcss (that uses the `tailwind.config.js`) file with:

```shell
export NODE_ENV="production"
npx tailwindcss -o css/tailwind.css
```

## API authentication

Project data is pulled from the public [Github REST API](https://docs.github.com/en/rest/reference/repos).

The API rate limits are higher for authenticated requests ([link](https://docs.github.com/en/rest/overview/resources-in-the-rest-api))/

Github actions has a `GITHUB_TOKEN` available as an environment variable that when used will have higher rate limits, similar to an authenticated user. 

For local development, I created a GitHub personal access token (PAT) ([guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)), stored it in a `.gitignore`-ed `.env` file and named it `GITHUB_TOKEN`:

```
# .env file in root of my repo
GITHUB_TOKEN=mysecrettoken
```

This way, while running `build_site.py` on locally, it will have access to a different token with the same name (`GITHUB_TOKEN`) and same rate limits as github actions.

## Templating

I used jinja2 for templating, and timeago.js for displaying dates as relative time stamps.

## Deploy to GitHub Pages

To publish manually we can use the excellent [ghp-import](https://github.com/c-w/ghp-import) library:

```shell
pip install -r requirements.txt
python build_site.py
ghp-import build -p -f
```

There's also a scheduled github action that runs that script on python 3.9 every night (see `.github/workflows`).


## I forked the repo and now want updates

```shell
git remote add upstream git@github.com:timvink/project-monitor.git
git pull upstream main
```
