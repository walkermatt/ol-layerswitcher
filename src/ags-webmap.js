define(["require", "exports", "./ajax"], function (require, exports, Ajax) {
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
