describe('ol.control.LayerSwitcher - Two maps', function() {
    var map1, map2, target1, target2, switcher1, switcher2;

    beforeEach(function() {
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
            new ol.layer.Tile({
                title: 'Bar',
                source: new ol.source.TileDebug({
                    projection: 'EPSG:3857',
                    tileGrid: ol.tilegrid.createXYZ({
                        maxZoom: 22
                    })
                })
            }),
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
            new ol.layer.Tile({
                title: 'Bar',
                source: new ol.source.TileDebug({
                    projection: 'EPSG:3857',
                    tileGrid: ol.tilegrid.createXYZ({
                        maxZoom: 22
                    })
                })
            }),
            ],
            controls: [switcher2]
        });
    });

    afterEach(function() {
        document.body.removeChild(target1);
        document.body.removeChild(target2);
        target1 = null;
        target2 = null;
        switcher1 = null;
        switcher2 = null;
        map1 = null;
        map2 = null;
    });

    describe('Layer IDs are unique', function() {
        it('Inputs for layers with the same title in different maps will have different IDs', function() {
            switcher1.showPanel();
            switcher2.showPanel();
            var bar1Id = jQuery('#map1 .layer-switcher label:contains("Bar")').siblings('input').attr('id');
            var bar2Id = jQuery('#map2 .layer-switcher label:contains("Bar")').siblings('input').attr('id');
            expect(bar1Id).to.not.equal(bar2Id);
        });
    });

    /**
     * Returns the Layer instance that has the given title
     */
    function getLayerByTitle(map, title) {
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
