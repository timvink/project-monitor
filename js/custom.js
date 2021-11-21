
// from the tailwindcss README example
var nightwind = {
    beforeTransition: () => {
        const doc = document.documentElement;
        const onTransitionDone = () => {
        doc.classList.remove('nightwind');
        doc.removeEventListener('transitionend', onTransitionDone);
        }
        doc.addEventListener('transitionend', onTransitionDone);
        if (!doc.classList.contains('nightwind')) {
        doc.classList.add('nightwind');
        }
    },
    
    toggle: () => {
        nightwind.beforeTransition();
        if (!document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
        window.localStorage.setItem('nightwind-mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            window.localStorage.setItem('nightwind-mode', 'light');
        }
    },
    
    enable: (dark) => {
        const mode = dark ? "dark" : "light";
        const opposite = dark ? "light" : "dark";
    
        nightwind.beforeTransition();
    
        if (document.documentElement.classList.contains(opposite)) {
        document.documentElement.classList.remove(opposite);
        }
        document.documentElement.classList.add(mode);
        window.localStorage.setItem('nightwind-mode', mode);
    },
}


function getInitialColorMode() {
        const persistedColorPreference = window.localStorage.getItem('nightwind-mode');
        const hasPersistedPreference = typeof persistedColorPreference === 'string';
        if (hasPersistedPreference) {
            return persistedColorPreference;
        }
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const hasMediaQueryPreference = typeof mql.matches === 'boolean';
        if (hasMediaQueryPreference) {
            return mql.matches ? 'dark' : 'light';
        }
        return 'light';
}


document.addEventListener('DOMContentLoaded', function(event) {
        
    // Init tablesorter
    $(function() {
        $("#projectsTable").tablesorter({
            sortList : [[4,1]]  // initial sort on Downloads columns 
        });
    });

    // Init timeago
    const nodes = document.querySelectorAll('.timeago');
    timeago.render(nodes);

    // Toggling darkmode
    const checkbox = document.querySelector("#checkbox");
    const html = document.querySelector("html");

    toggleDarkMode = function () {
        if ( checkbox.checked ) {
            document.querySelector("#svg_sun").classList.add("hidden");
            document.querySelector("#svg_moon").classList.remove("hidden");
        } else {
            document.querySelector("#svg_sun").classList.remove("hidden");
            document.querySelector("#svg_moon").classList.add("hidden");
        }
        nightwind.toggle()
    }

    checkbox.addEventListener("click",toggleDarkMode);

    // adapted from nightwind example
    if (getInitialColorMode() == 'light') {
        document.documentElement.classList.remove('dark');
        document.querySelector("#checkbox").checked = false;
        document.querySelector("#svg_sun").classList.remove("hidden");
        document.querySelector("#svg_moon").classList.add("hidden");
    } else {
        document.documentElement.classList.add('dark');
        document.querySelector("#checkbox").checked = true;
        document.querySelector("#svg_sun").classList.add("hidden");
        document.querySelector("#svg_moon").classList.remove("hidden");
    }

    // Fix for even rows when in dark mode
    // See https://github.com/jjranalli/nightwind/issues/44
    rows = document.querySelectorAll("#projectsTable tbody tr")
    function even(a) {
        var ar = [];
        for (var i = 0; i < a.length; i++) {
            if(i % 2 === 0) { // index is even
                ar.push(a[i]);
            }
        }
        return ar;
      }
    even_rows = even(rows)
    for(var i = 0; i < even_rows.length; i++)
    {
        even_rows[i].classList.add('bg-gray-50');
    }

})