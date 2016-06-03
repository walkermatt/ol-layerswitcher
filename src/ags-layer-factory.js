define(["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
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
    class AgsLayerFactory {
        asExtent(appInfo) {
            // not defined?
        }
        // make the layer progress aware                                
        asEvented(layer) {
            let loadCount = 0;
            let source = layer.getSource();
            if (source.on && layer.dispatchEvent) {
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
            return layer;
        }
        asAgsLayer(layerInfo, appInfo) {
            switch (layerInfo.layerType) {
                case "ArcGISFeatureLayer":
                    return this.asEvented(this.asArcGISFeatureLayer(layerInfo, appInfo));
                case "ArcGISTiledMapServiceLayer":
                    return this.asEvented(this.asArcGISTiledMapServiceLayer(layerInfo, appInfo));
                default:
                    debugger;
                    break;
            }
        }
        asArcGISTiledMapServiceLayer(layerInfo, appInfo) {
            // doesn't seem to care about the projection
            let source = new ol.source.XYZ({
                url: layerInfo.url + '/tile/{z}/{y}/{x}',
                projection: layerInfo.spatialReference
            });
            let tileOptions = {
                id: layerInfo.id,
                title: layerInfo.title,
                type: 'base',
                visible: false,
                source: source
            };
            let layer = new ol.layer.Tile(tileOptions);
            return layer;
        }
        asArcGISFeatureLayer(layerInfo, appInfo) {
            // will want to support feature services at some point but just a demo so re-route to MapServer
            layerInfo.url = layerInfo.url.replace("FeatureServer", "MapServer");
            layerInfo.id = layerInfo.url.substring(1 + layerInfo.url.lastIndexOf("/"));
            layerInfo.url = layerInfo.url.substring(0, layerInfo.url.lastIndexOf("/"));
            let source = new ol.source.TileArcGISRest({
                url: layerInfo.url,
                params: {
                    layers: `show:${layerInfo.id}`
                }
            });
            let tileOptions = {
                id: layerInfo.id,
                title: layerInfo.title,
                visible: false,
                source: source
            };
            if (appInfo) {
                if (appInfo.minScale)
                    tileOptions.maxResolution = asRes(appInfo.minScale);
                if (appInfo.maxScale)
                    tileOptions.minResolution = asRes(appInfo.maxScale);
            }
            let layer = new ol.layer.Tile(tileOptions);
            return layer;
        }
    }
    return AgsLayerFactory;
});
