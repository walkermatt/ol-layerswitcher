(function () {
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Group({
        title: 'Base maps',
        fold: 'open',
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
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([-80.789, 37.926], 'EPSG:4326', 'EPSG:3857'),
      zoom: 5
    })
  });

  var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Légende' // Optional label for button
  });
  map.addControl(layerSwitcher);
})();
