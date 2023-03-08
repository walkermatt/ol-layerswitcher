(function () {
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
        title: 'Base maps',
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
      center: ol.proj.transform([-80.789, 37.926], 'EPSG:4326', 'EPSG:3857'),
      zoom: 5
    })
  });

  // Create a LayerSwitcher instance and add it to the map
  var layerSwitcher = new ol.control.LayerSwitcher();
  map.addControl(layerSwitcher);

  // Add a layer to a pre-existing ol.layer.Group after the LayerSwitcher has
  // been added to the map. The layer will appear in the list the next time
  // the LayerSwitcher is shown or LayerSwitcher#renderPanel is called.
  overlayGroup.getLayers().push(
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
  );
})();
