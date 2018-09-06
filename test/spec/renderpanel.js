describe('ol.control.LayerSwitcher.renderPanel', function() {
    var map, target, panel;

    beforeEach(function() {
        target = document.createElement('div');
        document.body.appendChild(target);
        panel = document.createElement('div');
        document.body.appendChild(panel);
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
                    title: 'Combined-Base-Group',
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
                // Group with no title (group and it's children should be ignored)
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
                new ol.layer.Tile({
                    title: 'Bar',
                    minResolution: 1000,
                    maxResolution: 5000,
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
                })
            ]
        });
    });

    afterEach(function() {
        document.body.removeChild(target);
        document.body.removeChild(panel);
        map = null;
        target = null;
        panel = null;
    });

    describe('Render to div', function() {
        it('creates the expected DOM elements', function() {
            ol.control.LayerSwitcher.renderPanel(map, panel);
            expect(jQuery('li.layer', panel).length).to.be(5);
            expect(jQuery('li.group', panel).length).to.be(1);
        });
    });

    describe('Overlay layer visibility', function() {
        it('Re-rendering reflects current layer state', function() {
            // Initial render
            ol.control.LayerSwitcher.renderPanel(map, panel);
            var input = getElmByTitle('Bar');
            // Assert the Bar layer is initially visible
            expect(input.checked).to.be(true);
            // Hide the layer
            var bar = getLayerByTitle('Bar');
            bar.setVisible(false);
            // Re-render to update layer tree
            ol.control.LayerSwitcher.renderPanel(map, panel);
            input = getElmByTitle('Bar');
            expect(input.checked).to.be(false);
        });
    });

    /*
    // TODO Should we make sure event listeners are unregistered?
    describe('Removes cleanly', function() {
        it('Removes cleanly when ol.Map#removeControl is called', function() {
            map.removeControl(switcher);
        });
    });
    */

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
     * Get the input associated with a layer by it's title
     */
    function getElmByTitle(name) {
        return jQuery('label:contains("' + name + '")', panel).siblings('input').get(0);
    }

});
