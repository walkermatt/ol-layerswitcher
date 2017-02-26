(function() {

    // Create a group for overlays. Add the group to the map when it's created
    // but add the overlay layers later
    var overlayGroup = new ol.layer.Group({
        title: 'Overlays',
        layers: []
    });

    // Create a map containing two group layers
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    new ol.layer.Tile({
                        title: 'OSM',
                        type: 'base',
                        source: new ol.source.OSM()
                    })
                ]
            }),
            overlayGroup
        ],
        view: new ol.View({
            center: [-10997148, 4569099],
            zoom: 4
        })
    });

    // Create a LayerSwitcher instance and add it to the map
    var layerSwitcher = new ol.control.LayerSwitcher();
    map.addControl(layerSwitcher);

    // Add a layer to a pre-exiting ol.layer.Group after the LayerSwitcher has
    // been added to the map. The layer will appear in the list the next time
    // the LayerSwitcher is shown or LayerSwitcher#renderPanel is called.

    url = "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StatesCitiesRivers_USA/MapServer";
    overlayGroup.getLayers().push(
            new ol.layer.Image({
                title: 'States',
                minResolution: 500,
                maxResolution: 50000,
                source: new ol.source.ImageArcGISRest({
                    ratio: 1,
                    params: {'LAYERS': 'show:2'},
                    url: url
                })
            })
    );

    overlayGroup.getLayers().push(
            new ol.layer.Image({
                title: 'Rivers',
                minResolution: 0,
                maxResolution: 5000,
                source: new ol.source.ImageArcGISRest({
                    ratio: 1,
                    params: {'LAYERS': 'show:1'},
                    url: url
                })
            })
    );

    overlayGroup.getLayers().push(
            new ol.layer.Image({
                title: 'Cities',
                minResolution: 0,
                maxResolution: 3000,
                source: new ol.source.ImageArcGISRest({
                    ratio: 1,
                    params: {'LAYERS': 'show:0'},
                    url: url
                })
            })
    );

})();
