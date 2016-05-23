import ol = require("openlayers");
import LayerSwitcher = require("../src/ol3-layerswitcher");
import AgsDiscovery = require("../src/ags-catalog");

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

let layerSwitcher = new LayerSwitcher();

layerSwitcher.on("show-layer", (args: { layer: ol.layer.Base }) => {
    console.log("show layer:", args.layer.get("title"));
    if (args.layer.get("extent")) {
        let extent = <ol.Extent>args.layer.get("extent");        
        map.getView().setCenter(ol.extent.getCenter(extent));
    }
});

layerSwitcher.on("hide-layer", (args: { layer: ol.layer.Base }) => {
    console.log("hide layer:", args.layer.get("title"));
});

map.addControl(layerSwitcher);

let rootGroup = new ol.layer.Group({
    title: "Sample Server One",
    visible: false,
    layers: []
});
map.addLayer(rootGroup);

let service = new AgsDiscovery.Catalog('http://sampleserver1.arcgisonline.com/arcgis/rest/services');
service
    .about()
    .then(value => {

        false && value.services.filter(s => s.type === "FeatureServer").forEach(s => {
            service.aboutFeatureServer(s.name).then(s => console.log("featureServer", s));
        });

        false && value.services.filter(s => s.type === "MapServer").forEach(s => {
            service.aboutMapServer(s.name).then(s => console.log("MapServer", s));
        });

        let addFolders = (group: ol.layer.Group, folders: string[]) => {
            folders.forEach(f => {

                let folderGroup = new ol.layer.Group({
                    title: f,
                    visible: false,
                    layers: []
                });

                service.aboutFolder(f).then(folderInfo => {

                    let folders = folderInfo.folders;
                    let services = folderInfo.services.filter(serviceInfo => serviceInfo.type === "MapServer");

                    if (!folders.length && !services.length) return;

                    rootGroup.getLayers().push(folderGroup);

                    addFolders(folderGroup, folders);

                    services.forEach(serviceInfo => {
                        let p = service.aboutMapServer(serviceInfo.name);
                        p.then(s => {
                            let extent = ol.proj.transformExtent([s.fullExtent.xmin, s.fullExtent.ymin, s.fullExtent.xmax, s.fullExtent.ymax], 'EPSG:4326', 'EPSG:3857');

                            if (s.singleFusedMapCache) {
                                let source = new ol.source.XYZ({
                                    url: p.url
                                });

                                let layer = new ol.layer.Tile({
                                    id: serviceInfo.name,
                                    title: serviceInfo.name,
                                    type: 'base',
                                    visible: false,
                                    extent: extent,
                                    source: source
                                });
                                folderGroup.getLayers().push(layer);

                            } else {
                                s.layers.forEach(layerInfo => {
                                    let source = new ol.source.TileArcGISRest({
                                        url: p.url,
                                        params: {
                                            layers: `show:${layerInfo.id}`
                                        }
                                    });

                                    let layer = new ol.layer.Tile({
                                        id: `${serviceInfo.name}/${layerInfo.id}`,
                                        title: layerInfo.name,
                                        visible: false,
                                        extent: extent,
                                        source: source
                                    });
                                    folderGroup.getLayers().push(layer);
                                })
                            }
                        });
                    });

                });
            })
        };

        addFolders(rootGroup, value.folders);

    });
