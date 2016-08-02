(function() {

    // Create a group for overlays. Add the group to the map when it's created
    // but add the overlay layers later
    var overlayGroup = new ol.layer.Group({
        title: 'Overlays',
        layers: [
        ]
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
            center: ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857'),
            zoom: 6
        })
    });

    // Create a LayerSwitcher instance and add it to the map
    var layerSwitcher = new ol.control.LayerSwitcher();
    map.addControl(layerSwitcher);

    // Add a layer to a pre-exiting ol.layer.Group after the LayerSwitcher has
    // been added to the map. The layer will appear in the list the next time
    // the LayerSwitcher is shown or LayerSwitcher#renderPanel is called.
    overlayGroup.getLayers().push(new ol.layer.Tile({
        title: 'Countries',
        source: new ol.source.TileWMS({
            url: 'http://demo.opengeo.org/geoserver/wms',
            params: {'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp'},
            serverType: 'geoserver'
        })
    }));

})();
