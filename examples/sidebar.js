(function() {
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Group({
                // A layer must have a title to appear in the layerswitcher
                'title': 'Base maps',
                layers: [
                    new ol.layer.Group({
                        // A layer must have a title to appear in the layerswitcher
                        title: 'Water color with labels',
                        // Setting the layers type to 'base' results
                        // in it having a radio button and only one
                        // base layer being visibile at a time
                        type: 'base',
                        // Setting combine to true causes sub-layers to be hidden
                        // in the layerswitcher, only the parent is shown
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
                        // A layer must have a title to appear in the layerswitcher
                        title: 'Water color',
                        // Again set this layer as a base layer
                        type: 'base',
                        visible: false,
                        source: new ol.source.Stamen({
                            layer: 'watercolor'
                        })
                    }),
                    new ol.layer.Tile({
                        // A layer must have a title to appear in the layerswitcher
                        title: 'OSM',
                        // Again set this layer as a base layer
                        type: 'base',
                        visible: true,
                        source: new ol.source.OSM()
                    })
                ]
            }),
            new ol.layer.Group({
                // A layer must have a title to appear in the layerswitcher
                title: 'Overlays',
                // Adding a 'fold' property set to either 'open' or 'close' makes the group layer
                // collapsible
                fold: 'open',
                layers: [
                    new ol.layer.Image({
                        // A layer must have a title to appear in the layerswitcher
                        title: 'Countries',
                        source: new ol.source.ImageArcGISRest({
                            ratio: 1,
                            params: {'LAYERS': 'show:0'},
                            url: "https://ons-inspire.esriuk.com/arcgis/rest/services/Administrative_Boundaries/Countries_December_2016_Boundaries/MapServer"
                        })
                    }),
                    new ol.layer.Group({
                        // A layer must have a title to appear in the layerswitcher
                        title: 'Census',
                        fold: 'open',
                        layers: [
                            new ol.layer.Image({
                                // A layer must have a title to appear in the layerswitcher
                                title: 'Districts',
                                source: new ol.source.ImageArcGISRest({
                                    ratio: 1,
                                    params: {'LAYERS': 'show:0'},
                                    url: "https://ons-inspire.esriuk.com/arcgis/rest/services/Census_Boundaries/Census_Merged_Local_Authority_Districts_December_2011_Boundaries/MapServer"
                                })
                            }),
                            new ol.layer.Image({
                                // A layer must have a title to appear in the layerswitcher
                                title: 'Wards',
                                visible: false,
                                source: new ol.source.ImageArcGISRest({
                                    ratio: 1,
                                    params: {'LAYERS': 'show:0'},
                                    url: "https://ons-inspire.esriuk.com/arcgis/rest/services/Census_Boundaries/Census_Merged_Wards_December_2011_Boundaries/MapServer"
                                })
                            })
                        ]
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
