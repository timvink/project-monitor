import requests


header = {'Accept' : 'application/vnd.github.v3+json'}

rsp = requests.get("https://api.github.com/repos/octocat/hello-world", headers = header)

rsp.json()

