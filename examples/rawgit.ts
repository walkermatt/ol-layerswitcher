function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

require.config({

    packages: [
        {
            name: 'openlayers',
            location: 'https://cdnjs.cloudflare.com/ajax/libs/ol3/3.15.1',
            main: 'ol'
        },
        {
            name: "proj4",
            location: "https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14",
            main: "proj4.js"
        }
    ],

    callback: () => {
        require([getParameterByName("run")]);
    }
});
