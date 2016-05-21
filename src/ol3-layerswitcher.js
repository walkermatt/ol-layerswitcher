var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    /**
     * assigns undefined values
     */
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    /**
     * NodeList -> array
     */
    function asArray(list) {
        var result = new Array(list.length);
        for (var i = 0; i < list.length; i++) {
            result.push(list[i]);
        }
        return result;
    }
    /**
     * Creates an array containing all sub-layers
     */
    function allLayers(lyr) {
        var result = [];
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
    /**
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    function enableTouchScroll(elm) {
        if (isTouchDevice()) {
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function (event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function (event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }
    /**
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     */
    function isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        }
        catch (e) {
            return false;
        }
    }
    var DEFAULT_OPTIONS = {
        tipLabel: 'Layers',
        target: null
    };
    var LayerSwitcher = (function (_super) {
        __extends(LayerSwitcher, _super);
        /**
         * OpenLayers 3 Layer Switcher Control.
         * See [the examples](./examples) for usage.
         * @param opt_options Control options, extends olx.control.ControlOptions adding:
         *                              **`tipLabel`** `String` - the button tooltip.
         */
        function LayerSwitcher(options) {
            options = defaults(options || {}, DEFAULT_OPTIONS);
            // hack to workaround base constructor not being called first
            _super.call(this, this.beforeCreate(options));
        }
        LayerSwitcher.prototype.beforeCreate = function (options) {
            var _this = this;
            this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
            if (isTouchDevice()) {
                this.hiddenClassName += ' touch';
            }
            this.shownClassName = this.hiddenClassName + ' shown';
            var element = document.createElement('div');
            element.className = this.hiddenClassName;
            var button = this.button = document.createElement('button');
            button.setAttribute('title', options.tipLabel);
            element.appendChild(button);
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            element.appendChild(this.panel);
            enableTouchScroll(this.panel);
            button.addEventListener('click', function (e) {
                _this.isVisible() ? _this.hidePanel() : _this.showPanel();
                e.preventDefault();
            });
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
        LayerSwitcher.prototype.isVisible = function () {
            return this.element.className != this.hiddenClassName;
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
            this.element.className = this.hiddenClassName;
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
         * Ensure only the top-most base layer is visible if more than one is visible.
         */
        LayerSwitcher.prototype.ensureTopVisibleBaseLayerShown = function () {
            var visibleBaseLyrs = allLayers(this.getMap()).filter(function (l) { return l.get('type') === 'base' && l.getVisible(); });
            if (visibleBaseLyrs.length)
                this.setVisible(visibleBaseLyrs.shift(), true);
        };
        ;
        /**
         * Toggle the visible state of a layer.
         * Takes care of hiding other layers in the same exclusive group if the layer
         * is toggle to visible.
         */
        LayerSwitcher.prototype.setVisible = function (lyr, visible) {
            var _this = this;
            if (lyr.getVisible() !== visible) {
                if (visible && lyr.get('type') === 'base') {
                    // Hide all other base layers regardless of grouping
                    allLayers(this.getMap()).filter(function (l) { return l !== lyr && l.get('type') === 'base' && l.getVisible(); }).forEach(function (l) { return _this.setVisible(l, false); });
                }
                lyr.setVisible(visible);
                this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
            }
        };
        ;
        /**
         * Render all layers that are children of a group.
         */
        LayerSwitcher.prototype.renderLayer = function (lyr, container) {
            var _this = this;
            var result;
            var li = document.createElement('li');
            container.appendChild(li);
            var lyrTitle = lyr.get('title');
            var lyrId = uuid();
            var label = document.createElement('label');
            if ('getLayers' in lyr && !lyr.get('combine')) {
                if (!lyr.get('label-only')) {
                    var input_1 = result = document.createElement('input');
                    input_1.type = 'checkbox';
                    input_1.checked = lyr.getVisible();
                    input_1.addEventListener('change', function () {
                        ul_1.classList.toggle('hide-layer-group', !input_1.checked);
                        _this.setVisible(lyr, input_1.checked);
                        var childLayers = lyr.getLayers();
                        childLayers.forEach(function (l, i) {
                            if (childItems_1[i] && childItems_1[i].checked) {
                                _this.setVisible(l, input_1.checked);
                            }
                        });
                    });
                    li.appendChild(input_1);
                }
                li.classList.add('group');
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul_1 = document.createElement('ul');
                result && ul_1.classList.toggle('hide-layer-group', !result.checked);
                li.appendChild(ul_1);
                var childItems_1 = this.renderLayers(lyr, ul_1);
            }
            else {
                li.classList.add('layer');
                var input_2 = result = document.createElement('input');
                input_2.classList.add("basemap");
                if (lyr.get('type') === 'base') {
                    input_2.classList.add('basemap');
                    input_2.type = 'radio';
                    input_2.addEventListener("change", function () {
                        if (input_2.checked) {
                            asArray(_this.panel.getElementsByClassName("basemap")).filter(function (i) { return i.tagName === "INPUT"; }).forEach(function (i) {
                                if (i.checked && i !== input_2)
                                    i.checked = false;
                            });
                        }
                        _this.setVisible(lyr, input_2.checked);
                    });
                }
                else {
                    input_2.type = 'checkbox';
                    input_2.addEventListener("change", function () {
                        _this.setVisible(lyr, input_2.checked);
                    });
                }
                input_2.id = lyrId;
                input_2.checked = lyr.get('visible');
                li.appendChild(input_2);
                label.htmlFor = lyrId;
                label.innerHTML = lyrTitle;
                li.appendChild(label);
            }
            return result;
        };
        /**
         * Render all layers that are children of a group.
         */
        LayerSwitcher.prototype.renderLayers = function (map, elm) {
            var _this = this;
            var lyrs = map.getLayers().getArray().slice().reverse();
            return lyrs.map(function (l, i) { return l.get('title') ? _this.renderLayer(l, elm) : null; });
        };
        return LayerSwitcher;
    }(ol.control.Control));
    return LayerSwitcher;
});
