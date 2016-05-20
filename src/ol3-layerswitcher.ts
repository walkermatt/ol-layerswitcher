import ol = require("openlayers");

/**
 * OpenLayers 3 Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
 *                              **`tipLabel`** `String` - the button tooltip.
 */

class LayerSwitcher extends ol.control.Control {

    mapListeners: Array<any>;
    hiddenClassName: string;
    shownClassName: string;
    panel: HTMLDivElement;
    element: HTMLElement;

    constructor(options = {}) {
        // hack to workaround base constructor not being called first
        super(this.before_create(options));
    }

    private before_create(options) {

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

        button.onmouseover = e => this.showPanel();

        button.onclick = e => {
            e = e || window.event;
            this.showPanel();
            e.preventDefault();
        };

        this.panel.onmouseout = e => {
            e = e || window.event;
            if (!this.panel.contains(e.toElement || e.relatedTarget)) {
                this.hidePanel();
            }
        };

        return {
            element: element,
            target: options.target
        };

    }

    dispatch(name: string, args?: any) {
        let event = new Event(name);
        args && Object.keys(args).forEach(k => event[k] = args[k]);
        this["dispatchEvent"](event);
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
        if (this.element.className != this.hiddenClassName) {
            this.element.className = this.hiddenClassName;
        }
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
        this.renderLayers(this.getMap(), ul);

    };

    /**
     * Set the map instance the control is associated with.
     * @param {ol.Map} map The map instance.
     */
    setMap(map) {
        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this.mapListeners.length; i++) {
            this.getMap().unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;
        // Wire up listeners etc. and store reference to new map
        super.setMap(map);
        if (map) {
            this.mapListeners.push(map.on('pointerdown', () => this.hidePanel()));
            this.renderPanel();
        }
    };

    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     */
    private ensureTopVisibleBaseLayerShown() {
        var lastVisibleBaseLyr;
        LayerSwitcher.forEachRecursive(this.getMap(), function (l, idx, a) {
            if (l.get('type') === 'base' && l.getVisible()) {
                lastVisibleBaseLyr = l;
            }
        });
        if (lastVisibleBaseLyr) this.setVisible(lastVisibleBaseLyr, true);
    };

    /**
     * Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     */
    private setVisible(lyr: ol.layer.Base, visible: boolean) {
        var map = this.getMap();
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base') {
            // Hide all other base layers regardless of grouping
            LayerSwitcher.forEachRecursive(map, l => {
                if (l != lyr && l.get('type') === 'base') {
                    l.getVisible() && this.setVisible(l, false);
                }
            });
        }
        this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
    };

    /**
     * Render all layers that are children of a group.
     */
    private renderLayer(lyr: ol.layer.Base, idx: number) {

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

        } else {

            li.className = 'layer';
            var input = document.createElement('input');
            if (lyr.get('type') === 'base') {
                input.type = 'radio';
                input.name = 'base';
            } else {
                input.type = 'checkbox';
            }
            input.id = lyrId;
            input.checked = lyr.get('visible');
            input.onchange = e => this.setVisible(lyr, input.checked);
            li.appendChild(input);

            label.htmlFor = lyrId;
            label.innerHTML = lyrTitle;
            li.appendChild(label);

        }

        return li;

    }

    /**
     * Render all layers that are children of a group.
     */
    private renderLayers(map: ol.Map | ol.layer.Group, elm: HTMLElement) {
        var lyrs = map.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(this.renderLayer(l, i));
            }
        }
    }

    /**
     * Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param lyr The layer group to start iterating from.
     * @param fn Callback which will be called for each `ol.layer.Base`
     * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
     */
    static forEachRecursive(lyr: ol.Map | ol.layer.Group, fn: (element: ol.layer.Base, index: number, array: ol.layer.Base[]) => void) {
        lyr.getLayers().forEach(function (lyr, idx, a) {
            fn(lyr, idx, a);
            if (lyr.getLayers) {
                LayerSwitcher.forEachRecursive(<ol.layer.Group>lyr, fn);
            }
        });
    };

    /**
     * Generate a UUID
     * @returns {String} UUID
     *
     * Adapted from http://stackoverflow.com/a/2117523/526860
     */
    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    private static enableTouchScroll(elm) {
        if (LayerSwitcher.isTouchDevice()) {
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
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     */
    private static isTouchDevice() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    }

}

export = LayerSwitcher;