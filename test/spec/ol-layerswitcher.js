describe('ol.control.LayerSwitcher', function () {
  var map, target, switcher;

  beforeEach(function () {
    target = document.createElement('div');
    document.body.appendChild(target);
    switcher = new ol.control.LayerSwitcher();
    map = new ol.Map({
      target: target,
      layers: [
        new ol.layer.Group({
          title: 'Base-Group',
          fold: 'open',
          layers: [
            new ol.layer.Tile({
              title: 'Foo',
              type: 'base',
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
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        // Combined base group
        new ol.layer.Group({
          title: 'Combined-Base-Layer',
          type: 'base',
          combine: true,
          layers: [
            new ol.layer.Tile({
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            }),
            new ol.layer.Tile({
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        // Combined overlay group
        new ol.layer.Group({
          title: 'Combined-Overlay-Group',
          type: 'overlay',
          combine: true,
          layers: [
            new ol.layer.Tile({
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            }),
            new ol.layer.Tile({
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        // Group with no title (group and its children should be ignored)
        new ol.layer.Group({
          layers: [
            new ol.layer.Tile({
              title: 'Never shown',
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            }),
            new ol.layer.Tile({
              source: new ol.source.TileDebug({
                projection: 'EPSG:3857',
                tileGrid: ol.tilegrid.createXYZ({
                  maxZoom: 22
                })
              })
            })
          ]
        }),
        // Top-level layer not in a group
        new ol.layer.Tile({
          title: 'Bar',
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        }),
        // Layer with no title (should be ignored)
        new ol.layer.Tile({
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        }),
        new ol.layer.Tile({
          title: 'MinMaxRes',
          minResolution: 1000,
          maxResolution: 5000,
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        }),
        new ol.layer.Tile({
          title: 'MinMaxZoom',
          minZoom: 12,
          maxZoom: 14,
          source: new ol.source.TileDebug({
            projection: 'EPSG:3857',
            tileGrid: ol.tilegrid.createXYZ({
              maxZoom: 22
            })
          })
        })
      ],
      controls: [switcher]
    });
  });

  afterEach(function () {
    document.body.removeChild(target);
    switcher = null;
    map = null;
    target = null;
  });

  describe('DOM creation', function () {
    it('creates the expected DOM elements', function () {
      expect(jQuery('.layer-switcher').length).to.be(1);
    });
  });

  describe('Show and hide', function () {
    it('is initially hidden by default', function () {
      expect(jQuery('.layer-switcher').hasClass('.shown')).to.be(false);
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
    });
    it('is shown on button click', function () {
      jQuery('.layer-switcher button').click();
      expect(jQuery('.layer-switcher.shown').length).to.be(1);
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
    });
    it('is hidden on map click', function () {
      jQuery('#map').click();
      expect(jQuery('.layer-switcher').hasClass('.shown')).to.be(false);
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
    });
  });

  describe('Layer list', function () {
    it('displays all layers with a title in reverse order', function () {
      switcher.showPanel();
      var titles = jQuery('.layer-switcher label')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(titles).to.eql([
        'MinMaxZoom',
        'MinMaxRes',
        'Bar',
        'Combined-Overlay-Group',
        'Combined-Base-Layer',
        'Base-Group',
        'Too',
        'Foo'
      ]);
    });
    it('only displays layers with a title', function () {
      switcher.showPanel();
      var elmTitles = jQuery('.layer-switcher label')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      var lyrsWithTitle = shownLyrs(map);
      expect(lyrsWithTitle.length).to.eql(elmTitles.length);
    });
    it("don't display layers without a title", function () {
      switcher.showPanel();
      // This is basically to ensure that our test layers include layers without a title
      var lyrsWithoutTitle = _.filter(allLyrs(map), function (lyr) {
        return !lyr.get('title');
      });
      expect(lyrsWithoutTitle.length).not.to.equal(0);
    });
    it('displays normal layers as checkbox', function () {
      switcher.showPanel();
      var titles = jQuery('.layer-switcher input[type=checkbox]')
        .siblings('label')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(titles).to.eql(['MinMaxZoom', 'MinMaxRes', 'Bar', 'Combined-Overlay-Group']);
    });
    it('greys out normal layer title label when resolution greater than maxResolution', function () {
      map.getView().setResolution(6000);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxRes');
    });
    it('greys out normal layer title label when resolution equals maxResolution', function () {
      map.getView().setResolution(5000);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxRes');
    });
    it('greys out normal layer title label when resolution less than minResolution', function () {
      map.getView().setResolution(500);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxRes');
    });
    it('greys out normal layer title label when zoom greater than maxZoom', function () {
      map.getView().setZoom(15);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxZoom');
    });
    it('greys out normal layer title label when zoom less than minZoom', function () {
      map.getView().setZoom(11);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxZoom');
    });
    it('greys out normal layer title label when zoom equal to minZoom', function () {
      map.getView().setZoom(12);
      switcher.showPanel();
      var disabledLayers = jQuery('.layer-switcher label.disabled')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(disabledLayers).to.contain('MinMaxZoom');
    });
    it('displays base layers as radio buttons', function () {
      switcher.showPanel();
      var titles = jQuery('.layer-switcher input[type=radio]')
        .siblings('label')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(titles).to.eql(['Combined-Base-Layer', 'Too', 'Foo']);
    });
    it('should display uncombined groups without an input', function () {
      switcher.showPanel();
      var groups = jQuery('.layer-switcher label:not([for])');
      var titles = groups
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(titles).to.eql(['Base-Group']);
      expect(groups.siblings('input').length).to.be(0);
    });
    it('should display combined groups with an input', function () {
      switcher.showPanel();
      var titles = jQuery('.layer-switcher label[for]')
        .map(function () {
          return jQuery(this).text();
        })
        .get();
      expect(titles).to.contain('Combined-Base-Layer');
      expect(titles).to.contain('Combined-Overlay-Group');
    });
    it('should display combined groups without sub layers', function () {
      switcher.showPanel();
      var groups = jQuery('.layer-switcher label[for]');
      expect(groups.siblings('ul').length).to.be(0);
    });
  });

  describe('Overlay layer visibility', function () {
    it('Toggles overlay layer visibility on click', function () {
      switcher.showPanel();
      var bar = getLayerByTitle(map, 'Bar');
      bar.setVisible(true);
      jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
      expect(bar.getVisible()).to.be(false);
      expect(
        jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0)
          .checked
      ).to.be(bar.getVisible());
      bar.setVisible(false);
      jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
      expect(bar.getVisible()).to.be(true);
      expect(
        jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0)
          .checked
      ).to.be(bar.getVisible());
    });
  });

  describe('Base layer visibility', function () {
    it('Only one base layer is visible after renderPanel', function () {
      var foo = getLayerByTitle(map, 'Foo');
      var too = getLayerByTitle(map, 'Too');
      var cbg = getLayerByTitle(map, 'Combined-Base-Layer');
      var baseLayers = [foo, too, cbg];
      // Enable all base layers
      _.forEach(baseLayers, function (l) {
        l.setVisible(true);
      });

      switcher.renderPanel();
      var visibleBaseLayerCount = _.countBy(baseLayers, function (l) {
        return l.getVisible();
      });
      expect(visibleBaseLayerCount.true).to.be(1);
    });
    it('Only top most base layer is visible after renderPanel if more than one is visible', function () {
      var foo = getLayerByTitle(map, 'Foo');
      var too = getLayerByTitle(map, 'Too');
      var cbg = getLayerByTitle(map, 'Combined-Base-Layer');
      var baseLayers = [foo, too, cbg];
      // Enable all base layers
      _.forEach(baseLayers, function (l) {
        l.setVisible(true);
      });
      switcher.renderPanel();
      expect(foo.getVisible()).to.be(false);
      expect(
        jQuery('.layer-switcher label:contains("Foo")').siblings('input').get(0)
          .checked
      ).to.be(false);
      expect(too.getVisible()).to.be(false);
      expect(
        jQuery('.layer-switcher label:contains("Too")').siblings('input').get(0)
          .checked
      ).to.be(false);
      expect(cbg.getVisible()).to.be(true);
      expect(
        jQuery('.layer-switcher label:contains("Combined-Base-Layer")').siblings('input').get(0)
          .checked
      ).to.be(true);
    });
    it('Clicking on unchecked base layer shows it', function () {
      var too = getLayerByTitle(map, 'Too');
      too.setVisible(false);
      switcher.renderPanel();
      jQuery('.layer-switcher label:contains("Too")').siblings('input').click();
      expect(too.getVisible()).to.be(true);
      expect(
        jQuery('.layer-switcher label:contains("Too")').siblings('input').get(0)
          .checked
      ).to.be(true);
    });
    it('Clicking on checked base layer does not change base layer', function () {
      var foo = getLayerByTitle(map, 'Foo');
      foo.setVisible(true);
      switcher.renderPanel();
      jQuery('.layer-switcher label:contains("Foo")').siblings('input').click();
      expect(foo.getVisible()).to.be(true);
      expect(
        jQuery('.layer-switcher label:contains("Foo")').siblings('input').get(0)
          .checked
      ).to.be(true);
    });
  });

  describe('Folding', function () {
    it('Child layers shown when group has fold: open', function () {
      var baseGroup = getLayerByTitle(map, 'Base-Group');
      baseGroup.set('fold', 'open');
      switcher.renderPanel();
      jQuery('.layer-switcher button').click();
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
      var baseGroupLi = jQuery(
        ".layer-switcher label:contains('Base-Group')"
      ).parent();
      expect(baseGroupLi.hasClass('layer-switcher-fold')).to.be(true);
      expect(baseGroupLi.hasClass('layer-switcher-open')).to.be(true);
      expect(baseGroupLi.hasClass('layer-switcher-close')).to.be(false);
      // Determining if the content is visible or not is difficult as we simply set the
      // height of the ul containing the child layers to 0 so jQuery's :hidden
      // selector doesn't consider the element or it's children hidden even though
      // they are not visible to the user. Here I'm using offsetHeight as suggested
      // by https://davidwalsh.name/offsetheight-visibility
      expect(baseGroupLi.find('ul').get(0).offsetHeight).to.be.greaterThan(0);
    });
    it('Child layers hidden when group has fold: close', function () {
      var baseGroup = getLayerByTitle(map, 'Base-Group');
      baseGroup.set('fold', 'close');
      switcher.renderPanel();
      jQuery('.layer-switcher button').click();
      expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
      var baseGroupLi = jQuery(
        ".layer-switcher label:contains('Base-Group')"
      ).parent();
      expect(baseGroupLi.hasClass('layer-switcher-fold')).to.be(true);
      expect(baseGroupLi.hasClass('layer-switcher-open')).to.be(false);
      expect(baseGroupLi.hasClass('layer-switcher-close')).to.be(true);
      // See above comment on use of offsetHeight
      expect(baseGroupLi.find('ul').get(0).offsetHeight).to.be(0);
    });
  });

  describe('Removes cleanly', function () {
    it('Removes cleanly when ol.Map#removeControl is called', function () {
      map.removeControl(switcher);
    });
  });
});
