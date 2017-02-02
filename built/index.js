define("ol3-layerswitcher", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    /**
     * assigns undefined values
     */
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    /**
     * NodeList -> array
     */
    function asArray(list) {
        let result = new Array(list.length);
        for (let i = 0; i < list.length; i++) {
            result.push(list[i]);
        }
        return result;
    }
    /**
     * Creates an array containing all sub-layers
     */
    function allLayers(lyr) {
        let result = [];
        lyr.getLayers().forEach(function (lyr, idx, a) {
            result.push(lyr);
            if ("getLayers" in lyr) {
                result = result.concat(allLayers(lyr));
            }
        });
        return result;
    }
    /**
     * Generate a UUID
     * @returns UUID
     *
     * Adapted from http://stackoverflow.com/a/2117523/526860
     */
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    const DEFAULT_OPTIONS = {
        tipLabel: 'Layers',
        openOnMouseOver: false,
        closeOnMouseOut: false,
        openOnClick: true,
        closeOnClick: true,
        target: null
    };
    class LayerSwitcher extends ol.control.Control {
        /**
         * OpenLayers 3 Layer Switcher Control.
         * See [the examples](./examples) for usage.
         * @param opt_options Control options, extends olx.control.ControlOptions adding:
         *                              **`tipLabel`** `String` - the button tooltip.
         */
        constructor(options) {
            options = defaults(options || {}, DEFAULT_OPTIONS);
            super(options);
            this.afterCreate(options);
        }
        afterCreate(options) {
            this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
            this.shownClassName = this.hiddenClassName + ' shown';
            let element = document.createElement('div');
            element.className = this.hiddenClassName;
            let button = this.button = document.createElement('button');
            button.setAttribute('title', options.tipLabel);
            element.appendChild(button);
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            element.appendChild(this.panel);
            this.unwatch = [];
            this.element = element;
            this.setTarget(options.target);
            if (options.openOnMouseOver) {
                element.addEventListener("mouseover", () => this.showPanel());
            }
            if (options.closeOnMouseOut) {
                element.addEventListener("mouseout", () => this.hidePanel());
            }
            if (options.openOnClick || options.closeOnClick) {
                button.addEventListener('click', e => {
                    this.isVisible() ? options.closeOnClick && this.hidePanel() : options.openOnClick && this.showPanel();
                    e.preventDefault();
                });
            }
        }
        dispatch(name, args) {
            let event = new Event(name);
            args && Object.keys(args).forEach(k => event[k] = args[k]);
            this["dispatchEvent"](event);
        }
        isVisible() {
            return this.element.className != this.hiddenClassName;
        }
        /**
         * Show the layer panel.
         */
        showPanel() {
            if (this.element.className != this.shownClassName) {
                this.element.className = this.shownClassName;
                this.renderPanel();
            }
        }
        /**
         * Hide the layer panel.
         */
        hidePanel() {
            this.element.className = this.hiddenClassName;
            this.unwatch.forEach(f => f());
        }
        /**
         * Re-draw the layer panel to represent the current state of the layers.
         */
        renderPanel() {
            this.ensureTopVisibleBaseLayerShown();
            while (this.panel.firstChild) {
                this.panel.removeChild(this.panel.firstChild);
            }
            var ul = document.createElement('ul');
            this.panel.appendChild(ul);
            this.state = [];
            let map = this.getMap();
            let view = map.getView();
            this.renderLayers(map, ul);
            {
                let doit = () => {
                    let res = view.getResolution();
                    this.state.filter(s => !!s.input).forEach(s => {
                        let min = s.layer.getMinResolution();
                        let max = s.layer.getMaxResolution();
                        console.log(res, min, max, s.layer.get("title"));
                        s.input.disabled = !(min <= res && (max === 0 || res <= max));
                    });
                };
                let h = view.on("change:resolution", doit);
                doit();
                this.unwatch.push(() => view.unByKey(h));
            }
        }
        ;
        /**
         * Ensure only the top-most base layer is visible if more than one is visible.
         */
        ensureTopVisibleBaseLayerShown() {
            let visibleBaseLyrs = allLayers(this.getMap()).filter(l => l.get('type') === 'base' && l.getVisible());
            if (visibleBaseLyrs.length)
                this.setVisible(visibleBaseLyrs.shift(), true);
        }
        ;
        /**
         * Toggle the visible state of a layer.
         * Takes care of hiding other layers in the same exclusive group if the layer
         * is toggle to visible.
         */
        setVisible(lyr, visible) {
            if (lyr.getVisible() !== visible) {
                if (visible && lyr.get('type') === 'base') {
                    // Hide all other base layers regardless of grouping
                    allLayers(this.getMap()).filter(l => l !== lyr && l.get('type') === 'base' && l.getVisible()).forEach(l => this.setVisible(l, false));
                }
                lyr.setVisible(visible);
                this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
            }
        }
        ;
        /**
         * Render all layers that are children of a group.
         */
        renderLayer(lyr, container) {
            let result;
            let li = document.createElement('li');
            container.appendChild(li);
            let lyrTitle = lyr.get('title');
            let label = document.createElement('label');
            label.htmlFor = uuid();
            lyr.on('load:start', () => li.classList.add("loading"));
            lyr.on('load:end', () => li.classList.remove("loading"));
            li.classList.toggle("loading", true === lyr.get("loading"));
            if ('getLayers' in lyr && !lyr.get('combine')) {
                if (!lyr.get('label-only')) {
                    let input = result = document.createElement('input');
                    input.id = label.htmlFor;
                    input.type = 'checkbox';
                    input.checked = lyr.getVisible();
                    input.addEventListener('change', () => {
                        ul.classList.toggle('hide-layer-group', !input.checked);
                        this.setVisible(lyr, input.checked);
                        let childLayers = lyr.getLayers();
                        this.state.filter(s => s.container === ul && s.input && s.input.checked).forEach(state => {
                            this.setVisible(state.layer, input.checked);
                        });
                    });
                    li.appendChild(input);
                }
                li.classList.add('group');
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                let ul = document.createElement('ul');
                result && ul.classList.toggle('hide-layer-group', !result.checked);
                li.appendChild(ul);
                this.renderLayers(lyr, ul);
            }
            else {
                li.classList.add('layer');
                let input = result = document.createElement('input');
                input.id = label.htmlFor;
                if (lyr.get('type') === 'base') {
                    input.classList.add('basemap');
                    input.type = 'radio';
                    input.addEventListener("change", () => {
                        if (input.checked) {
                            asArray(this.panel.getElementsByClassName("basemap")).filter(i => i.tagName === "INPUT").forEach(i => {
                                if (i.checked && i !== input)
                                    i.checked = false;
                            });
                        }
                        this.setVisible(lyr, input.checked);
                    });
                }
                else {
                    input.type = 'checkbox';
                    input.addEventListener("change", () => {
                        this.setVisible(lyr, input.checked);
                    });
                }
                input.checked = lyr.get('visible');
                li.appendChild(input);
                label.innerHTML = lyrTitle;
                li.appendChild(label);
            }
            this.state.push({
                container: container,
                input: result,
                layer: lyr
            });
        }
        /**
         * Render all layers that are children of a group.
         */
        renderLayers(map, elm) {
            var lyrs = map.getLayers().getArray().slice().reverse();
            return lyrs.filter(l => !!l.get('title')).forEach(l => this.renderLayer(l, elm));
        }
    }
    return LayerSwitcher;
});
define("extras/ajax", ["require", "exports"], function (require, exports) {
    "use strict";
    class Ajax {
        constructor(url) {
            this.url = url;
            this.options = {
                use_json: true,
                use_cors: true
            };
        }
        jsonp(args, url = this.url) {
            return new Promise((resolve, reject) => {
                args["callback"] = "define";
                let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
                require([uri], (data) => resolve(data));
            });
        }
        // http://www.html5rocks.com/en/tutorials/cors/    
        ajax(method, args, url = this.url) {
            let isData = method === "POST" || method === "PUT";
            let isJson = this.options.use_json;
            let isCors = this.options.use_cors;
            let promise = new Promise((resolve, reject) => {
                let client = new XMLHttpRequest();
                if (isCors)
                    client.withCredentials = true;
                let uri = url;
                let data = null;
                if (args) {
                    if (isData) {
                        data = JSON.stringify(args);
                    }
                    else {
                        uri += '?';
                        let argcount = 0;
                        for (let key in args) {
                            if (args.hasOwnProperty(key)) {
                                if (argcount++) {
                                    uri += '&';
                                }
                                uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                            }
                        }
                    }
                }
                client.open(method, uri, true);
                if (isData && isJson)
                    client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                client.send(data);
                client.onload = () => {
                    console.log("content-type", client.getResponseHeader("Content-Type"));
                    if (client.status >= 200 && client.status < 300) {
                        isJson = isJson || 0 === client.getResponseHeader("Content-Type").indexOf("application/json");
                        resolve(isJson ? JSON.parse(client.response) : client.response);
                    }
                    else {
                        reject(client.statusText);
                    }
                };
                client.onerror = function () {
                    reject(this.statusText);
                };
            });
            // Return the promise
            return promise;
        }
        get(args) {
            return this.ajax('GET', args);
        }
        post(args) {
            return this.ajax('POST', args);
        }
        put(args) {
            return this.ajax('PUT', args);
        }
        delete(args) {
            return this.ajax('DELETE', args);
        }
    }
    return Ajax;
});
define("extras/ags-catalog", ["require", "exports", "extras/ajax"], function (require, exports, Ajax) {
    "use strict";
    /**
     * assigns undefined values
     */
    function defaults(a, ...b) {
        b.filter(b => !!b).forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    class Catalog {
        constructor(url) {
            this.ajax = new Ajax(url);
        }
        about(data) {
            let req = defaults({
                f: "pjson"
            }, data);
            return this.ajax.jsonp(req);
        }
        aboutFolder(folder) {
            let ajax = new Ajax(`${this.ajax.url}/${folder}`);
            let req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        }
        aboutFeatureServer(name) {
            let ajax = new Ajax(`${this.ajax.url}/${name}/FeatureServer`);
            let req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        }
        aboutMapServer(name) {
            let ajax = new Ajax(`${this.ajax.url}/${name}/MapServer`);
            let req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        }
        aboutLayer(layer) {
            let ajax = new Ajax(`${this.ajax.url}/${layer}`);
            let req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        }
    }
    exports.Catalog = Catalog;
});
define("extras/ags-webmap", ["require", "exports", "extras/ajax"], function (require, exports, Ajax) {
    "use strict";
    const DEFAULT_URLS = [
        "https://www.arcgis.com/sharing/rest/content/items/204d94c9b1374de9a21574c9efa31164/data?f=json",
        "https://www.arcgis.com/sharing/rest/content/items/a193c5459e6e4fd99ebf09d893d65cf0/data?f=json"
    ];
    class WebMap {
        get(url = DEFAULT_URLS[1]) {
            let service = new Ajax(url);
            return service.get();
        }
    }
    exports.WebMap = WebMap;
});
define("extras/ags-layer-factory", ["require", "exports", "openlayers"], function (require, exports, ol) {
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
                    if (layerInfo.featureCollection)
                        return this.asFeatureCollection(layerInfo, appInfo);
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
            let srs = layerInfo.spatialReference || appInfo.spatialReference;
            let srsCode = srs && srs.latestWkid || "3857";
            let source = new ol.source.XYZ({
                url: layerInfo.url + '/tile/{z}/{y}/{x}',
                projection: `EPSG:${srsCode}`
            });
            let tileOptions = {
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
        asFeatureCollection(layerInfo, appInfo) {
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
            layer.setStyle((feature, resolution) => {
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
        asEsriGeometryPolygon(featureSet) {
            console.assert(featureSet.geometryType === "esriGeometryPolygon");
            return featureSet.features.map(f => new ol.Feature({
                attributes: f.attributes,
                geometry: new ol.geom.Polygon(f.geometry.rings)
            }));
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
define("examples/ags-webmap", ["require", "exports", "openlayers", "ol3-layerswitcher", "extras/ags-webmap", "extras/ags-layer-factory"], function (require, exports, ol, LayerSwitcher, WebMap, AgsLayerFactory) {
    "use strict";
    function run() {
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
        let agsLayerFactory = new AgsLayerFactory();
        let map = new ol.Map({
            target: 'map',
            layers: [],
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
        function webmap(options) {
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
            });
        }
        webmap({
            url: "http://infor1.maps.arcgis.com/sharing/rest/content/items/313b7327133f4802affee46893b4bec7/data?f=json"
        });
    }
    exports.run = run;
});
define("examples/ags-discovery", ["require", "exports", "openlayers", "ol3-layerswitcher", "extras/ags-catalog", "proj4", "extras/ags-layer-factory"], function (require, exports, ol, LayerSwitcher, AgsDiscovery, proj4, AgsLayerFactory) {
    "use strict";
    function run() {
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
        let agsLayerFactory = new AgsLayerFactory();
        let map = new ol.Map({
            target: 'map',
            layers: [],
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
        function discover(url) {
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
        }
        discover("//sampleserver1.arcgisonline.com/arcgis/rest/services");
    }
    exports.run = run;
});
define("examples/data/webmap1", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "layers": [
            {
                "id": 34,
                "showLegend": false,
                "popupInfo": {
                    "title": "Predominant Population in {SF1_States_STATE_NAME}",
                    "fieldInfos": [
                        {
                            "fieldName": "OBJECTID",
                            "label": "OBJECTID",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "Shape",
                            "label": "Shape",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "SF1_States_ID",
                            "label": "ID",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_States_STATE_NAME",
                            "label": "STATE_NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_States_ST_ABBREV",
                            "label": "ST_ABBREV",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_States_TOTPOP10",
                            "label": "TOTPOP10",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctWhite",
                            "label": "Percent White 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctBlack",
                            "label": "Percent Black 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctAmerInd",
                            "label": "Percent American Indian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctPacific",
                            "label": "Percent Pacific Islander 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctOther",
                            "label": "Percent Other 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_PctHispanic",
                            "label": "Percent Hispanic i2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_Pct2Races",
                            "label": "Percent 2 or more races 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "PredominantRaceEthnicity",
                            "label": "PredominantRaceEthnicity",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "Shape_Length",
                            "label": "Shape_Length",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Shape_Area",
                            "label": "Shape_Area",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "DOMINANCE_VALUE",
                            "label": "Level of Predominance",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_States_Pct2Asian",
                            "label": "Percent Asian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        }
                    ],
                    "description": "In {SF1_States_STATE_NAME}, the total population is {SF1_States_TOTPOP10}. The predominant population group is {PredominantRaceEthnicity}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                    "showAttachments": false,
                    "mediaInfos": [
                        {
                            "title": "Breakdown",
                            "type": "piechart",
                            "caption": "Predominant racial or ethnic groups in the U.S.A. by county and tract, and the extent to which they predominant. Touch or mouse over the pie graph to see the actual values.",
                            "value": {
                                "fields": [
                                    "SF1_States_PctWhite",
                                    "SF1_States_PctBlack",
                                    "SF1_States_PctAmerInd",
                                    "SF1_States_PctPacific",
                                    "SF1_States_PctOther",
                                    "SF1_States_PctHispanic",
                                    "SF1_States_Pct2Races",
                                    "SF1_States_Pct2Asian"
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "id": 33,
                "showLegend": false,
                "popupInfo": {
                    "title": "Predominant Population in {SF1_Counties_NAME}, {SF1_Counties_STATE_NAME}",
                    "fieldInfos": [
                        {
                            "fieldName": "OBJECTID",
                            "label": "OBJECTID",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "Shape",
                            "label": "Shape",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "SF1_Counties_TOTPOP10",
                            "label": "TOTPOP10",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctWhite",
                            "label": "Percent White 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctBlack",
                            "label": "Percent Black 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctAmerInd",
                            "label": "Percent American Indian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctPacific",
                            "label": "Percent Pacific Islander 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctOther",
                            "label": "Percent Other 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_PctHispanic",
                            "label": "Percent Hispanic 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_Primary",
                            "label": "Dominance_Primary",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "Dominance_Primary_numbers",
                            "label": "Dominance_Primary_numbers",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_secondary_numbers",
                            "label": "Dominance_secondary_numbers",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_Secondary",
                            "label": "Dominance_Secondary",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "DOMINANCE_VALUE",
                            "label": "Level of predominance",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_NAME",
                            "label": "NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Counties_STATE_NAME",
                            "label": "STATE_NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Counties_ST_ABBREV",
                            "label": "ST_ABBREV",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Counties_AREA",
                            "label": "AREA",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Shape_Length",
                            "label": "Shape_Length",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Shape_Area",
                            "label": "Shape_Area",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Counties_Pct2Asian",
                            "label": "Percent Asian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        }
                    ],
                    "description": "In {SF1_Counties_NAME}, the total population is {SF1_Counties_TOTPOP10}. The predominant population group is {Dominance_Primary}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                    "showAttachments": false,
                    "mediaInfos": [
                        {
                            "title": "Breakdown",
                            "type": "piechart",
                            "caption": "The percentage of the total population represented by each racial or ethnic group in 2010. Touch or mouse over the pie graph to see the actual values.",
                            "value": {
                                "fields": [
                                    "SF1_Counties_PctWhite",
                                    "SF1_Counties_PctBlack",
                                    "SF1_Counties_PctAmerInd",
                                    "SF1_Counties_PctPacific",
                                    "SF1_Counties_PctOther",
                                    "SF1_Counties_PctHispanic",
                                    "SF1_Counties_Pct2Asian"
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "id": 32,
                "showLegend": false,
                "popupInfo": {
                    "title": "{COUNTY}, {SF1_Tracts_STATE_NAME} tract {SF1_Tracts_ID}",
                    "fieldInfos": [
                        {
                            "fieldName": "OBJECTID",
                            "label": "OBJECTID",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "Shape",
                            "label": "Shape",
                            "isEditable": false,
                            "visible": false
                        },
                        {
                            "fieldName": "SF1_Tracts_ID",
                            "label": "ID",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Tracts_NAME",
                            "label": "NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Tracts_STATE_NAME",
                            "label": "STATE_NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Tracts_ST_ABBREV",
                            "label": "ST_ABBREV",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "SF1_Tracts_TOTPOP10",
                            "label": "TOTPOP10",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctWhite",
                            "label": "Percent White 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctBlack",
                            "label": "Percent Black 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctAmerInd",
                            "label": "Percent American Indian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctPacific",
                            "label": "Percent Pacific Islander 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctOther",
                            "label": "Percent Other 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_PctHispanic",
                            "label": "Percent Hispanic 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_Pct2Races",
                            "label": "Percent 2 or more races 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_Primary",
                            "label": "Dominance_Primary",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "Dominance_Primary_numbers",
                            "label": "Dominance_Primary_numbers",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_secondary_numbers",
                            "label": "Dominance_secondary_numbers",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Dominance_Secondary",
                            "label": "Dominance_Secondary",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "DOMINANCE_VALUE",
                            "label": "DOMINANCE_VALUE",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "COUNTY_NAME",
                            "label": "COUNTY_NAME",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "COUNTY_SUFFIX",
                            "label": "COUNTY_SUFFIX",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "COUNTY",
                            "label": "COUNTY",
                            "isEditable": false,
                            "visible": true,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "Shape_Length",
                            "label": "Shape_Length",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "Shape_Area",
                            "label": "Shape_Area",
                            "isEditable": false,
                            "visible": false,
                            "format": {
                                "places": 2,
                                "digitSeparator": true
                            }
                        },
                        {
                            "fieldName": "SF1_Tracts_Pct2Asian",
                            "label": "Percent Asian 2010",
                            "isEditable": false,
                            "visible": true,
                            "format": {
                                "places": 1,
                                "digitSeparator": true
                            }
                        }
                    ],
                    "description": "In this tract, the total population is {SF1_Tracts_TOTPOP10}. The predominant population group is {Dominance_Primary}, and the difference between it and the second largest group is {DOMINANCE_VALUE}% \n        ",
                    "showAttachments": false,
                    "mediaInfos": [
                        {
                            "title": "Breakdown",
                            "type": "piechart",
                            "caption": "The percentage of the total population represented by each racial or ethnic group in 2010. Touch or mouse over the pie graph to see the actual values.",
                            "value": {
                                "fields": [
                                    "SF1_Tracts_PctWhite",
                                    "SF1_Tracts_PctBlack",
                                    "SF1_Tracts_PctAmerInd",
                                    "SF1_Tracts_PctPacific",
                                    "SF1_Tracts_PctOther",
                                    "SF1_Tracts_PctHispanic",
                                    "SF1_Tracts_Pct2Races",
                                    "SF1_Tracts_Pct2Asian"
                                ]
                            }
                        }
                    ]
                }
            },
            {
                "id": 1,
                "showLegend": false
            }
        ],
        "minScale": 147914382,
        "maxScale": 72223
    };
});
define("examples/data/webmap2", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "operationalLayers": [
            {
                "id": "operations_1603",
                "layerType": "ArcGISFeatureLayer",
                "url": "https://sampleserver3.arcgisonline.com/arcgis/rest/services/HomelandSecurity/operations/FeatureServer/2",
                "visibility": true,
                "opacity": 1,
                "mode": 1,
                "title": "operations - Incident Areas",
                "popupInfo": {
                    "title": "Incident Areas: {ftype}",
                    "fieldInfos": [
                        {
                            "fieldName": "objectid",
                            "label": "Object ID",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "permanent_identifier",
                            "label": "Permanent_Identifier",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "lifecyclestatus",
                            "label": "Lifecycle Status",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "incident_number",
                            "label": "Incident Number",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "ftype",
                            "label": "Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "fcode",
                            "label": "Sub Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "collection_time",
                            "label": "Collection Date",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "dateFormat": "longMonthDayYear"
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "description",
                            "label": "Description",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": null,
                            "stringFieldOption": "textbox"
                        }
                    ],
                    "description": null,
                    "showAttachments": true,
                    "mediaInfos": []
                }
            },
            {
                "id": "operations_503",
                "layerType": "ArcGISFeatureLayer",
                "url": "https://sampleserver3.arcgisonline.com/arcgis/rest/services/HomelandSecurity/operations/FeatureServer/1",
                "visibility": true,
                "opacity": 1,
                "mode": 1,
                "title": "operations - Incident Lines",
                "popupInfo": {
                    "title": "Incident Lines: {ftype}",
                    "fieldInfos": [
                        {
                            "fieldName": "objectid",
                            "label": "Object ID",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "permanent_identifier",
                            "label": "Permanent_Identifier",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "lifecyclestatus",
                            "label": "Lifecycle Status",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "incident_number",
                            "label": "Incident Number",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "ftype",
                            "label": "Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "fcode",
                            "label": "Sub Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "collection_time",
                            "label": "Collection Date",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "dateFormat": "longMonthDayYear"
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "description",
                            "label": "Description",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": null,
                            "stringFieldOption": "textbox"
                        }
                    ],
                    "description": null,
                    "showAttachments": true,
                    "mediaInfos": []
                }
            },
            {
                "id": "operations_4913",
                "layerType": "ArcGISFeatureLayer",
                "url": "https://sampleserver3.arcgisonline.com/arcgis/rest/services/HomelandSecurity/operations/FeatureServer/0",
                "visibility": true,
                "opacity": 1,
                "mode": 1,
                "title": "operations - Incident Points",
                "popupInfo": {
                    "title": "Incident Points: {ftype}",
                    "fieldInfos": [
                        {
                            "fieldName": "objectid",
                            "label": "Object ID",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "permanent_identifier",
                            "label": "Permanent_Identifier",
                            "isEditable": false,
                            "tooltip": "",
                            "visible": false,
                            "format": null,
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "lifecyclestatus",
                            "label": "Lifecycle Status",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "incident_number",
                            "label": "Incident Number",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "ftype",
                            "label": "Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "fcode",
                            "label": "Sub Category",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "places": 0,
                                "digitSeparator": true
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "collection_time",
                            "label": "Collection Date",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": {
                                "dateFormat": "longMonthDayYear"
                            },
                            "stringFieldOption": "textbox"
                        },
                        {
                            "fieldName": "description",
                            "label": "Description",
                            "isEditable": true,
                            "tooltip": "",
                            "visible": true,
                            "format": null,
                            "stringFieldOption": "textbox"
                        }
                    ],
                    "description": null,
                    "showAttachments": true,
                    "mediaInfos": []
                }
            }
        ],
        "baseMap": {
            "baseMapLayers": [
                {
                    "id": "World_Street_Map_1643",
                    "layerType": "ArcGISTiledMapServiceLayer",
                    "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
                    "visibility": true,
                    "opacity": 1,
                    "title": "World_Street_Map"
                }
            ],
            "title": "Streets"
        },
        "spatialReference": {
            "wkid": 102100,
            "latestWkid": 3857
        },
        "authoringApp": "WebMapViewer",
        "authoringAppVersion": "4.1",
        "version": "2.4",
        "bookmarks": [
            {
                "extent": {
                    "spatialReference": {
                        "wkid": 102100
                    },
                    "xmax": -8575213.244615981,
                    "xmin": -8577439.473064845,
                    "ymax": 4706557.285830588,
                    "ymin": 4705169.476035749
                },
                "name": "Reflecting Pool"
            },
            {
                "extent": {
                    "spatialReference": {
                        "wkid": 102100
                    },
                    "xmax": -8575063.95354517,
                    "xmin": -8576177.067769477,
                    "ymax": 4706787.194079695,
                    "ymin": 4706093.289182352
                },
                "name": "The Ellipse"
            },
            {
                "extent": {
                    "spatialReference": {
                        "wkid": 102100
                    },
                    "xmax": -8574893.16456016,
                    "xmin": -8576006.278784467,
                    "ymax": 4704868.505236806,
                    "ymin": 4704174.600339463
                },
                "name": "Jefferson Memorial"
            },
            {
                "extent": {
                    "spatialReference": {
                        "wkid": 102100
                    },
                    "xmax": -8571845.238057353,
                    "xmin": -8572958.35228166,
                    "ymax": 4706931.707836159,
                    "ymin": 4706237.802938815
                },
                "name": "Union Station"
            }
        ],
        "applicationProperties": {
            "viewing": {
                "routing": {
                    "enabled": true
                },
                "basemapGallery": {
                    "enabled": true
                },
                "measure": {
                    "enabled": true
                }
            }
        },
        "MapItems": null,
        "Slides": null
    };
});
define("examples/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        let l = window.location;
        let path = `${l.origin}${l.pathname}?run=examples/`;
        let labs = `
    ags-discovery
    ags-webmap
    layerswitcher

    index
    `;
        document.writeln(`
    <p>
    Watch the console output for failed assertions (blank is good).
    </p>
    `);
        document.writeln(labs
            .split(/ /)
            .map(v => v.trim())
            .filter(v => !!v)
            .sort()
            .map(lab => `<a href=${path}${lab}&debug=1>${lab}</a>`)
            .join("<br/>"));
    }
    exports.run = run;
    ;
});
define("examples/layerswitcher", ["require", "exports", "openlayers", "ol3-layerswitcher"], function (require, exports, ol, LayerSwitcher) {
    "use strict";
    function run() {
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
                                    visible: true,
                                    source: new ol.source.OSM()
                                })
                            ]
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
            tipLabel: 'Layers',
            openOnMouseOver: true,
            closeOnMouseOut: true,
            openOnClick: false,
            closeOnClick: true,
            target: null
        });
        layerSwitcher.on("show-layer", (args) => {
            console.log("show layer:", args.layer.get("title"));
        });
        layerSwitcher.on("hide-layer", (args) => {
            console.log("hide layer:", args.layer.get("title"));
        });
        map.addControl(layerSwitcher);
    }
    exports.run = run;
});
