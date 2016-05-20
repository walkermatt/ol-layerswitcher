var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    /**
     * OpenLayers 3 Layer Switcher Control.
     * See [the examples](./examples) for usage.
     * @constructor
     * @extends {ol.control.Control}
     * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
     *                              **`tipLabel`** `String` - the button tooltip.
     */
    var LayerSwitcher = (function (_super) {
        __extends(LayerSwitcher, _super);
        function LayerSwitcher(options) {
            if (options === void 0) { options = {}; }
            // hack to workaround base constructor not being called first
            _super.call(this, this.before_create(options));
        }
        LayerSwitcher.prototype.before_create = function (options) {
            var _this = this;
            var tipLabel = options.tipLabel ?
                options.tipLabel : 'Legend';
            this.mapListeners = [];
            this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
            if (LayerSwitcher.isTouchDevice()) {
                this.hiddenClassName += ' touch';
            }
            this.shownClassName = this.hiddenClassName + ' shown';
            var element = document.createElement('div');
            element.className = this.hiddenClassName;
            var button = document.createElement('button');
            button.setAttribute('title', tipLabel);
            element.appendChild(button);
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            element.appendChild(this.panel);
            LayerSwitcher.enableTouchScroll(this.panel);
            button.onmouseover = function (e) { return _this.showPanel(); };
            button.onclick = function (e) {
                e = e || window.event;
                _this.showPanel();
                e.preventDefault();
            };
            this.panel.onmouseout = function (e) {
                e = e || window.event;
                if (!_this.panel.contains(e.toElement || e.relatedTarget)) {
                    _this.hidePanel();
                }
            };
            return {
                element: element,
                target: options.target
            };
        };
        LayerSwitcher.prototype.dispatch = function (name, args) {
            var event = new Event(name);
            args && Object.keys(args).forEach(function (k) { return event[k] = args[k]; });
            this["dispatchEvent"](event);
        };
        /**
         * Show the layer panel.
         */
        LayerSwitcher.prototype.showPanel = function () {
            if (this.element.className != this.shownClassName) {
                this.element.className = this.shownClassName;
                this.renderPanel();
            }
        };
        /**
         * Hide the layer panel.
         */
        LayerSwitcher.prototype.hidePanel = function () {
            if (this.element.className != this.hiddenClassName) {
                this.element.className = this.hiddenClassName;
            }
        };
        /**
         * Re-draw the layer panel to represent the current state of the layers.
         */
        LayerSwitcher.prototype.renderPanel = function () {
            this.ensureTopVisibleBaseLayerShown();
            while (this.panel.firstChild) {
                this.panel.removeChild(this.panel.firstChild);
            }
            var ul = document.createElement('ul');
            this.panel.appendChild(ul);
            this.renderLayers(this.getMap(), ul);
        };
        ;
        /**
         * Set the map instance the control is associated with.
         * @param {ol.Map} map The map instance.
         */
        LayerSwitcher.prototype.setMap = function (map) {
            var _this = this;
            // Clean up listeners associated with the previous map
            for (var i = 0, key; i < this.mapListeners.length; i++) {
                this.getMap().unByKey(this.mapListeners[i]);
            }
            this.mapListeners.length = 0;
            // Wire up listeners etc. and store reference to new map
            _super.prototype.setMap.call(this, map);
            if (map) {
                this.mapListeners.push(map.on('pointerdown', function () { return _this.hidePanel(); }));
                this.renderPanel();
            }
        };
        ;
        /**
         * Ensure only the top-most base layer is visible if more than one is visible.
         */
        LayerSwitcher.prototype.ensureTopVisibleBaseLayerShown = function () {
            var lastVisibleBaseLyr;
            LayerSwitcher.forEachRecursive(this.getMap(), function (l, idx, a) {
                if (l.get('type') === 'base' && l.getVisible()) {
                    lastVisibleBaseLyr = l;
                }
            });
            if (lastVisibleBaseLyr)
                this.setVisible(lastVisibleBaseLyr, true);
        };
        ;
        /**
         * Toggle the visible state of a layer.
         * Takes care of hiding other layers in the same exclusive group if the layer
         * is toggle to visible.
         */
        LayerSwitcher.prototype.setVisible = function (lyr, visible) {
            var _this = this;
            var map = this.getMap();
            lyr.setVisible(visible);
            if (visible && lyr.get('type') === 'base') {
                // Hide all other base layers regardless of grouping
                LayerSwitcher.forEachRecursive(map, function (l) {
                    if (l != lyr && l.get('type') === 'base') {
                        l.getVisible() && _this.setVisible(l, false);
                    }
                });
            }
            this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
        };
        ;
        /**
         * Render all layers that are children of a group.
         */
        LayerSwitcher.prototype.renderLayer = function (lyr, idx) {
            var _this = this;
            var li = document.createElement('li');
            var lyrTitle = lyr.get('title');
            var lyrId = LayerSwitcher.uuid();
            var label = document.createElement('label');
            if (lyr.getLayers && !lyr.get('combine')) {
                li.className = 'group';
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul = document.createElement('ul');
                li.appendChild(ul);
                this.renderLayers(lyr, ul);
            }
            else {
                li.className = 'layer';
                var input = document.createElement('input');
                if (lyr.get('type') === 'base') {
                    input.type = 'radio';
                    input.name = 'base';
                }
                else {
                    input.type = 'checkbox';
                }
                input.id = lyrId;
                input.checked = lyr.get('visible');
                input.onchange = function (e) { return _this.setVisible(lyr, input.checked); };
                li.appendChild(input);
                label.htmlFor = lyrId;
                label.innerHTML = lyrTitle;
                li.appendChild(label);
            }
            return li;
        };
        /**
         * Render all layers that are children of a group.
         */
        LayerSwitcher.prototype.renderLayers = function (map, elm) {
            var lyrs = map.getLayers().getArray().slice().reverse();
            for (var i = 0, l; i < lyrs.length; i++) {
                l = lyrs[i];
                if (l.get('title')) {
                    elm.appendChild(this.renderLayer(l, i));
                }
            }
        };
        /**
         * Call the supplied function for each layer in the passed layer group
         * recursing nested groups.
         * @param lyr The layer group to start iterating from.
         * @param fn Callback which will be called for each `ol.layer.Base`
         * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
         */
        LayerSwitcher.forEachRecursive = function (lyr, fn) {
            lyr.getLayers().forEach(function (lyr, idx, a) {
                fn(lyr, idx, a);
                if (lyr.getLayers) {
                    LayerSwitcher.forEachRecursive(lyr, fn);
                }
            });
        };
        ;
        /**
         * Generate a UUID
         * @returns {String} UUID
         *
         * Adapted from http://stackoverflow.com/a/2117523/526860
         */
        LayerSwitcher.uuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        /**
        * @private
        * @desc Apply workaround to enable scrolling of overflowing content within an
        * element. Adapted from https://gist.github.com/chrismbarr/4107472
        */
        LayerSwitcher.enableTouchScroll = function (elm) {
            if (LayerSwitcher.isTouchDevice()) {
                var scrollStartPos = 0;
                elm.addEventListener("touchstart", function (event) {
                    scrollStartPos = this.scrollTop + event.touches[0].pageY;
                }, false);
                elm.addEventListener("touchmove", function (event) {
                    this.scrollTop = scrollStartPos - event.touches[0].pageY;
                }, false);
            }
        };
        /**
         * @private
         * @desc Determine if the current browser supports touch events. Adapted from
         * https://gist.github.com/chrismbarr/4107472
         */
        LayerSwitcher.isTouchDevice = function () {
            try {
                document.createEvent("TouchEvent");
                return true;
            }
            catch (e) {
                return false;
            }
        };
        return LayerSwitcher;
    }(ol.control.Control));
    return LayerSwitcher;
});
