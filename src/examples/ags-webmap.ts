import ol = require("openlayers");
import LayerSwitcher = require("../ol3-layerswitcher");
import WebMap = require("../extras/ags-webmap");
import AgsLayerFactory = require("../extras/ags-layer-factory");

export function run() {
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

    function webmap(options: {
        appid?: string;
        url?: string
    }) {
        let webmap = new WebMap.WebMap();

        let webmapGroup = new ol.layer.Group({
            title: "WebMap",
            visible: false,
            layers: []
        });
        map.addLayer(webmapGroup);

        options.url = options.url || `https://www.arcgis.com/sharing/rest/content/items/${options.appid}/data?f=json`;

        webmap.get(options.url).then(result => {

            if (result.baseMap) {
                let baseLayers = new ol.layer.Group({
                    title: "Basemap Layers",
                    visible: false,
                    layers: []
                });
                webmapGroup.getLayers().push(baseLayers);

                result.baseMap.baseMapLayers.forEach(l => {
                    let opLayer = agsLayerFactory.asArcGISTiledMapServiceLayer(l, result);
                    baseLayers.getLayers().push(opLayer);
                });

            }

            if (result.operationalLayers) {
                let opLayers = new ol.layer.Group({
                    title: "Operational Layers",
                    visible: false,
                    layers: []
                });
                webmapGroup.getLayers().push(opLayers);

                result.operationalLayers.forEach(l => {
                    let opLayer = agsLayerFactory.asAgsLayer(l, result);
                    opLayers.getLayers().push(opLayer);
                });
            }

        })

    }

    webmap({
        url: "http://infor1.maps.arcgis.com/sharing/rest/content/items/313b7327133f4802affee46893b4bec7/data?f=json"
    });

}