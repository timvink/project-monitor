// dict with reponame : username
var projects = [
    {"user": "timvink", "repository" : "mkdocs-table-reader-plugin"},
    {"user": "timvink", "repository" : "mkdocs-print-site-plugin"},
    {"user": "timvink", "repository" : "mkdocs-git-revision-date-localized-plugin"},
    {"user": "timvink", "repository" : "mkdocs-git-authors-plugin"}
]


const userAction = async (msg) => {
    const response = await fetch('https://api.github.com/repos/octocat/hello-world', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    var myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    console.log(myJson)
    console.log(myJson['contributors_url'])
    console.log(msg)
}


function addProject(user, repo) {
    var cell = document.getElementById(user + '-' + repo + '-project');

    cell.innerHTML = `
    <div class="flex items-center">
    <div class="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
    </div>
    ${user}/<span class="font-medium"><a href="https://github.com/${user}/${repo}" class="hover:underline text-blue-600 hover:text-blue-800 visited:text-purple-600">${repo}</a></span>
    </div>
    `
}

// function addRelease(row, html_url, tag_name, published_at) {
//     var cell = row.insertCell();
//     cell.classList.add('py-3', 'px-6', 'text-left')

//     cell.innerHTML = `
//     <a href="${html_url}" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">${tag_name}</a> 
//     <span class="italic">(${published_at})</span>    
//     `
// }

const addRelease = async (user, repo) => {
    const response = await fetch('https://api.github.com/repos/' + user + '/' + repo + '/releases/latest', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    var data = await response.json(); //extract JSON from the http response
    var cell = document.getElementById(user + '-' + repo + '-lastrelease');
    
    cell.innerHTML = `
    <a href="${data['html_url']}" class="hover:underline text-blue-600 hover:text-blue-800 visited:text-purple-600">${data['tag_name']}</a> 
    <span class="italic">(<div class="timeago inline" datetime="${data['published_at']}"></div>)</span>
    `
    const nodes = document.querySelectorAll('.timeago');
    timeago.render(nodes);
}


const addContributors = async (user, repo) => {
    const response = await fetch('https://api.github.com/repos/' + user + '/' + repo + '/contributors', {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    var data = await response.json(); //extract JSON from the http response
    var cell = document.getElementById(user + '-' + repo + '-contributors');
    
    var html = '<div class="flex items-center justify-center">'
    // Show max 6 constributors
    for (const d of data.slice(0,6)) {
        html += `
        <img class="w-6 h-6 rounded-full border-gray-200 border -m-1 transform hover:scale-125" src="${d['avatar_url']}"/>
        `
    }
    html += '<span class="w-3"></span>'
    html += `(<a href="https://github.com/${user}/${repo}/contributors" class="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">${data.length}</a>)`
    html += '</div>'
    cell.innerHTML = html

}


function addDummy(row, user, repo, position) {
    var cell1 = row.insertCell(position);
    cell1.classList.add('py-3', 'px-6', 'text-left')
    
    cell1.innerHTML = `
    <div class="flex items-center">
        dummy
    </div>
    `;
}



document.addEventListener('DOMContentLoaded', function(event) {
    

    var table = document.getElementById("projectsTable");

    for (const p of projects) {
        var row = table.insertRow();
        row.classList.add('border-b', 'border-gray-200', 'even:bg-gray-50', 'hover:bg-gray-100');
        
        cells_ids = ['project','lastrelease','contributors','commits','build','downloads','isues','prs','stars']

        for (const cell_id of cells_ids) { 
            var cell = row.insertCell()
            cell.classList.add('py-3', 'px-6', 'text-left')
            cell.id = p['user'] + '-' + p['repository'] + '-' + cell_id
            cell.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path d="M13.75 22c0 .966-.783 1.75-1.75 1.75s-1.75-.784-1.75-1.75.783-1.75 1.75-1.75 1.75.784 1.75 1.75zm-1.75-22c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 10.75c.689 0 1.249.561 1.249 1.25 0 .69-.56 1.25-1.249 1.25-.69 0-1.249-.559-1.249-1.25 0-.689.559-1.25 1.249-1.25zm-22 1.25c0 1.105.896 2 2 2s2-.895 2-2c0-1.104-.896-2-2-2s-2 .896-2 2zm19-8c.551 0 1 .449 1 1 0 .553-.449 1.002-1 1-.551 0-1-.447-1-.998 0-.553.449-1.002 1-1.002zm0 13.5c.828 0 1.5.672 1.5 1.5s-.672 1.501-1.502 1.5c-.826 0-1.498-.671-1.498-1.499 0-.829.672-1.501 1.5-1.501zm-14-14.5c1.104 0 2 .896 2 2s-.896 2-2.001 2c-1.103 0-1.999-.895-1.999-2s.896-2 2-2zm0 14c1.104 0 2 .896 2 2s-.896 2-2.001 2c-1.103 0-1.999-.895-1.999-2s.896-2 2-2z"/></svg>'
        }
    }

    // Add content from APIs in async
    for (const p of projects) {
        addProject(p['user'], p['repository']);
        addRelease(p['user'], p['repository']);
        addContributors(p['user'], p['repository']);
    }

    console.log('done')


  })