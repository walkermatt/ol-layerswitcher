describe('groupSelectStyle', function () {
  var map, target;

  function tileDebugSource() {
    return new ol.source.TileDebug({
      projection: 'EPSG:3857',
      tileGrid: ol.tilegrid.createXYZ({
        maxZoom: 22
      })
    });
  }

  beforeEach(function () {
    target = document.createElement('div');
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
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
                  source: tileDebugSource()
                }),
                new ol.layer.Tile({
                  source: tileDebugSource()
                })
              ]
            }),
            new ol.layer.Tile({
              title: 'Water color',
              type: 'base',
              visible: false,
              source: tileDebugSource()
            }),
            new ol.layer.Tile({
              title: 'OSM',
              type: 'base',
              visible: true,
              source: tileDebugSource()
            })
          ]
        }),
        new ol.layer.Group({
          title: 'Overlays',
          fold: 'open',
          layers: [
            new ol.layer.Tile({
              title: 'Countries',
              source: tileDebugSource()
            }),
            new ol.layer.Group({
              title: 'Census',
              fold: 'open',
              layers: [
                new ol.layer.Tile({
                  title: 'Districts',
                  source: tileDebugSource()
                }),
                new ol.layer.Image({
                  title: 'Wards',
                  source: tileDebugSource()
                })
              ]
            })
          ]
        })
      ]
    });
  });

  afterEach(function () {
    document.body.removeChild(target);
    map = null;
    target = null;
  });

  var STATE_ALL_OVERLAYS_VISIBLE = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":true,"indeterminate":false,"fold":"open","layers":[{"title":"Countries","visible":true,"indeterminate":false},{"title":"Census","visible":true,"indeterminate":false,"fold":"open","layers":[{"title":"Districts","visible":true,"indeterminate":false},{"title":"Wards","visible":true,"indeterminate":false}]}]}]}'
  );

  var STATE_ALL_OVERLAYS_HIDDEN = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":false,"indeterminate":false,"fold":"open","layers":[{"title":"Countries","visible":false,"indeterminate":false},{"title":"Census","visible":false,"indeterminate":false,"fold":"open","layers":[{"title":"Districts","visible":false,"indeterminate":false},{"title":"Wards","visible":false,"indeterminate":false}]}]}]}'
  );

  var STATE_CHILDREN_WARD_OVERLAY_HIDDEN = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":true,"indeterminate":true,"fold":"open","layers":[{"title":"Countries","visible":true,"indeterminate":false},{"title":"Census","visible":true,"indeterminate":true,"fold":"open","layers":[{"title":"Districts","visible":true,"indeterminate":false},{"title":"Wards","visible":false,"indeterminate":false}]}]}]}'
  );

  var STATE_CHILDREN_WARD_OVERLAY_VISIBLE = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":true,"indeterminate":true,"fold":"open","layers":[{"title":"Countries","visible":false,"indeterminate":false},{"title":"Census","visible":true,"indeterminate":true,"fold":"open","layers":[{"title":"Districts","visible":false,"indeterminate":false},{"title":"Wards","visible":true,"indeterminate":false}]}]}]}'
  );

  var STATE_GROUP_OVERLAYS_HIDDEN = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":false,"indeterminate":false,"fold":"open","layers":[{"title":"Countries","visible":true,"indeterminate":true},{"title":"Census","visible":true,"indeterminate":true,"fold":"open","layers":[{"title":"Districts","visible":true,"indeterminate":true},{"title":"Wards","visible":true,"indeterminate":true}]}]}]}'
  );

  var STATE_GROUP_WARD_OVERLAY_HIDDEN = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":true,"indeterminate":false,"fold":"open","layers":[{"title":"Countries","visible":true,"indeterminate":false},{"title":"Census","visible":true,"indeterminate":false,"fold":"open","layers":[{"title":"Districts","visible":true,"indeterminate":false},{"title":"Wards","visible":false,"indeterminate":false}]}]}]}'
  );

  var STATE_GROUP_WARD_OVERLAY_VISIBLE = JSON.parse(
    '{"title":"map","visible":true,"layers":[{"title":"Base maps","visible":true,"indeterminate":false,"layers":[{"title":"Water color with labels","visible":false,"indeterminate":false,"layers":[]},{"title":"Water color","visible":false,"indeterminate":false},{"title":"OSM","visible":true,"indeterminate":false}]},{"title":"Overlays","visible":false,"indeterminate":false,"fold":"open","layers":[{"title":"Countries","visible":false,"indeterminate":false},{"title":"Census","visible":false,"indeterminate":false,"fold":"open","layers":[{"title":"Districts","visible":false,"indeterminate":false},{"title":"Wards","visible":true,"indeterminate":true}]}]}]}'
  );

  var STATE_DOM_GROUP_WARD_OVERLAY_VISIBLE = JSON.parse(
    '[{"title":"Overlays","className":"group layer-switcher-fold layer-switcher-open","checked":false,"indeterminate":false,"type":"checkbox"},{"title":"Census","className":"group layer-switcher-fold layer-switcher-open","checked":false,"indeterminate":false,"type":"checkbox"},{"title":"Wards","className":"layer","checked":true,"indeterminate":true,"type":"checkbox"},{"title":"Districts","className":"layer","checked":false,"indeterminate":false,"type":"checkbox"},{"title":"Countries","className":"layer","checked":false,"indeterminate":false,"type":"checkbox"},{"title":"Base maps","className":"group layer-switcher-base-group"},{"title":"OSM","className":"layer","checked":true,"indeterminate":false,"type":"radio"},{"title":"Water color","className":"layer","checked":false,"indeterminate":false,"type":"radio"},{"title":"Water color with labels","className":"layer","checked":false,"indeterminate":false,"type":"radio"}]'
  );

  describe('groupSelectStyle none', function () {
    it("Doesn't render group checkboxes", function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'none'
      });
      map.addControl(switcher);
      jQuery('.group:not(.layer-switcher-base-group').each(function (
        idx,
        group
      ) {
        expect(includesTag(jQuery(group).children(), 'INPUT')).to.be(false);
      });
    });
    it('Adds a layer-switcher-group-select-style-none class to the control', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'none'
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain(
        'layer-switcher-group-select-style-none'
      );
    });
  });

  describe('groupSelectStyle children', function () {
    it('Renders group checkboxes', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'children'
      });
      map.addControl(switcher);
      jQuery('.group:not(.layer-switcher-base-group').each(function (
        idx,
        group
      ) {
        expect(includesTag(jQuery(group).children(), 'INPUT')).to.be(true);
      });
    });
    it('Hiding group hides children', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'children'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_VISIBLE);
      // Click the Overlays group checkbox
      jQuery('.layer-switcher label:contains("Overlays")')
        .siblings('input')
        .click();
      // All overlay groups and layers are hidden
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_HIDDEN);
    });
    it('Hiding child sets indeterminate of parents', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'children'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_VISIBLE);
      // Click the Wards group checkbox
      jQuery('.layer-switcher label:contains("Wards")')
        .siblings('input')
        .click();
      // Ward is hidden, Census is visible but indeterminate, Overlays is visible but indeterminate
      expectEqual(groupToJson(map), STATE_CHILDREN_WARD_OVERLAY_HIDDEN);
    });
    it('Showing child when all overlays are hidden shows parents and sets indeterminate', function () {
      var overlaysGrp = getLayerByTitle(map, 'Overlays');
      overlaysGrp.setVisible(false);
      LayerSwitcher.forEachRecursive(overlaysGrp, function (l, idx, a) {
        l.setVisible(false);
      });
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'children'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_HIDDEN);
      jQuery('.layer-switcher label:contains("Wards")')
        .siblings('input')
        .click();
      expectEqual(groupToJson(map), STATE_CHILDREN_WARD_OVERLAY_VISIBLE);
    });
    it('Adds a layer-switcher-group-select-style-children class to the control', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'children'
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain(
        'layer-switcher-group-select-style-children'
      );
    });
  });

  describe('groupSelectStyle group', function () {
    it('Renders group checkboxes', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'group'
      });
      map.addControl(switcher);
      jQuery('.group:not(.layer-switcher-base-group').each(function (
        idx,
        group
      ) {
        expect(includesTag(jQuery(group).children(), 'INPUT')).to.be(true);
      });
    });
    it('Hiding group does not affect child visibility but sets indeterminate', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'group'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_VISIBLE);
      // Click the Overlays group checkbox
      jQuery('.layer-switcher label:contains("Overlays")')
        .siblings('input')
        .click();
      // All overlay groups and layers are hidden
      expectEqual(groupToJson(map), STATE_GROUP_OVERLAYS_HIDDEN);
    });
    it('Hiding child has no effect on parents', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'group'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_VISIBLE);
      // Click the Wards group checkbox
      jQuery('.layer-switcher label:contains("Wards")')
        .siblings('input')
        .click();
      // Ward is hidden, Census is visible but indeterminate, Overlays is visible but indeterminate
      expectEqual(groupToJson(map), STATE_GROUP_WARD_OVERLAY_HIDDEN);
    });
    it('Showing child when all overlays are hidden makes child indeterminate and does not affect parents', function () {
      var overlaysGrp = getLayerByTitle(map, 'Overlays');
      overlaysGrp.setVisible(false);
      LayerSwitcher.forEachRecursive(overlaysGrp, function (l, idx, a) {
        l.setVisible(false);
      });
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'group'
      });
      map.addControl(switcher);
      expectEqual(groupToJson(map), STATE_ALL_OVERLAYS_HIDDEN);
      jQuery('.layer-switcher label:contains("Wards")')
        .siblings('input')
        .click();
      expectEqual(groupToJson(map), STATE_GROUP_WARD_OVERLAY_VISIBLE);
      expectEqual(
        domToJson(switcher.element),
        STATE_DOM_GROUP_WARD_OVERLAY_VISIBLE
      );
    });
    it('Adds a layer-switcher-group-select-style-group class to the control', function () {
      var switcher = new LayerSwitcher({
        groupSelectStyle: 'group'
      });
      map.addControl(switcher);
      expect(switcher.element.classList).to.contain(
        'layer-switcher-group-select-style-group'
      );
    });
  });

  describe('getGroupSelectStyle', function () {
    it("Returns provided value if it's valid", function () {
      expect(LayerSwitcher.getGroupSelectStyle('none')).to.be('none');
      expect(LayerSwitcher.getGroupSelectStyle('children')).to.be('children');
      expect(LayerSwitcher.getGroupSelectStyle('group')).to.be('group');
    });
    it('Returns default value if provided value is not valid', function () {
      expect(LayerSwitcher.getGroupSelectStyle('foo')).to.be('children');
    });
  });
});
