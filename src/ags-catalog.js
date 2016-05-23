define(["require", "exports", "./ajax"], function (require, exports, Ajax) {
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
