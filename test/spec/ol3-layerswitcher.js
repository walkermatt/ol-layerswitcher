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
            new ol.layer.Tile({
                title: 'Bar',
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
                return jQuery(this).text()
            }).get();
            expect(titles).to.eql(['Bar', 'Base', 'Too', 'Foo']);
        });
        it('displays normal layers as checkbox', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher input[type=checkbox]').siblings('label').map(function() {
                return jQuery(this).text()
            }).get();
            expect(titles).to.eql(['Bar']);
        });
        it('displays base layers as radio buttons', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher input[type=radio]').siblings('label').map(function() {
                return jQuery(this).text()
            }).get();
            expect(titles).to.eql(['Too', 'Foo']);
        });
        it('should display groups without an input', function() {
            switcher.showPanel();
            var titles = jQuery('.layer-switcher label:not([for])').map(function() {
                return jQuery(this).text()
            }).get();
            expect(titles).to.eql(['Base']);
            expect(jQuery('.layer-switcher label:not([for])').siblings('input').length).to.be(0);
        });
    });

    describe('Layer visibility', function() {
        it('Toggles layer visibility on click', function() {
            var bar = getLayerByTitle('Bar');
            jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
            expect(jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0).checked).to.be(bar.getVisible());
            jQuery('.layer-switcher label:contains("Bar")').siblings('input').click();
            expect(jQuery('.layer-switcher label:contains("Bar")').siblings('input').get(0).checked).to.be(bar.getVisible());
        });
    });

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

});
