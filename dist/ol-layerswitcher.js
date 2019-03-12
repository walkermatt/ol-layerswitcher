(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/control/Control'), require('ol/Observable')) :
	typeof define === 'function' && define.amd ? define(['ol/control/Control', 'ol/Observable'], factory) :
	(global.LayerSwitcher = factory(global.ol.control.Control,global.ol.Observable));
}(this, (function (Control,Observable) { 'use strict';

Control = 'default' in Control ? Control['default'] : Control;
Observable = 'default' in Observable ? Observable['default'] : Observable;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var CSS_PREFIX = 'layer-switcher-';

/**
 * OpenLayers Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} opt_options Control options, extends olx.control.ControlOptions adding:
 * **`tipLabel`** `String` - the button tooltip.
 */

var LayerSwitcher = function (_Control) {
    inherits(LayerSwitcher, _Control);

    function LayerSwitcher(opt_options) {
        classCallCheck(this, LayerSwitcher);


        var options = opt_options || {};

        var tipLabel = options.tipLabel ? options.tipLabel : 'Legend';

        var element = document.createElement('div');

        var _this = possibleConstructorReturn(this, (LayerSwitcher.__proto__ || Object.getPrototypeOf(LayerSwitcher)).call(this, { element: element, target: options.target }));

        _this.mapListeners = [];

        _this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (LayerSwitcher.isTouchDevice_()) {
            _this.hiddenClassName += ' touch';
        }
        _this.shownClassName = 'shown';

        element.className = _this.hiddenClassName;

        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        element.appendChild(button);

        _this.panel = document.createElement('div');
        _this.panel.className = 'panel';
        element.appendChild(_this.panel);
        LayerSwitcher.enableTouchScroll_(_this.panel);

        var this_ = _this;

        button.onmouseover = function (e) {
            this_.showPanel();
        };

        button.onclick = function (e) {
            e = e || window.event;
            this_.showPanel();
            e.preventDefault();
        };

        this_.panel.onmouseout = function (e) {
            e = e || window.event;
            if (!this_.panel.contains(e.toElement || e.relatedTarget)) {
                this_.hidePanel();
            }
        };

        return _this;
    }

    /**
    * Set the map instance the control is associated with.
    * @param {ol.Map} map The map instance.
    */


    createClass(LayerSwitcher, [{
        key: 'setMap',
        value: function setMap(map) {
            // Clean up listeners associated with the previous map
            for (var i = 0, key; i < this.mapListeners.length; i++) {
                Observable.unByKey(this.mapListeners[i]);
            }
            this.mapListeners.length = 0;
            // Wire up listeners etc. and store reference to new map
            get(LayerSwitcher.prototype.__proto__ || Object.getPrototypeOf(LayerSwitcher.prototype), 'setMap', this).call(this, map);
            if (map) {
                var this_ = this;
                this.mapListeners.push(map.on('pointerdown', function () {
                    this_.hidePanel();
                }));
                this.renderPanel();
            }
        }

        /**
        * Show the layer panel.
        */

    }, {
        key: 'showPanel',
        value: function showPanel() {
            if (!this.element.classList.contains(this.shownClassName)) {
                this.element.classList.add(this.shownClassName);
                this.renderPanel();
            }
        }

        /**
        * Hide the layer panel.
        */

    }, {
        key: 'hidePanel',
        value: function hidePanel() {
            if (this.element.classList.contains(this.shownClassName)) {
                this.element.classList.remove(this.shownClassName);
            }
        }

        /**
        * Re-draw the layer panel to represent the current state of the layers.
        */

    }, {
        key: 'renderPanel',
        value: function renderPanel() {
            LayerSwitcher.renderPanel(this.getMap(), this.panel);
        }

        /**
        * **Static** Re-draw the layer panel to represent the current state of the layers.
        * @param {ol.Map} map The OpenLayers Map instance to render layers for
        * @param {Element} panel The DOM Element into which the layer tree will be rendered
        */

    }], [{
        key: 'renderPanel',
        value: function renderPanel(map, panel) {

            LayerSwitcher.ensureTopVisibleBaseLayerShown_(map);

            while (panel.firstChild) {
                panel.removeChild(panel.firstChild);
            }

            map.getLayers().forEach(function (lyr) {
                LayerSwitcher.setParentAndType_(lyr, null);
            });

            var ul = document.createElement('ul');
            panel.appendChild(ul);
            // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
            LayerSwitcher.renderLayers_(map, map, ul, 'layer-switcher');

            // We now set the indeterminate state of each layer
            map.getLayers().forEach(function (lyr) {
                LayerSwitcher.setIndeterminateState_(lyr);
            });
        }

        /**
         * Sets the layer's parent attribute and set the layer's type
         * to 'basegroup' if any children are a base layer or group.
         *
         * @param      {ol.layer.Base}  lyr     The layer
         * @param      {ol.layer.Base}  parent  The layer's parent
         */

    }, {
        key: 'setParentAndType_',
        value: function setParentAndType_(lyr, parent) {
            lyr.set('parent', parent);
            if (lyr.getLayers) {
                lyr.getLayers().forEach(function (l) {
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

    }, {
        key: 'ensureTopVisibleBaseLayerShown_',
        value: function ensureTopVisibleBaseLayerShown_(map) {
            var lastVisibleBaseLyr;
            LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
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

    }, {
        key: 'setVisible_',
        value: function setVisible_(map, lyr, visible) {
            lyr.setVisible(visible);
            if (visible && lyr.get('type') === 'base') {
                // Hide all other base layers regardless of grouping
                LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
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

    }, {
        key: 'setNestedLayersVisible_',
        value: function setNestedLayersVisible_(map, lyr, visible) {
            var lyrVisible = lyr.getVisible();
            var lyrs = lyr.getLayers().getArray().slice().reverse();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = lyrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var l = _step.value;

                    var subCheckbox = document.getElementById(l.get('id'));
                    if (subCheckbox) {
                        subCheckbox.checked = lyrVisible;
                        subCheckbox.indeterminate = false;
                    }
                    LayerSwitcher.setVisible_(map, l, lyrVisible);
                    if (l.getLayers && !lyr.get('combine')) {
                        LayerSwitcher.setNestedLayersVisible_(map, l, visible);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         * Get a layer's indeterminate state.
         * @private
         * @param      {ol.layer.Base}  layer   The layer to check
         * @return     {boolean}  The layer's indeterminate state
         */

    }, {
        key: 'indeterminate_',
        value: function indeterminate_(layer) {
            var checkbox = document.getElementById(layer.get('id'));
            return checkbox && checkbox.indeterminate;
        }

        /**
         * Sets the indeterminate state of a layer by checking its children.
         *
         * @param      {ol.layer.Base}  lyr The layer
         */

    }, {
        key: 'setIndeterminateState_',
        value: function setIndeterminateState_(lyr) {
            if (lyr.getLayers && (!lyr.get('type') || !lyr.get('type').startsWith('base'))) {
                // First set the indeterminate state of our children
                var children = lyr.getLayers().getArray();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var l = _step2.value;

                        LayerSwitcher.setIndeterminateState_(l);
                    }
                    // We are indeterminate if any of our children differ in
                    // visibility or are indeterminate
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (children.length) {
                    var visible = children[0].getVisible();
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = children.slice(1)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _l = _step3.value;

                            if (LayerSwitcher.indeterminate_(_l) || visible !== _l.getVisible()) {
                                var checkbox = document.getElementById(lyr.get('id'));
                                if (checkbox) {
                                    checkbox.indeterminate = true;
                                    checkbox.checked = false;
                                    break;
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            }
        }

        /**
        * **Static** Check the visibility of siblings and set their parent
        *            state to indeterminate if they differ.
        * @private
        * @param {ol.layer.Base} The layer to check
        */

    }, {
        key: 'checkParentIndeterminate_',
        value: function checkParentIndeterminate_(lyr) {
            var parent = lyr.get('parent');
            if (parent) {
                var lyrs = parent.getLayers().getArray();
                var visible = lyr.getVisible();
                var sameState = true;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = lyrs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var l = _step4.value;

                        if (LayerSwitcher.indeterminate_(l) || lyr !== l && visible !== l.getVisible()) {
                            sameState = false;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                var checkboxId = parent.get('id');
                var parentCheckbox = document.getElementById(checkboxId);
                if (sameState) {
                    parentCheckbox.indeterminate = false;
                    parentCheckbox.checked = visible;
                    parent.setVisible(visible);
                } else {
                    parentCheckbox.indeterminate = true;
                    parentCheckbox.checked = false;
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
        * @param {String} lyrId Unique identifier of the layer.
        */

    }, {
        key: 'renderLayer_',
        value: function renderLayer_(map, lyr, idx, lyrId) {

            var li = document.createElement('li');

            var lyrTitle = lyr.get('title');

            lyr.set('id', lyrId);

            var label = document.createElement('label');
            label.id = lyrId + '-label';

            if (lyr.getLayers && !lyr.get('combine')) {

                if (!lyr.get('type') || !lyr.get('type').startsWith('base')) {
                    var _input = document.createElement('input');
                    _input.type = 'checkbox';
                    _input.id = lyrId;
                    _input.checked = lyr.get('visible');
                    _input.onchange = function (e) {
                        LayerSwitcher.setVisible_(map, lyr, e.target.checked);
                        LayerSwitcher.checkParentIndeterminate_(lyr);
                    };
                    li.appendChild(_input);
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
                    label.htmlFor = lyrId;
                }

                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul = document.createElement('ul');
                li.appendChild(ul);

                LayerSwitcher.renderLayers_(map, lyr, ul, lyrId);
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
                input.onchange = function (e) {
                    LayerSwitcher.setVisible_(map, lyr, e.target.checked);
                    if (lyr.get('type') !== 'base') {
                        LayerSwitcher.checkParentIndeterminate_(lyr);
                    }
                };
                li.appendChild(input);

                label.htmlFor = lyrId;
                label.innerHTML = lyrTitle;

                var rsl = map.getView().getResolution();
                if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()) {
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

    }, {
        key: 'renderLayers_',
        value: function renderLayers_(map, lyr, elm, lyrId) {
            var lyrs = lyr.getLayers().getArray().slice().reverse();
            for (var i = 0, l; i < lyrs.length; i++) {
                l = lyrs[i];
                if (l.get('title')) {
                    elm.appendChild(LayerSwitcher.renderLayer_(map, l, i, lyrId + '-' + i));
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

    }, {
        key: 'forEachRecursive',
        value: function forEachRecursive(lyr, fn) {
            lyr.getLayers().forEach(function (lyr, idx, a) {
                fn(lyr, idx, a);
                if (lyr.getLayers) {
                    LayerSwitcher.forEachRecursive(lyr, fn);
                }
            });
        }

        /**
        * @private
        * @desc Apply workaround to enable scrolling of overflowing content within an
        * element. Adapted from https://gist.github.com/chrismbarr/4107472
        */

    }, {
        key: 'enableTouchScroll_',
        value: function enableTouchScroll_(elm) {
            if (LayerSwitcher.isTouchDevice_()) {
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

    }, {
        key: 'isTouchDevice_',
        value: function isTouchDevice_() {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        }

        /**
        * Fold/unfold layer group
        */

    }, {
        key: 'toggleFold_',
        value: function toggleFold_(lyr, li) {
            li.classList.remove(CSS_PREFIX + lyr.get('fold'));
            lyr.set('fold', lyr.get('fold') === 'open' ? 'close' : 'open');
            li.classList.add(CSS_PREFIX + lyr.get('fold'));
        }
    }]);
    return LayerSwitcher;
}(Control);

if (window.ol && window.ol.control) {
    window.ol.control.LayerSwitcher = LayerSwitcher;
}

return LayerSwitcher;

})));
