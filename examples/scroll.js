(function () {
  var thunderforestAttributions = [
    'Tiles &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>',
    ol.source.OSM.ATTRIBUTION
  ];

  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Group({
        title: 'Base maps',
        layers: [
          new ol.layer.Tile({
            title: 'Stamen - Water color',
            type: 'base',
            visible: false,
            source: new ol.source.Stamen({
              layer: 'watercolor'
            })
          }),
          new ol.layer.Tile({
            title: 'Stamen - Toner',
            type: 'base',
            visible: false,
            source: new ol.source.Stamen({
              layer: 'toner'
            })
          }),
          new ol.layer.Tile({
            title: 'Thunderforest - OpenCycleMap',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url: 'http://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
              attributions: thunderforestAttributions
            })
          }),
          new ol.layer.Tile({
            title: 'Thunderforest - Outdoors',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url:
                'http://{a-c}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
              attributions: thunderforestAttributions
            })
          }),
          new ol.layer.Tile({
            title: 'Thunderforest - Landscape',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url:
                'http://{a-c}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
              attributions: thunderforestAttributions
            })
          }),
          new ol.layer.Tile({
            title: 'Thunderforest - Transport',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url:
                'http://{a-c}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
              attributions: thunderforestAttributions
            })
          }),
          new ol.layer.Tile({
            title: 'Thunderforest - Transport Dark',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
              url:
                'http://{a-c}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
              attributions: thunderforestAttributions
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
        layers: [
          new ol.layer.Image({
            title: 'Countries',
            source: new ol.source.ImageArcGISRest({
              ratio: 1,
              params: { LAYERS: 'show:0' },
              url:
                'https://ons-inspire.esriuk.com/arcgis/rest/services/Administrative_Boundaries/Countries_December_2016_Boundaries/MapServer'
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

  map.addControl(
    new ol.control.LayerSwitcher({
      activationMode: 'click'
    })
  );
})();
