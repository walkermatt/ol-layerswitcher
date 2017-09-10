var ol = require('openlayers');
var LayerSwitcher = require('../../src/ol3-layerswitcher');

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Group({
            'title': 'Base maps',
            layers: [
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
                    source: new ol.source.OSM()
                })
            ]
        })
    ],
    view: new ol.View({
        center: [0, 0],
        zoom: 0
    })
});

var layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);
