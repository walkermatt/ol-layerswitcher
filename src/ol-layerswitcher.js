import Control from 'ol/control/Control';
import Observable from 'ol/Observable';

var CSS_PREFIX = 'layer-switcher-';

/**
 * OpenLayers Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
 * **`tipLabel`** `String` - the button tooltip.
 */
export default class LayerSwitcher extends Control {

    constructor(opt_options) {

        var options = opt_options || {};

        var tipLabel = options.tipLabel ?
            options.tipLabel : 'Legend';

        var element = document.createElement('div');

        super({element: element, target: options.target});

        this.mapListeners = [];

        this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (LayerSwitcher.isTouchDevice_()) {
            this.hiddenClassName += ' touch';
        }
        this.shownClassName = 'shown';

        element.className = this.hiddenClassName;

        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        element.appendChild(button);

        this.panel = document.createElement('div');
        this.panel.className = 'panel';
        element.appendChild(this.panel);
        LayerSwitcher.enableTouchScroll_(this.panel);

        var this_ = this;

        button.onmouseover = function(e) {
            this_.showPanel();
        };

        button.onclick = function(e) {
            e = e || window.event;
            this_.showPanel();
            e.preventDefault();
        };

        this_.panel.onmouseout = function(e) {
            e = e || window.event;
            if (!this_.panel.contains(e.toElement || e.relatedTarget)) {
                this_.hidePanel();
            }
        };

    }

    /**
    * Set the map instance the control is associated with.
    * @param {ol.Map} map The map instance.
    */
    setMap(map) {
        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this.mapListeners.length; i++) {
            Observable.unByKey(this.mapListeners[i]);
        }
        this.mapListeners.length = 0;
        // Wire up listeners etc. and store reference to new map
        super.setMap(map);
        if (map) {
            var this_ = this;
            this.mapListeners.push(map.on('pointerdown', function() {
                this_.hidePanel();
            }));
            this.renderPanel();
        }
    }

    /**
    * Show the layer panel.
    */
    showPanel() {
        if (!this.element.classList.contains(this.shownClassName)) {
            this.element.classList.add(this.shownClassName);
            this.renderPanel();
        }
    }

    /**
    * Hide the layer panel.
    */
    hidePanel() {
        if (this.element.classList.contains(this.shownClassName)) {
            this.element.classList.remove(this.shownClassName);
        }
    }

    /**
    * Re-draw the layer panel to represent the current state of the layers.
    */
    renderPanel() {
        LayerSwitcher.renderPanel(this.getMap(), this.panel);
    }

    /**
    * **Static** Re-draw the layer panel to represent the current state of the layers.
    * @param {ol.Map} map The OpenLayers Map instance to render layers for
    * @param {Element} panel The DOM Element into which the layer tree will be rendered
    */
    static renderPanel(map, panel) {

        LayerSwitcher.ensureTopVisibleBaseLayerShown_(map);

        while(panel.firstChild) {
            panel.removeChild(panel.firstChild);
        }

        map.getLayers().forEach(lyr => {
            LayerSwitcher.setParentAndType_(lyr, null);
        });

        var ul = document.createElement('ul');
        panel.appendChild(ul);
        // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
        LayerSwitcher.renderLayers_(map, map, ul);

    }

    /**
     * Sets the layer's parent attribute and set the layer's type
     * to 'basegroup' if any children are a base layer or group.
     *
     * @param      {ol.layer.Base}  lyr     The layer
     * @param      {ol.layer.Base}  parent  The layer's parent
     */
    static setParentAndType_(lyr, parent) {
        lyr.set('parent', parent);
        if (lyr.getLayers) {
            lyr.getLayers().forEach(l => {
                if (l.getLayers) {
                    LayerSwitcher.setParentAndType_(l, lyr);
                } else if (l.get('title')) {
                    l.set('parent', lyr);
                }
                if (l.get('type') && l.get('type').startsWith('base')) {
                    lyr.set('type', 'basegroup');
                }
            });
        }
    }

    /**
    * **Static** Ensure only the top-most base layer is visible if more than one is visible.
    * @param {ol.Map} map The map instance.
    * @private
    */
    static ensureTopVisibleBaseLayerShown_(map) {
        var lastVisibleBaseLyr;
        LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
            if (l.get('type') === 'base' && l.getVisible()) {
                lastVisibleBaseLyr = l;
            }
        });
        if (lastVisibleBaseLyr) LayerSwitcher.setVisible_(map, lastVisibleBaseLyr, true);
    }

    /**
    * **Static** Toggle the visible state of a layer.
    * Takes care of hiding other layers in the same exclusive group if the layer
    * is toggle to visible.
    * @private
    * @param {ol.Map} map The map instance.
    * @param {ol.layer.Base} The layer whose visibility will be toggled.
    */
    static setVisible_(map, lyr, visible) {
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base') {
            // Hide all other base layers regardless of grouping
            LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
                if (l != lyr && l.get('type') === 'base') {
                    l.setVisible(false);
                }
            });
        }
        if (lyr.getLayers && !lyr.get('combine')) {
            LayerSwitcher.setNestedLayersVisible_(map, lyr, visible);
        }
    }

    /**
    * **Static** Toggle the visible state of a layer's sub-layers.
    * @private
    * @param {ol.Map} map The map instance.
    * @param {ol.layer.Base} The layer whose visibility has been toggled.
    */
    static setNestedLayersVisible_(map, lyr, visible) {
        const lyrVisible = lyr.getVisible();
        const lyrs = lyr.getLayers().getArray().slice().reverse();
        for (let l of lyrs) {
            const checkboxId = l.get('checkbox');
            const subCheckbox = document.getElementById(checkboxId);
            subCheckbox.checked = lyrVisible;
            LayerSwitcher.setVisible_(map, l, lyrVisible);
            if (l.getLayers && !lyr.get('combine')) {
                LayerSwitcher.setNestedLayersVisible_(map, l, visible);
            }
        }
    }

    /**
     * Get a layer's indeterminate state.
     * @private
     * @param      {ol.layer.Base}  layer   The layer to check
     * @return     {boolean}  The layer's indeterminate state
     */
    static indeterminate_(layer)
    {
        const checkboxId = layer.get('checkbox');
        return document.getElementById(checkboxId).indeterminate;
    }

    /**
    * **Static** Check the visibility of siblings and set their parent
    *            state to indeterminate if they differ.
    * @private
    * @param {ol.layer.Base} The layer to check
    */
    static checkParentIndeterminate_(lyr)
    {
        const parent = lyr.get('parent');
        if (parent) {
            const lyrs = parent.getLayers().getArray().slice().reverse();
            const visible = lyr.getVisible();
            let sameState = true;
            for (let l of lyrs) {
                if (LayerSwitcher.indeterminate_(l)
                  || (lyr !== l && visible !== l.getVisible())) {
                    sameState = false;
                    break;
                }
            }
            const checkboxId = parent.get('checkbox');
            const parentCheckbox = document.getElementById(checkboxId);
            if (sameState) {
                parentCheckbox.indeterminate = false;
                parentCheckbox.checked = visible;
                parent.setVisible(visible);
            } else {
                parentCheckbox.indeterminate = true;
                parentCheckbox.checked = !visible;
                parent.setVisible(true);
            }
            LayerSwitcher.checkParentIndeterminate_(parent);
        }
    }

    /**
    * **Static** Render all layers that are children of a group.
    * @private
    * @param {ol.Map} map The map instance.
    * @param {ol.layer.Base} lyr Layer to be rendered (should have a title property).
    * @param {Number} idx Position in parent group list.
    */
    static renderLayer_(map, lyr, idx) {

        var li = document.createElement('li');

        var lyrTitle = lyr.get('title');

        var checkboxId = LayerSwitcher.uuid();
        lyr.set('checkbox', checkboxId);

        var label = document.createElement('label');

        if (lyr.getLayers && !lyr.get('combine')) {

            if (!lyr.get('type') || !lyr.get('type').startsWith('base')) {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = checkboxId;
                input.checked = lyr.get('visible');
                input.onchange = function(e) {
                    LayerSwitcher.setVisible_(map, lyr, e.target.checked);
                    LayerSwitcher.checkParentIndeterminate_(lyr);
                };
                li.appendChild(input);
            }

            li.className = 'group';

            // Group folding
            if (lyr.get('fold')) {
              if (lyr.get('type') === 'basegroup') {
                li.classList.add(CSS_PREFIX + 'base-group');
              }
              li.classList.add(CSS_PREFIX + 'fold');
              li.classList.add(CSS_PREFIX + lyr.get('fold'));
              label.onclick = function (e) {
                LayerSwitcher.toggleFold_(lyr, li);
              };
            } else {
                label.htmlFor = checkboxId;
            }

            label.innerHTML = lyrTitle;
            li.appendChild(label);
            var ul = document.createElement('ul');
            li.appendChild(ul);

            LayerSwitcher.renderLayers_(map, lyr, ul);

        } else {

            li.className = 'layer';
            var input = document.createElement('input');
            if (lyr.get('type') === 'base') {
                input.type = 'radio';
                input.name = 'base';
            } else {
                input.type = 'checkbox';
            }
            input.id = checkboxId;
            input.checked = lyr.get('visible');
            input.onchange = function(e) {
                LayerSwitcher.setVisible_(map, lyr, e.target.checked);
                if (lyr.get('type') !== 'base') {
                    LayerSwitcher.checkParentIndeterminate_(lyr);
                }
            };
            li.appendChild(input);

            label.htmlFor = checkboxId;
            label.innerHTML = lyrTitle;

            var rsl = map.getView().getResolution();
            if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()){
                label.className += ' disabled';
            }

            li.appendChild(label);

        }

        return li;

    }

    /**
    * **Static** Render all layers that are children of a group.
    * @private
    * @param {ol.Map} map The map instance.
    * @param {ol.layer.Group} lyr Group layer whose children will be rendered.
    * @param {Element} elm DOM element that children will be appended to.
    */
    static renderLayers_(map, lyr, elm) {
        var lyrs = lyr.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(LayerSwitcher.renderLayer_(map, l, i));
            }
        }
    }

    /**
    * **Static** Call the supplied function for each layer in the passed layer group
    * recursing nested groups.
    * @param {ol.layer.Group} lyr The layer group to start iterating from.
    * @param {Function} fn Callback which will be called for each `ol.layer.Base`
    * found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach`
    */
    static forEachRecursive(lyr, fn) {
        lyr.getLayers().forEach(function(lyr, idx, a) {
            fn(lyr, idx, a);
            if (lyr.getLayers) {
                LayerSwitcher.forEachRecursive(lyr, fn);
            }
        });
    }

    /**
    * **Static** Generate a UUID
    * Adapted from http://stackoverflow.com/a/2117523/526860
    * @returns {String} UUID
    */
    static uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    /**
    * @private
    * @desc Apply workaround to enable scrolling of overflowing content within an
    * element. Adapted from https://gist.github.com/chrismbarr/4107472
    */
    static enableTouchScroll_(elm) {
        if(LayerSwitcher.isTouchDevice_()){
            var scrollStartPos = 0;
            elm.addEventListener("touchstart", function(event) {
                scrollStartPos = this.scrollTop + event.touches[0].pageY;
            }, false);
            elm.addEventListener("touchmove", function(event) {
                this.scrollTop = scrollStartPos - event.touches[0].pageY;
            }, false);
        }
    }

    /**
    * @private
    * @desc Determine if the current browser supports touch events. Adapted from
    * https://gist.github.com/chrismbarr/4107472
    */
    static isTouchDevice_() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
    * Fold/unfold layer group
    */
    static toggleFold_(lyr, li) {
        li.classList.remove(CSS_PREFIX + lyr.get('fold'));
        lyr.set('fold', (lyr.get('fold')==='open') ? 'close' : 'open');
        li.classList.add(CSS_PREFIX + lyr.get('fold'));
    }

}


// Expose LayerSwitcher as ol.control.LayerSwitcher if using a full build of
// OpenLayers
if (window.ol && window.ol.control) {
    window.ol.control.LayerSwitcher = LayerSwitcher;
}
