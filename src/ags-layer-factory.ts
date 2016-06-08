import ol = require("openlayers");
import {PortalForArcGis, WebMap} from "./ags-webmap";

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

class AgsLayerFactory {

    asExtent(appInfo: PortalForArcGis.WebMap) {
        // not defined?
    }

    // make the layer progress aware                                
    asEvented(layer: ol.layer.Tile) {
        let loadCount = 0;
        let source = layer.getSource();
        if (source.on && layer.dispatchEvent) {
            source.on("tileloadstart", () => {
                if (0 === loadCount++) layer.dispatchEvent("load:start");
                layer.set("loading", true);
            });
            source.on("tileloadend", () => {
                if (0 === --loadCount) layer.dispatchEvent("load:end");
                layer.set("loading", false);
            });
        }
        return layer;
    }

    asAgsLayer(layerInfo: PortalForArcGis.OperationalLayer, appInfo: PortalForArcGis.WebMap) {
        switch (layerInfo.layerType) {
            case "ArcGISFeatureLayer":
                if (layerInfo.featureCollection) return this.asFeatureCollection(layerInfo, appInfo);
                return this.asEvented(this.asArcGISFeatureLayer(layerInfo, appInfo));
            case "ArcGISTiledMapServiceLayer":
                return this.asEvented(this.asArcGISTiledMapServiceLayer(layerInfo, appInfo));
            default:
                debugger;
                break;
        }

    }

    asArcGISTiledMapServiceLayer(layerInfo: PortalForArcGis.BaseMapLayer, appInfo?: PortalForArcGis.WebMap) {

        // doesn't seem to care about the projection
        let srs = layerInfo.spatialReference || appInfo.spatialReference;
        let srsCode = srs && srs.latestWkid || "3857";

        let source = new ol.source.XYZ({
            url: layerInfo.url + '/tile/{z}/{y}/{x}',
            projection: `EPSG:${srsCode}`
        });

        let tileOptions: olx.layer.TileOptions = {
            id: layerInfo.id,
            title: layerInfo.title || layerInfo.id,
            type: 'base',
            visible: false,
            source: source
        };

        let layer = new ol.layer.Tile(tileOptions);

        return layer;
    }

    /**
     * Renders the features of the featureset (can be points, lines or polygons) into a feature layer
     */
    asFeatureCollection(layerInfo: PortalForArcGis.OperationalLayer, appInfo?: PortalForArcGis.WebMap) {
        let source = new ol.source.Vector();
        let layer = new ol.layer.Vector({
            title: layerInfo.id,
            source: source
        });

        // obviously we don't want everything to be red, there's all this still to consider....
        // layerInfo.featureCollection.layers[0].layerDefinition.drawingInfo.renderer.uniqueValueInfos[0].symbol.color;
        let style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: "red"
            })
        });

        layer.setStyle((feature: ol.Feature, resolution: number) => {
            debugger;
            return style;
        });

        layer.setVisible(true);
        layerInfo.featureCollection.layers.forEach(l => {
            switch (l.featureSet.geometryType) {
                case "esriGeometryPolygon":
                    let features = this.asEsriGeometryPolygon(l.featureSet);
                    debugger;
                    features.forEach(f => source.addFeature(f));
                    break;
            }
        });

        return layer;
    }

    /**
     * Creates a polygon feature from esri data
     */
    private asEsriGeometryPolygon(featureSet: PortalForArcGis.FeatureSet) {
        console.assert(featureSet.geometryType === "esriGeometryPolygon");
        return featureSet.features.map(f => new ol.Feature({
            attributes: f.attributes,
            geometry: new ol.geom.Polygon(f.geometry.rings)
        }));
    }

    asArcGISFeatureLayer(layerInfo: PortalForArcGis.OperationalLayer, appInfo?: PortalForArcGis.WebMap) {
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

        let tileOptions: olx.layer.TileOptions = {
            id: layerInfo.id,
            title: layerInfo.title,
            visible: false,
            source: source
        };

        if (appInfo) {
            if (appInfo.minScale) tileOptions.maxResolution = asRes(appInfo.minScale);
            if (appInfo.maxScale) tileOptions.minResolution = asRes(appInfo.maxScale);
        }

        let layer = new ol.layer.Tile(tileOptions);
        return layer;
    }

}

export = AgsLayerFactory;