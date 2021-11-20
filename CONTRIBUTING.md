
# Contributing.md

> More of a technical guide how I set this up.

## Nodejs

Install [nodejs](https://nodejs.org/en/), see [guide](https://www.geeksforgeeks.org/installation-of-node-js-on-linux/):

```shell
# On linux
sudo apt install nodejs
sudo apt install npm
```

Then you can generate a tailwindcss file with:

```shell
npx tailwindcss -o css/tailwind.css
```

public [Github Repos API](https://docs.github.com/en/rest/reference/repos)

## API authentication



The API rate limits are higher for authenticated requests ([link](https://docs.github.com/en/rest/overview/resources-in-the-rest-api))/

I created a GitHub personal access token (PAT) ([guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)), stored it in a `.gitignore`-ed `.env` file and named it `GITHUB_TOKEN`.

While running `build_site.py` on github actions, it will have access to a different token with the same name (`GITHUB_TOKEN`)

