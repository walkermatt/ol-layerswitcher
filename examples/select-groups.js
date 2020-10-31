(function () {
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Group({
        title: 'Base maps',
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
              params: { LAYERS: 'show:0' },
              url:
                'https://ons-inspire.esriuk.com/arcgis/rest/services/Administrative_Boundaries/Countries_December_2016_Boundaries/MapServer'
            })
          }),
          new ol.layer.Group({
            title: 'Census',
            fold: 'open',
            layers: [
              new ol.layer.Image({
                title: 'Districts',
                source: new ol.source.ImageArcGISRest({
                  ratio: 1,
                  params: { LAYERS: 'show:0' },
                  url:
                    'https://ons-inspire.esriuk.com/arcgis/rest/services/Census_Boundaries/Census_Merged_Local_Authority_Districts_December_2011_Boundaries/MapServer'
                })
              }),
              new ol.layer.Image({
                title: 'Wards',
                source: new ol.source.ImageArcGISRest({
                  ratio: 1,
                  params: { LAYERS: 'show:0' },
                  url:
                    'https://ons-inspire.esriuk.com/arcgis/rest/services/Census_Boundaries/Census_Merged_Wards_December_2011_Boundaries/MapServer'
                })
              })
            ]
          })
        ]
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([-2.284, 55.692], 'EPSG:4326', 'EPSG:3857'),
      zoom: 9
    })
  });

  var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
  });
  map.addControl(layerSwitcher);

  // Add a select input to allow setting the groupSelectStyle style

  function createOption(name) {
    var option = document.createElement('option');
    option.value = name;
    option.text = name;
    return option;
  }

  var container = document.createElement('div');
  container.id = 'group-select-style';

  var label = document.createElement('label');
  label.innerText = 'groupSelectStyle: ';
  label.htmlFor = 'group-select-style-input';

  var select = document.createElement('select');
  select.id = 'group-select-style-input';
  select.add(createOption('children'));
  select.add(createOption('group'));
  select.add(createOption('none'));

  select.onchange = function (_e) {
    map.removeControl(layerSwitcher);
    layerSwitcher = new ol.control.LayerSwitcher({
      activationMode: 'click',
      startActive: true,
      groupSelectStyle: select.value
    });
    map.addControl(layerSwitcher);
  };

  container.appendChild(label);
  container.appendChild(select);

  document.body.appendChild(container);
})();
