import Control from 'ol/control/Control';
import { unByKey } from 'ol/Observable';

var CSS_PREFIX = 'layer-switcher-';

/**
 * OpenLayers Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param {Object} opt_options Control options, extends ol/control/Control~Control#options adding:
 * @param {String} opt_options.tipLabel the button tooltip.
 * @param {String} opt_options.groupSelectStyle either `'none'` - groups don't get a checkbox,
 *   `'children'` (default) groups have a checkbox and affect child visibility or
 *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
 */
export default class LayerSwitcher extends Control {

    constructor(opt_options) {

        var options = opt_options || {};

        var tipLabel = options.tipLabel ?
            options.tipLabel : 'Legend';

        var element = document.createElement('div');

        super({element: element, target: options.target});

        this.groupSelectStyle =
            ['none', 'children', 'group'].indexOf(options.groupSelectStyle) >= 0
                ? options.groupSelectStyle
                : 'children';

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
    * @param {ol/Map~Map} map The map instance.
    */
    setMap(map) {
        // Clean up listeners associated with the previous map
        for (var i = 0, key; i < this.mapListeners.length; i++) {
            unByKey(this.mapListeners[i]);
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
        LayerSwitcher.renderPanel(this.getMap(), this.panel, {
            groupSelectStyle: this.groupSelectStyle
        });
    }

    /**
    * **Static** Re-draw the layer panel to represent the current state of the layers.
    * @param {ol/Map~Map} map The OpenLayers Map instance to render layers for
    * @param {Element} panel The DOM Element into which the layer tree will be rendered
    */
    static renderPanel(map, panel, options) {

        options = options || {};

        LayerSwitcher.ensureTopVisibleBaseLayerShown_(map);

        while(panel.firstChild) {
            panel.removeChild(panel.firstChild);
        }

        // Reset indeterminate state for all layers and groups before
        // applying based on groupSelectStyle
        LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
            l.set('indeterminate', false);
        });

        if (options.groupSelectStyle === 'children' || options.groupSelectStyle === 'none') {
            // Set visibile and indeterminate state of groups based on
            // their children's visibility
            LayerSwitcher.setGroupVisibility(map);
        } else if (options.groupSelectStyle === 'group') {
            // Set child indetermiate state based on their parent's visibility
            LayerSwitcher.setChildVisibility(map);
        }

        var ul = document.createElement('ul');
        panel.appendChild(ul);
        // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
        LayerSwitcher.renderLayers_(map, map, ul, options, function render(changedLyr) {
            // console.log('render');
            LayerSwitcher.renderPanel(map, panel, options);
        });

    }

    static isBaseGroup(lyr) {
        let lyrs = (lyr.getLayers) ? lyr.getLayers().getArray() : [];
        return lyrs.length && lyrs[0].get('type') === 'base';
    }

    static setGroupVisibility(map) {
        // Get a list of groups, with the deepest first
        const groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
            return (l.getLayers && !l.get('combine') && !LayerSwitcher.isBaseGroup(l));
        }).reverse();
        // console.log(groups.map(g => g.get('title')));
        groups.forEach(function (group) {
                // TODO Can we use getLayersArray, is it public in the esm build?
                let descendantVisibility = group.getLayersArray().map(function (l) {
                    let state = l.getVisible();
                    // console.log('>', l.get('title'), state);
                    return state;
                });
                // console.log(descendantVisibility);
                if (descendantVisibility.every(function (v) {return v === true})) {
                    group.setVisible(true);
                    group.set('indeterminate', false);
                } else if (descendantVisibility.every(function (v) {return v === false})) {
                    group.setVisible(false);
                    group.set('indeterminate', false);
                } else {
                    group.setVisible(true);
                    group.set('indeterminate', true);
                }
            }
        );
    }

    static setChildVisibility(map) {
        // console.log('setChildVisibility');
        const groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
            return (l.getLayers && !l.get('combine') && !LayerSwitcher.isBaseGroup(l));
        });
        groups.forEach(function (group) {
            // console.log(group.get('title'));
            var groupVisible = group.getVisible();
            var groupIndeterminate = group.get('indeterminate');
            group.getLayers().getArray().forEach(function (l) {
                // console.log('>', l.get('title'));
                l.set('indeterminate', false);
                if ((!groupVisible || groupIndeterminate) && l.getVisible()) {
                    l.set('indeterminate', true);
                }
            });
        });
    }

    /**
    * **Static** Ensure only the top-most base layer is visible if more than one is visible.
    * @param {ol/Map~Map} map The map instance.
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

    static getGroupsAndLayers(lyr, filterFn) {
        let layers = [];
        filterFn = filterFn || function (l, idx, a) { return true };
        LayerSwitcher.forEachRecursive(lyr, function(l, idx, a) {
            if (l.get('title')) {
                if (filterFn(l, idx, a)) {
                    layers.push(l);
                }
            }
        });
        return layers;
    }

    /**
    * **Static** Toggle the visible state of a layer.
    * Takes care of hiding other layers in the same exclusive group if the layer
    * is toggle to visible.
    * @private
    * @param {ol/Map~Map} map The map instance.
    * @param {ol/layer/Base~BaseLayer} The layer whose visibility will be toggled.
    */
    static setVisible_(map, lyr, visible, groupSelectStyle) {
        // console.log(lyr.get('title'), visible, groupSelectStyle);
        lyr.setVisible(visible);
        if (visible && lyr.get('type') === 'base') {
            // Hide all other base layers regardless of grouping
            LayerSwitcher.forEachRecursive(map, function(l, idx, a) {
                if (l != lyr && l.get('type') === 'base') {
                    l.setVisible(false);
                }
            });
        }
        if (lyr.getLayers && !lyr.get('combine') && groupSelectStyle === 'children') {
            lyr.getLayers().forEach(l => {
                LayerSwitcher.setVisible_(map, l, lyr.getVisible(), groupSelectStyle);
            });
        }
    }

    /**
    * **Static** Render all layers that are children of a group.
    * @private
    * @param {ol/Map~Map} map The map instance.
    * @param {ol/layer/Base~BaseLayer} lyr Layer to be rendered (should have a title property).
    * @param {Number} idx Position in parent group list.
    */
    static renderLayer_(map, lyr, idx, options, render) {

        var li = document.createElement('li');

        var lyrTitle = lyr.get('title');

        var checkboxId = LayerSwitcher.uuid();

        var label = document.createElement('label');

        if (lyr.getLayers && !lyr.get('combine')) {

            const isBaseGroup = LayerSwitcher.isBaseGroup(lyr);

            li.classList.add('group');
            if (isBaseGroup) {
                li.classList.add(CSS_PREFIX + 'base-group');
            }

            // Group folding
            if (lyr.get('fold')) {
              li.classList.add(CSS_PREFIX + 'fold');
              li.classList.add(CSS_PREFIX + lyr.get('fold'));
              const btn = document.createElement('button');
              btn.onclick = function (e) {
                LayerSwitcher.toggleFold_(lyr, li);
              };
              li.appendChild(btn);
            }

            if (!isBaseGroup && options.groupSelectStyle != 'none') {
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = checkboxId;
                input.checked = lyr.getVisible();
                input.indeterminate = lyr.get('indeterminate');
                input.onchange = function(e) {
                    LayerSwitcher.setVisible_(map, lyr, e.target.checked, options.groupSelectStyle);
                    render(lyr);
                };
                li.appendChild(input);
                label.htmlFor = checkboxId;
            }

            label.innerHTML = lyrTitle;
            li.appendChild(label);
            var ul = document.createElement('ul');
            li.appendChild(ul);

            LayerSwitcher.renderLayers_(map, lyr, ul, options, render);

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
            input.indeterminate = lyr.get('indeterminate');
            input.onchange = function(e) {
                LayerSwitcher.setVisible_(map, lyr, e.target.checked, options.groupSelectStyle);
                render(lyr);
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
    * @param {ol/Map~Map} map The map instance.
    * @param {ol/layer/Group~LayerGroup} lyr Group layer whose children will be rendered.
    * @param {Element} elm DOM element that children will be appended to.
    */
    static renderLayers_(map, lyr, elm, options, render) {
        var lyrs = lyr.getLayers().getArray().slice().reverse();
        for (var i = 0, l; i < lyrs.length; i++) {
            l = lyrs[i];
            if (l.get('title')) {
                elm.appendChild(LayerSwitcher.renderLayer_(map, l, i, options, render));
            }
        }
    }

    /**
    * **Static** Call the supplied function for each layer in the passed layer group
    * recursing nested groups.
    * @param {ol/layer/Group~LayerGroup} lyr The layer group to start iterating from.
    * @param {Function} fn Callback which will be called for each `ol/layer/Base~BaseLayer`
    * found under `lyr`. The signature for `fn` is the same as `ol/Collection~Collection#forEach`
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
    * @private
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
