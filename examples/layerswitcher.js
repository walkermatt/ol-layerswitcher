define(["require", "exports", "openlayers", "../src/ol3-layerswitcher", "../src/ags-catalog", "../src/ags-webmap", "proj4"], function (require, exports, ol, LayerSwitcher, AgsDiscovery, WebMap, proj4) {
    "use strict";
    ol.proj.setProj4(proj4);
    /**
     * scale is units per pixel assuming a pixel is a certain size (0.028 cm or 1/90 inches)
     * resolution is how many
     */
    function asRes(scale, dpi = 90.71428571428572) {
        const inchesPerFoot = 12.0;
        const inchesPerMeter = (inchesPerFoot / ol.proj.METERS_PER_UNIT["ft"]); //39.37007874015748;
        const dotsPerUnit = dpi * inchesPerMeter;
        return scale / dotsPerUnit;
    }
    proj4.defs("EPSG:4269", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
    let map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Group({
                'title': 'Base maps',
                layers: [
                    new ol.layer.Group({
                        'title': 'OSM and Water Color',
                        'label-only': true,
                        layers: [
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
                                visible: false,
                                source: new ol.source.OSM()
                            })
                        ]
                    }),
                    new ol.layer.Group({
                        title: 'Satellite Views',
                        combine: false,
                        visible: false,
                        layers: [
                            new ol.layer.Tile({
                                title: 'Satellite',
                                type: 'base',
                                visible: false,
                                source: new ol.source.MapQuest({ layer: 'sat' })
                            }),
                            new ol.layer.Tile({
                                title: 'Hybrid',
                                type: 'base',
                                visible: false,
                                source: new ol.source.MapQuest({ layer: 'hyb' })
                            })
                        ]
                    }),
                    new ol.layer.Tile({
                        title: 'Roads',
                        type: 'base',
                        visible: true,
                        source: new ol.source.MapQuest({ layer: 'osm' })
                    })
                ]
            }),
            new ol.layer.Group({
                title: 'Overlays',
                layers: [
                    new ol.layer.Group({
                        title: "Countries",
                        layers: [
                            new ol.layer.Tile({
                                title: 'Countries',
                                source: new ol.source.TileWMS({
                                    url: 'http://demo.opengeo.org/geoserver/wms',
                                    params: { 'LAYERS': 'ne:ne_10m_admin_1_states_provinces_lines_shp' },
                                    serverType: 'geoserver'
                                })
                            })
                        ]
                    })
                ]
            })
        ],
        view: new ol.View({
            center: ol.proj.transform([-85, 35], 'EPSG:4326', 'EPSG:3857'),
            zoom: 6
        })
    });
    let layerSwitcher = new LayerSwitcher({
        openOnMouseOver: true
    });
    layerSwitcher.on("show-layer", (args) => {
        console.log("show layer:", args.layer.get("title"));
        if (args.layer.get("extent")) {
            let view = map.getView();
            let extent = args.layer.get("extent");
            let currentExtent = view.calculateExtent(map.getSize());
            if (!ol.extent.intersects(currentExtent, extent)) {
                view.fit(extent, map.getSize());
            }
        }
    });
    layerSwitcher.on("hide-layer", (args) => {
        console.log("hide layer:", args.layer.get("title"));
    });
    map.addControl(layerSwitcher);
    let rootGroup = new ol.layer.Group({
        title: "Sample Server One",
        visible: false,
        layers: []
    });
    map.addLayer(rootGroup);
    let service = new AgsDiscovery.Catalog(`${location.protocol === 'file:' ? 'http:' : location.protocol}//sampleserver1.arcgisonline.com/arcgis/rest/services`);
    service
        .about()
        .then(value => {
        false && value.services.filter(s => s.type === "FeatureServer").forEach(s => {
            service.aboutFeatureServer(s.name).then(s => console.log("featureServer", s));
        });
        false && value.services.filter(s => s.type === "MapServer").forEach(s => {
            service.aboutMapServer(s.name).then(s => console.log("MapServer", s));
        });
        let addFolders = (group, folders) => {
            folders.forEach(f => {
                let folderGroup = new ol.layer.Group({
                    title: f,
                    visible: false,
                    layers: []
                });
                service.aboutFolder(f).then(folderInfo => {
                    let folders = folderInfo.folders;
                    let services = folderInfo.services.filter(serviceInfo => serviceInfo.type === "MapServer");
                    if (!folders.length && !services.length)
                        return;
                    rootGroup.getLayers().push(folderGroup);
                    addFolders(folderGroup, folders);
                    services.forEach(serviceInfo => {
                        let p = service.aboutMapServer(serviceInfo.name);
                        p.then(s => {
                            let inSrs = "EPSG:4326";
                            let extent = null;
                            [s.initialExtent, s.fullExtent].some(agsExtent => {
                                let olExtent = ol.proj.transformExtent([agsExtent.xmin, agsExtent.ymin, agsExtent.xmax, agsExtent.ymax], inSrs, 'EPSG:3857');
                                // not always valid!
                                if (olExtent.every(v => !isNaN(v))) {
                                    extent = olExtent;
                                    return true;
                                }
                            });
                            if (s.spatialReference) {
                                if (s.spatialReference.wkid) {
                                    inSrs = `EPSG:${s.spatialReference.wkid}`;
                                }
                                if (s.spatialReference.wkt) {
                                    inSrs = proj4.Proj(s.spatialReference.wkt).srsCode;
                                    proj4.defs(inSrs, s.spatialReference.wkt);
                                }
                            }
                            if (s.singleFusedMapCache) {
                                let source = new ol.source.XYZ({
                                    url: p.url
                                });
                                let tileOptions = {
                                    id: serviceInfo.name,
                                    title: serviceInfo.name,
                                    type: 'base',
                                    visible: false,
                                    extent: extent,
                                    source: source
                                };
                                let layer = new ol.layer.Tile(tileOptions);
                                folderGroup.getLayers().push(layer);
                            }
                            else {
                                s.layers.forEach(layerInfo => {
                                    let source = new ol.source.TileArcGISRest({
                                        url: p.url,
                                        params: {
                                            layers: `show:${layerInfo.id}`
                                        }
                                    });
                                    let tileOptions = {
                                        id: `${serviceInfo.name}/${layerInfo.id}`,
                                        title: layerInfo.name,
                                        visible: false,
                                        extent: extent,
                                        source: source
                                    };
                                    if (layerInfo.minScale)
                                        tileOptions.maxResolution = asRes(layerInfo.minScale);
                                    if (layerInfo.maxScale)
                                        tileOptions.minResolution = asRes(layerInfo.maxScale);
                                    let layer = new ol.layer.Tile(tileOptions);
                                    folderGroup.getLayers().push(layer);
                                    // make the layer progress aware                                
                                    {
                                        let loadCount = 0;
                                        source.on("tileloadstart", () => {
                                            if (0 === loadCount++)
                                                layer.dispatchEvent("load:start");
                                            layer.set("loading", true);
                                        });
                                        source.on("tileloadend", () => {
                                            if (0 === --loadCount)
                                                layer.dispatchEvent("load:end");
                                            layer.set("loading", false);
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        };
        addFolders(rootGroup, value.folders);
    });
    let webmap = new WebMap.WebMap();
    webmap.get().then(result => {
        debugger;
        console.log(result.layers);
    });
});
