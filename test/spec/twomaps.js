describe('ol.control.LayerSwitcher - Two maps', function () {
  var map1, map2, target1, target2, switcher1, switcher2;

  beforeEach(function () {
    target1 = document.createElement('div');
    target1.id = 'map1';
    document.body.appendChild(target1);
    target2 = document.createElement('div');
    target2.id = 'map2';
    document.body.appendChild(target2);
    switcher1 = new ol.control.LayerSwitcher();
    switcher2 = new ol.control.LayerSwitcher();
    map1 = new ol.Map({
      target: target1,
      layers: [
        new ol.layer.Group({
          title: 'Base',
          layers: [
            new ol.layer.Tile({
              title: 'Foo',
              type: 'base',
              visible: true,
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            }),
            new ol.layer.Tile({
              title: 'Too',
              type: 'base',
              visible: false,
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        new ol.layer.Tile({
          title: 'Bar',
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        })
      ],
      controls: [switcher1]
    });
    map2 = new ol.Map({
      target: target2,
      layers: [
        new ol.layer.Group({
          title: 'Base',
          layers: [
            new ol.layer.Tile({
              title: 'Foo',
              type: 'base',
              visible: false,
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            }),
            new ol.layer.Tile({
              title: 'Too',
              type: 'base',
              visible: true,
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        new ol.layer.Tile({
          title: 'Bar',
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        })
      ],
      controls: [switcher2]
    });
  });

  afterEach(function () {
    document.body.removeChild(target1);
    document.body.removeChild(target2);
    target1 = null;
    target2 = null;
    switcher1 = null;
    switcher2 = null;
    map1 = null;
    map2 = null;
  });

  describe('Layer IDs are unique', function () {
    it('Inputs for layers with the same title in different maps will have different IDs', function () {
      switcher1.showPanel();
      switcher2.showPanel();
      var bar1Id = jQuery('#map1 .layer-switcher label:contains("Bar")')
        .siblings('input')
        .attr('id');
      var bar2Id = jQuery('#map2 .layer-switcher label:contains("Bar")')
        .siblings('input')
        .attr('id');
      expect(bar1Id).to.not.equal(bar2Id);
    });
  });

  describe('Base maps', function () {
    it('Changing the base map for one map doesn`t affect the other map', function () {
      // Setup
      var foo1 = getLayerByTitle(map1, 'Foo');
      var too1 = getLayerByTitle(map1, 'Too');
      var foo2 = getLayerByTitle(map2, 'Foo');
      var too2 = getLayerByTitle(map2, 'Too');
      switcher1.showPanel();
      switcher2.showPanel();
      // Assert the initial state is what we expect
      expect(foo1.getVisible()).to.be(true);
      expect(too1.getVisible()).to.be(false);
      expect(foo2.getVisible()).to.be(false);
      expect(too2.getVisible()).to.be(true);
      // Set map1 base map to "Too"
      jQuery('#map1 .layer-switcher label:contains("Too")').siblings('input').click();
      // Assert expected layer visibility and radio button state
      expect(foo1.getVisible()).to.be(false);
      expect(
        jQuery('#map1 .layer-switcher label:contains("Foo")').siblings('input').get(0)
          .checked
      ).to.be(false);
      expect(too1.getVisible()).to.be(true);
      expect(
        jQuery('#map1 .layer-switcher label:contains("Too")').siblings('input').get(0)
          .checked
      ).to.be(true);
      expect(foo2.getVisible()).to.be(false);
      expect(
        jQuery('#map2 .layer-switcher label:contains("Foo")').siblings('input').get(0)
          .checked
      ).to.be(false);
      expect(too2.getVisible()).to.be(true);
      expect(
        jQuery('#map2 .layer-switcher label:contains("Too")').siblings('input').get(0)
          .checked
      ).to.be(true);
    });
  });
});
