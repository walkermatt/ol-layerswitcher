(function() {
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    new ol.layer.Group({
                        title: 'Water color with labels',
                        type: 'base',
                        combine: true,
                        visible: false,
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.Stamen({
                                    layer: 'watercolor'
                                })
                            }),
                            new ol.layer.Tile({
                                source: new ol.source.Stamen({
                                    layer: 'terrain-labels'
                                })
                            })
                        ]
                    }),
                    new ol.layer.Tile({
                        title: 'Water color',
                        type: 'base',
                        visible: false,
                        source: new ol.source.Stamen({
                            layer: 'watercolor'
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'OSM',
                        type: 'base',
                        visible: true,
                        source: new ol.source.OSM()
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'Overlays',
                fold: 'open',
                layers: [
                    new ol.layer.Image({
                        title: 'Countries',
                        source: new ol.source.ImageArcGISRest({
                            ratio: 1,
                            params: {'LAYERS': 'show:0'},
                            url: "https://ons-inspire.esriuk.com/arcgis/rest/services/Administrative_Boundaries/Countries_December_2016_Boundaries/MapServer"
                        })
                    })
                ]
            })
        ],
        view: new ol.View({
            center: ol.proj.transform([-0.92, 52.96], 'EPSG:4326', 'EPSG:3857'),
            zoom: 6
        })
    });

    // Get out-of-the-map div element with the ID "layers" and renders layers to it.
    // NOTE: If the layers are changed outside of the layer switcher then you
    // will need to call ol.control.LayerSwitcher.renderPanel again to refesh
    // the layer tree. Style the tree via CSS.
    var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'left' });
    var toc = document.getElementById("layers");
    ol.control.LayerSwitcher.renderPanel(map, toc);
    map.addControl(sidebar);

})();
