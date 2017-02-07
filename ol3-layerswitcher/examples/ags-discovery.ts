import ol = require("openlayers");
import { LayerSwitcher } from "../ol3-layerswitcher";
import AgsDiscovery = require("../extras/ags-catalog");
import WebMap = require("./ags-webmap");
import proj4 = require("proj4");
import AgsLayerFactory = require("../extras/ags-layer-factory");

export function run() {
    ol.proj.setProj4(proj4);

    /**
     * scale is units per pixel assuming a pixel is a certain size (0.028 cm or 1/90 inches)
     * resolution is how many 
     */
    function asRes(scale: number, dpi = 90.71428571428572) {
        const inchesPerFoot = 12.0;
        const inchesPerMeter = (inchesPerFoot / ol.proj.METERS_PER_UNIT["ft"]); //39.37007874015748;
        const dotsPerUnit = dpi * inchesPerMeter;
        return scale / dotsPerUnit;
    }

    proj4.defs("EPSG:4269", "+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");

    let agsLayerFactory = new AgsLayerFactory();

    let map = new ol.Map({
        target: 'map',
        layers: [],
        view: new ol.View({
            center: ol.proj.transform([-85, 35], 'EPSG:4326', 'EPSG:3857'),
            zoom: 6
        })
    });

    let layerSwitcher = new LayerSwitcher(<any>{
        openOnMouseOver: true
    });

    layerSwitcher.on("show-layer", (args: { layer: ol.layer.Base }) => {
        console.log("show layer:", args.layer.get("title"));
        if (args.layer.get("extent")) {
            let view = map.getView();
            let extent = <ol.Extent>args.layer.get("extent");
            let currentExtent = view.calculateExtent(map.getSize());
            if (!ol.extent.intersects(currentExtent, extent)) {
                view.fit(extent, map.getSize());
            }
        }
    });

    layerSwitcher.on("hide-layer", (args: { layer: ol.layer.Base }) => {
        console.log("hide layer:", args.layer.get("title"));
    });

    map.addControl(layerSwitcher);

    function discover(url: string) {

        let rootGroup = new ol.layer.Group({
            title: "sampleserver1",
            visible: false,
            layers: []
        });
        map.addLayer(rootGroup);

        let service = new AgsDiscovery.Catalog(`${location.protocol === 'file:' ? 'http:' : location.protocol}${url}`);
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
                                    let inSrs = "EPSG:4326";
                                    let extent: number[] = null;

                                    [s.initialExtent, s.fullExtent].some(agsExtent => {
                                        let olExtent = ol.proj.transformExtent([agsExtent.xmin, agsExtent.ymin, agsExtent.xmax, agsExtent.ymax],
                                            inSrs, 'EPSG:3857');
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
                                        let layer = agsLayerFactory.asArcGISTiledMapServiceLayer({
                                            id: serviceInfo.name,
                                            layerType: "ArcGISTiledMapServiceLayer",
                                            url: p.url,
                                            visibility: false,
                                            opacity: 1,
                                            title: serviceInfo.name,
                                            spatialReference: inSrs
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

                                            let tileOptions: olx.layer.TileOptions = {
                                                id: `${serviceInfo.name}/${layerInfo.id}`,
                                                title: layerInfo.name,
                                                visible: false,
                                                extent: extent,
                                                source: source
                                            };

                                            if (layerInfo.minScale) tileOptions.maxResolution = asRes(layerInfo.minScale);
                                            if (layerInfo.maxScale) tileOptions.minResolution = asRes(layerInfo.maxScale);

                                            let layer = new ol.layer.Tile(tileOptions);
                                            folderGroup.getLayers().push(layer);

                                            // make the layer progress aware                                
                                            {
                                                let loadCount = 0;
                                                source.on("tileloadstart", () => {
                                                    if (0 === loadCount++) layer.dispatchEvent("load:start");
                                                    layer.set("loading", true);
                                                });
                                                source.on("tileloadend", () => {
                                                    if (0 === --loadCount) layer.dispatchEvent("load:end");
                                                    layer.set("loading", false);
                                                });
                                            }

                                        })
                                    }
                                });
                            });

                        });
                    })
                };

                addFolders(rootGroup, value.folders);

            });

    }


    discover("//sampleserver1.arcgisonline.com/arcgis/rest/services");
}