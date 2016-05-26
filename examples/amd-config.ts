require.config({
    waitSeconds: 30,
    packages: [
        {
            name: "openlayers",
            location: "../bower_components/openlayers",
            main: "ol-debug.js"
        },
        {
            name: "proj4",
            location: "../bower_components/proj4",
            main: "dist/proj4-src.js"
        }
    ]
});