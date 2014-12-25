describe('ol.control.LayerSwitcher', function() {
    var map, target, switcher;

    beforeEach(function() {
        target = document.createElement('div');
        document.body.appendChild(target);
        switcher = new ol.control.LayerSwitcher();
        map = new ol.Map({
            target: target,
            layers: [
                new ol.layer.Group({
                title: 'Base',
                layers: [
                    new ol.layer.Tile({
                        title: 'Foo',
                        type: 'base',
                        source: new ol.source.TileDebug({
                            projection: 'EPSG:3857',
                            tileGrid: new ol.tilegrid.XYZ({
                                maxZoom: 22
                            })
                        })
                    }),
                    new ol.layer.Tile({
                        title: 'Too',
                        type: 'base',
                        source: new ol.source.TileDebug({
                            projection: 'EPSG:3857',
                            tileGrid: new ol.tilegrid.XYZ({
                                maxZoom: 22
                            })
                        })
                    })
                ]
            }),
            // Group with no title (group and it's children should be ignored)
            new ol.layer.Group({
                layers: [
                    new ol.layer.Tile({
                        title: 'Never shown',
                        source: new ol.source.TileDebug({
                            projection: 'EPSG:3857',
                            tileGrid: new ol.tilegrid.XYZ({
                                maxZoom: 22
                            })
                        })
                    }),
                    new ol.layer.Tile({
                        source: new ol.source.TileDebug({
                            projection: 'EPSG:3857',
                            tileGrid: new ol.tilegrid.XYZ({
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
                    tileGrid: new ol.tilegrid.XYZ({
                        maxZoom: 22
                    })
                })
            }),
            // Layer with no title (should be ignored)
            new ol.layer.Tile({
                source: new ol.source.TileDebug({
                    projection: 'EPSG:3857',
                    tileGrid: new ol.tilegrid.XYZ({
                        maxZoom: 22
                    })
                })
            })
            ],
            controls: [switcher]
        });
    });

    afterEach(function() {
        document.body.removeChild(target);
        switcher = null;
        map = null;
        target = null;
    });

    describe('DOM creation', function() {
        it('creates the expected DOM elements', function() {
            expect(jQuery('.layer-switcher').length).to.be(1);
        });
    });

    describe('Show and hide', function() {
        it('is initially hidden', function() {
            expect(jQuery('.layer-switcher').hasClass('.shown')).to.be(false);
            expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
        });
        it('is shown on button click', function() {
            jQuery('.layer-switcher button').click();
            expect(jQuery('.layer-switcher.shown').length).to.be(1);
            expect(jQuery('.layer-switcher .panel:visible').length).to.be(1);
        });
        it('is hidden on map click', function() {
            jQuery('#map').click();
            expect(jQuery('.layer-switcher').hasClass('.shown')).to.be(false);
            expect(jQuery('.layer-switcher .panel:visible').length).to.be(0);
        });
    });

    describe('Layer list', function() {
        it('displays all layers with a title in reverse order', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher label').map(function() {
                return jQuery(this).text();
            }).get();
            expect(titles).to.eql(['Bar', 'Base', 'Too', 'Foo']);
        });
        it('only displays layers with a title', function() {
            switcher.showPanel();
            var elmTitles = jQuery('.layer-switcher label').map(function() {
                return jQuery(this).text();
            }).get();
            var lyrsWithTitle = shownLyrs(map.getLayerGroup());
            expect(lyrsWithTitle.length).to.eql(elmTitles.length);
        });
        it('don\'t display layers without a title', function() {
            switcher.showPanel();
            // This is basically to ensure that our test layers include layers without a title
            var lyrsWithoutTitle = _.filter(allLyrs(map.getLayerGroup()), function(lyr) {return !lyr.get('title')});
            expect(lyrsWithoutTitle.length).not.to.equal(0);
        });
        it('displays normal layers as checkbox', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher input[type=checkbox]').siblings('label').map(function() {
                return jQuery(this).text();
            }).get();
            expect(titles).to.eql(['Bar']);
        });
        it('displays base layers as radio buttons', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher input[type=radio]').siblings('label').map(function() {
                return jQuery(this).text();
            }).get();
            expect(titles).to.eql(['Too', 'Foo']);
        });
        it('should display groups without an input', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher label:not([for])').map(function() {
                return jQuery(this).text();
            }).get();
            expect(titles).to.eql(['Base']);
            expect(jQuery('.layer-switcher label:not([for])').siblings('input').length).to.be(0);
        });
    });

    describe('Overlay layer visibility', function() {
        it('Toggles overlay layer visibility on click', function() {
            switcher.showPanel();
            var bar = getLayerByTitle('Bar');
            bar.setVisible(true);
            jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
            expect(bar.getVisible()).to.be(false);
            expect(jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0).checked).to.be(bar.getVisible());
            bar.setVisible(false)
            jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
            expect(bar.getVisible()).to.be(true);
            expect(jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0).checked).to.be(bar.getVisible());
        });
    });

    describe('Base layer visibility', function() {
        it('Only one base layer is visible after renderPanel', function() {
            var foo = getLayerByTitle('Foo');
            var too = getLayerByTitle('Too');
            // Enable both base layers
            foo.setVisible(true);
            too.setVisible(true);
            switcher.renderPanel();
            var visibleBaseLayerCount = ((too.getVisible()) ? 1 : 0) + ((foo.getVisible()) ? 1 : 0);
            expect(visibleBaseLayerCount).to.be(1);
        });
        it('Only top most base layer is visible after renderPanel if more than one is visible', function() {
            var foo = getLayerByTitle('Foo');
            var too = getLayerByTitle('Too');
            // Enable both base layers
            foo.setVisible(true);
            too.setVisible(true);
            switcher.renderPanel();
            expect(too.getVisible()).to.be(true);
        });
        it('Clicking on unchecked base layer shows it', function() {
            var too = getLayerByTitle('Too');
            too.setVisible(false);
            switcher.renderPanel();
            jQuery('.layer-switcher label:contains("Too")').siblings('input').click();
            expect(too.getVisible()).to.be(true);
            expect(jQuery('.layer-switcher label:contains("Too")').siblings('input').get(0).checked).to.be(true);
        });
        it('Clicking on checked base layer does not change base layer', function() {
            var foo = getLayerByTitle('Foo');
            foo.setVisible(true);
            switcher.renderPanel();
            jQuery('.layer-switcher label:contains("Foo")').siblings('input').click();
            expect(foo.getVisible()).to.be(true);
            expect(jQuery('.layer-switcher label:contains("Foo")').siblings('input').get(0).checked).to.be(true);
        });
    });

    describe('Removes cleanly', function() {
        it('Removes cleanly when ol.Map#removeControl is called', function() {
            map.removeControl(switcher);
        });
    });

    /**
     * Returns the title of a given layer or null if lyr is falsey
     */
    function lyrTitle(lyr) {
        return (lyr) ? lyr.get('title') : null;
    }

    /**
     * Returns the Layer instance that has the given title
     */
    function getLayerByTitle(title) {
        var layer = null;
        ol.control.LayerSwitcher.forEachRecursive(map, function(lyr) {
            if (lyr.get('title') && lyr.get('title') === title) {
                layer = lyr;
                return;
            }
        });
        return layer;
    }

    /**
     * Return a flattened Array of all layers regardless including those not
     * shown by the LayerSwitcher
     */
    function allLyrs(lyrs) {
        return flatten(lyrs, function (lyr) {
            return (lyr.getLayers) ? lyr.getLayers().getArray() : lyr;
        });
    }

    /**
     * Return a flattened Array of only those layers that the LayerSwitcher
     * should show
     */
    function shownLyrs(lyrs) {
        // Pass in the Array from the root LayerGroup as it doesn't have a
        // title but we don't want to filter out all layers
        lyrs = lyrs.getLayers().getArray();
        var flat = flatten(lyrs, function (lyr) {
            // Return a Groups layer array only if the group has a title
            // otherwise just return the group so that it's children will be
            // skipped
            return (lyr.getLayers && lyr.get('title')) ? lyr.getLayers().getArray() : lyr;
        });
        // Only return layers with a title
        return _.filter(flat, lyrTitle);
    }

    /**
     * Flattens a given nested collection using the provided function getArray
     * to get an Array of the collections children.
     */
    function flatten(srcCollection, getArray) {
        getArray = getArray || function (item) {return item};
        var src = getArray(srcCollection),
            dest = [];
        for (var i = 0, item; i < src.length; i++) {
            item = src[i];
            dest = dest.concat(item);
            if (_.isArray(getArray(item))) {
                dest = dest.concat(flatten(item, getArray));
            }
        }
        return dest;
    }

});
