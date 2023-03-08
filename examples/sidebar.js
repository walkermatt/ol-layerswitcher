(function () {
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Group({
        // A layer must have a title to appear in the layerswitcher
        title: 'Base maps',
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
          new ol.layer.Group({
            // A layer must have a title to appear in the layerswitcher
            title: 'Boundaries',
            // Adding a 'fold' property set to either 'open' or 'close' makes the group layer
            // collapsible
            fold: 'open',
            layers: [
              new ol.layer.Image({
                // A layer must have a title to appear in the layerswitcher
                title: 'Counties',
                visible: false,
                opacity: 0.5,
                source: new ol.source.ImageArcGISRest({
                  ratio: 1,
                  params: { LAYERS: 'show:3' },
                  url:
                    'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer'
                })
              }),
              new ol.layer.Image({
                // A layer must have a title to appear in the layerswitcher
                title: 'States',
                visible: true,
                source: new ol.source.ImageArcGISRest({
                  ratio: 1,
                  params: { LAYERS: 'show:2' },
                  url:
                    'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer'
                })
              })
            ]
          }),
          new ol.layer.Image({
            // A layer must have a title to appear in the layerswitcher
            title: 'Highways',
            visible: false,
            source: new ol.source.ImageArcGISRest({
              ratio: 1,
              params: { LAYERS: 'show:1' },
              url:
                'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer'
            })
          }),
          new ol.layer.Image({
            // A layer must have a title to appear in the layerswitcher
            title: 'Cities',
            visible: false,
            source: new ol.source.ImageArcGISRest({
              ratio: 1,
              params: { LAYERS: 'show:0' },
              url:
                'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer'
            })
          })
        ]
      })
    ],
    view: new ol.View({
      center: ol.proj.transform([-80.789, 37.926], 'EPSG:4326', 'EPSG:3857'),
      zoom: 5
    })
  });

  // Get out-of-the-map div element with the ID "layers" and renders layers to it.
  // NOTE: If the layers are changed outside of the layer switcher then you
  // will need to call ol.control.LayerSwitcher.renderPanel again to refesh
  // the layer tree. Style the tree via CSS.
  var sidebar = new ol.control.Sidebar({
    element: 'sidebar',
    position: 'left'
  });
  var toc = document.getElementById('layers');
  ol.control.LayerSwitcher.renderPanel(map, toc, { reverse: true });
  map.addControl(sidebar);
})();
