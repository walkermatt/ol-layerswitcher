import Control from 'ol/control/Control';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import { Options as ControlOptions } from 'ol/control/Control';
import PluggableMap from 'ol/PluggableMap';
import BaseLayer from 'ol/layer/Base';
import GroupLayer from 'ol/layer/Group';

// Extend OpenLayers layer and group options types to include the properties
// used by ol-layerswitcher such as `title`, `type`, `fold` etc.
import { Options as BaseLayerOptions } from 'ol/layer/Base';
import { Options as GroupLayerOptions } from 'ol/layer/Group';

declare module 'ol/layer/Base' {
  interface BaseLayerOptions {
    title?: string;
    type?: string;
    indeterminate?: boolean;
  }
}

declare module 'ol/layer/Group' {
  interface GroupLayerOptions {
    combine?: boolean;
    fold?: boolean;
  }
}

const CSS_PREFIX = 'layer-switcher-';

type GroupSelectStyle = 'none' | 'children' | 'group';

interface RenderOptions {
  groupSelectStyle?: GroupSelectStyle;
  reverse?: boolean;
}

interface Options extends ControlOptions, RenderOptions {
  activationMode?: 'mouseover' | 'click';
  startActive?: boolean;
  label?: string;
  collapseLabel?: string;
  tipLabel?: string;
  collapseTipLabel?: string;
  target?: string;
}

/**
 * OpenLayers Layer Switcher Control.
 * See [the examples](./examples) for usage.
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param {Object} opt_options Control options, extends ol/control/Control~Control#options adding:
 * @param {boolean} opt_options.startActive Whether panel is open when created. Defaults to false.
 * @param {String} opt_options.activationMode Event to use on the button to collapse or expand the panel.
 *   `'mouseover'` (default) the layerswitcher panel stays expanded while button or panel are hovered.
 *   `'click'` a click on the button toggles the layerswitcher visibility.
 * @param {String} opt_options.collapseLabel Text label to use for the expanded layerswitcher button. E.g.:
 *   `'»'` (default) or `'\u00BB'`, `'-'` or `'\u2212'`. Not visible if activation mode is `'mouseover'`
 * @param {String} opt_options.label Text label to use for the collapsed layerswitcher button. E.g.:
 *   `''` (default), `'«'` or `'\u00AB'`, `'+'`.
 * @param {String} opt_options.tipLabel the button tooltip.
 * @param {String} opt_options.collapseTipLabel the button tooltip when the panel is open.
 * @param {String} opt_options.groupSelectStyle either `'none'` - groups don't get a checkbox,
 *   `'children'` (default) groups have a checkbox and affect child visibility or
 *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
 * @param {boolean} opt_options.reverse Reverse the layer order. Defaults to true.
 */
export default class LayerSwitcher extends Control {
  protected activationMode: 'mouseover' | 'click';
  protected startActive: boolean;
  protected groupSelectStyle: 'none' | 'children' | 'group';
  protected reverse: boolean;
  protected mapListeners: Array<EventsKey>;
  protected hiddenClassName: string;
  protected shownClassName: string;
  protected panel: HTMLElement;
  constructor(opt_options?: Options) {
    const options = Object.assign({}, opt_options);

    // TODO Next: Rename to showButtonTitle
    const tipLabel = options.tipLabel ? options.tipLabel : 'Legend';

    // TODO Next: Rename to hideButtonTitle
    const collapseTipLabel = options.collapseTipLabel
      ? options.collapseTipLabel
      : 'Collapse legend';

    const element = document.createElement('div');

    super({ element: element, target: options.target });

    this.activationMode = options.activationMode || 'mouseover';

    this.startActive = options.startActive === true;

    // TODO Next: Rename to showButtonContent
    const label = options.label !== undefined ? options.label : '';

    // TODO Next: Rename to hideButtonContent
    const collapseLabel =
      options.collapseLabel !== undefined ? options.collapseLabel : '\u00BB';

    this.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(
      options.groupSelectStyle
    );

    this.reverse = options.reverse !== false;

    this.mapListeners = [];

    this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
    if (LayerSwitcher.isTouchDevice_()) {
      this.hiddenClassName += ' touch';
    }
    this.shownClassName = 'shown';

    element.className = this.hiddenClassName;

    const button = document.createElement('button');
    button.setAttribute('title', tipLabel);
    button.setAttribute('aria-label', tipLabel);
    element.appendChild(button);

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);
    LayerSwitcher.enableTouchScroll_(this.panel);

    button.textContent = label;

    element.classList.add(
      CSS_PREFIX + 'group-select-style-' + this.groupSelectStyle
    );

    element.classList.add(
      CSS_PREFIX + 'activation-mode-' + this.activationMode
    );

    if (this.activationMode === 'click') {
      // TODO Next: Remove in favour of layer-switcher-activation-mode-click
      element.classList.add('activationModeClick');
      if (this.startActive) {
        button.textContent = collapseLabel;
        button.setAttribute('title', collapseTipLabel);
        button.setAttribute('aria-label', collapseTipLabel);
      }
      button.onclick = (e: Event) => {
        const evt = e || window.event;
        if (this.element.classList.contains(this.shownClassName)) {
          this.hidePanel();
          button.textContent = label;
          button.setAttribute('title', tipLabel);
          button.setAttribute('aria-label', tipLabel);
        } else {
          this.showPanel();
          button.textContent = collapseLabel;
          button.setAttribute('title', collapseTipLabel);
          button.setAttribute('aria-label', collapseTipLabel);
        }
        evt.preventDefault();
      };
    } else {
      button.onmouseover = () => {
        this.showPanel();
      };

      button.onclick = (e: Event) => {
        const evt = e || window.event;
        this.showPanel();
        evt.preventDefault();
      };

      this.panel.onmouseout = (evt: MouseEvent) => {
        if (!this.panel.contains(<HTMLElement>evt.relatedTarget)) {
          this.hidePanel();
        }
      };
    }
  }

  /**
   * Set the map instance the control is associated with.
   * @param {ol/Map~Map} map The map instance.
   */
  setMap(map: PluggableMap): void {
    // Clean up listeners associated with the previous map
    for (let i = 0; i < this.mapListeners.length; i++) {
      unByKey(this.mapListeners[i]);
    }
    this.mapListeners.length = 0;
    // Wire up listeners etc. and store reference to new map
    super.setMap(map);
    if (map) {
      if (this.startActive) {
        this.showPanel();
      } else {
        this.renderPanel();
      }
      if (this.activationMode !== 'click') {
        this.mapListeners.push(
          <EventsKey>map.on('pointerdown', () => {
            this.hidePanel();
          })
        );
      }
    }
  }

  /**
   * Show the layer panel.
   */
  showPanel(): void {
    if (!this.element.classList.contains(this.shownClassName)) {
      this.element.classList.add(this.shownClassName);
      this.renderPanel();
    }
  }

  /**
   * Hide the layer panel.
   */
  hidePanel(): void {
    if (this.element.classList.contains(this.shownClassName)) {
      this.element.classList.remove(this.shownClassName);
    }
  }

  /**
   * Re-draw the layer panel to represent the current state of the layers.
   */
  renderPanel(): void {
    this.dispatchEvent('render');
    LayerSwitcher.renderPanel(this.getMap(), this.panel, {
      groupSelectStyle: this.groupSelectStyle,
      reverse: this.reverse
    });
    this.dispatchEvent('rendercomplete');
  }

  /**
   * **Static** Re-draw the layer panel to represent the current state of the layers.
   * @param {ol/Map~Map} map The OpenLayers Map instance to render layers for
   * @param {Element} panel The DOM Element into which the layer tree will be rendered
   * @param {Object} options Options for panel, group, and layers
   * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
   *   `'children'` (default) groups have a checkbox and affect child visibility or
   *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
   * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
   */
  static renderPanel(
    map: PluggableMap,
    panel: HTMLElement,
    options: RenderOptions
  ): void {
    // Create the event.
    const render_event = new Event('render');
    // Dispatch the event.
    panel.dispatchEvent(render_event);

    options = options || {};

    options.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(
      options.groupSelectStyle
    );

    LayerSwitcher.ensureTopVisibleBaseLayerShown(map, options.groupSelectStyle);

    while (panel.firstChild) {
      panel.removeChild(panel.firstChild);
    }

    // Reset indeterminate state for all layers and groups before
    // applying based on groupSelectStyle
    LayerSwitcher.forEachRecursive(map, function (l, _idx, _a) {
      l.set('indeterminate', false);
    });

    if (
      options.groupSelectStyle === 'children' ||
      options.groupSelectStyle === 'none'
    ) {
      // Set visibile and indeterminate state of groups based on
      // their children's visibility
      LayerSwitcher.setGroupVisibility(map);
    } else if (options.groupSelectStyle === 'group') {
      // Set child indetermiate state based on their parent's visibility
      LayerSwitcher.setChildVisibility(map);
    }

    const ul = document.createElement('ul');
    panel.appendChild(ul);
    // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
    LayerSwitcher.renderLayers_(map, map, ul, options, function render(
      _changedLyr: BaseLayer
    ) {
      LayerSwitcher.renderPanel(map, panel, options);
    });

    // Create the event.
    const rendercomplete_event = new Event('rendercomplete');
    // Dispatch the event.
    panel.dispatchEvent(rendercomplete_event);
  }

  /**
   * **Static** Determine if a given layer group contains base layers
   * @param {ol/layer/Group~GroupLayer} grp GroupLayer to test
   * @returns {boolean}
   */
  static isBaseGroup(grp: GroupLayer): boolean {
    if (grp instanceof GroupLayer) {
      const lyrs = grp.getLayers().getArray();
      return lyrs.length && lyrs[0].get('type') === 'base';
    } else {
      return false;
    }
  }

  protected static setGroupVisibility(map: PluggableMap): void {
    // Get a list of groups, with the deepest first
    const groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
      return (
        l instanceof GroupLayer &&
        !l.get('combine') &&
        !LayerSwitcher.isBaseGroup(l)
      );
    }).reverse();
    // console.log(groups.map(g => g.get('title')));
    groups.forEach(function (grp) {
      // TODO Can we use getLayersArray, is it public in the esm build?
      const descendantVisibility = grp.getLayersArray().map(function (l) {
        const state = l.getVisible();
        // console.log('>', l.get('title'), state);
        return state;
      });
      // console.log(descendantVisibility);
      if (
        descendantVisibility.every(function (v) {
          return v === true;
        })
      ) {
        grp.setVisible(true);
        grp.set('indeterminate', false);
      } else if (
        descendantVisibility.every(function (v) {
          return v === false;
        })
      ) {
        grp.setVisible(false);
        grp.set('indeterminate', false);
      } else {
        grp.setVisible(true);
        grp.set('indeterminate', true);
      }
    });
  }

  protected static setChildVisibility(map: PluggableMap): void {
    // console.log('setChildVisibility');
    const groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
      return (
        l instanceof GroupLayer &&
        !l.get('combine') &&
        !LayerSwitcher.isBaseGroup(l)
      );
    });
    groups.forEach(function (grp) {
      const group = <GroupLayer>grp;
      // console.log(group.get('title'));
      const groupVisible = group.getVisible();
      const groupIndeterminate = group.get('indeterminate');
      group
        .getLayers()
        .getArray()
        .forEach(function (l) {
          // console.log('>', l.get('title'));
          l.set('indeterminate', false);
          if ((!groupVisible || groupIndeterminate) && l.getVisible()) {
            l.set('indeterminate', true);
          }
        });
    });
  }

  /**
   * Ensure only the top-most base layer is visible if more than one is visible.
   * @param {ol/Map~Map} map The map instance.
   * @param {String} groupSelectStyle either:
   *   `'none'` - groups don't get a checkbox,
   *   `'children'` (default) groups have a checkbox and affect child visibility or
   *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
   * @protected
   */
  protected static ensureTopVisibleBaseLayerShown(
    map: PluggableMap,
    groupSelectStyle: GroupSelectStyle
  ): void {
    let lastVisibleBaseLyr;
    LayerSwitcher.forEachRecursive(map, function (lyr, _idx, _arr) {
      if (lyr.get('type') === 'base' && lyr.getVisible()) {
        lastVisibleBaseLyr = lyr;
      }
    });
    if (lastVisibleBaseLyr)
      LayerSwitcher.setVisible_(
        map,
        lastVisibleBaseLyr,
        true,
        groupSelectStyle
      );
  }

  /**
   * **Static** Get an Array of all layers and groups displayed by the LayerSwitcher (has a `'title'` property)
   * contained by the specified map or layer group; optionally filtering via `filterFn`
   * @param {ol/Map~Map|ol/layer/Group~GroupLayer} grp The map or layer group for which layers are found.
   * @param {Function} filterFn Optional function used to filter the returned layers
   * @returns {Array<ol/layer/Base~BaseLayer>}
   */
  static getGroupsAndLayers(
    grp: PluggableMap | GroupLayer,
    filterFn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => boolean
  ): BaseLayer[] {
    const layers = [];
    filterFn =
      filterFn ||
      function (_lyr: BaseLayer, _idx: number, _arr: BaseLayer[]) {
        return true;
      };
    LayerSwitcher.forEachRecursive(grp, function (lyr, idx, arr) {
      if (lyr.get('title')) {
        if (filterFn(lyr, idx, arr)) {
          layers.push(lyr);
        }
      }
    });
    return layers;
  }

  /**
   * Toggle the visible state of a layer.
   * Takes care of hiding other layers in the same exclusive group if the layer
   * is toggle to visible.
   * @protected
   * @param {ol/Map~Map} map The map instance.
   * @param {ol/layer/Base~BaseLayer} lyr layer whose visibility will be toggled.
   * @param {Boolean} visible Set whether the layer is shown
   * @param {String} groupSelectStyle either:
   *   `'none'` - groups don't get a checkbox,
   *   `'children'` (default) groups have a checkbox and affect child visibility or
   *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
   * @protected
   */
  protected static setVisible_(
    map: PluggableMap,
    lyr: BaseLayer,
    visible: boolean,
    groupSelectStyle: GroupSelectStyle
  ): void {
    // console.log(lyr.get('title'), visible, groupSelectStyle);
    lyr.setVisible(visible);
    if (visible && lyr.get('type') === 'base') {
      // Hide all other base layers regardless of grouping
      LayerSwitcher.forEachRecursive(map, function (l, _idx, _arr) {
        if (l != lyr && l.get('type') === 'base') {
          l.setVisible(false);
        }
      });
    }
    if (
      lyr instanceof GroupLayer &&
      !lyr.get('combine') &&
      groupSelectStyle === 'children'
    ) {
      lyr.getLayers().forEach((l) => {
        LayerSwitcher.setVisible_(map, l, lyr.getVisible(), groupSelectStyle);
      });
    }
  }

  /**
   * Render all layers that are children of a group.
   * @param {ol/Map~Map} map The map instance.
   * @param {ol/layer/Base~BaseLayer} lyr Layer to be rendered (should have a title property).
   * @param {Number} idx Position in parent group list.
   * @param {Object} options Options for groups and layers
   * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
   *   `'children'` (default) groups have a checkbox and affect child visibility or
   *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
   * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
   * @param {Function} render Callback for change event on layer
   * @returns {HTMLElement} List item containing layer control markup
   * @protected
   */
  protected static renderLayer_(
    map: PluggableMap,
    lyr: BaseLayer,
    idx: number,
    options: RenderOptions,
    render: (changedLyr: BaseLayer) => void
  ): HTMLElement {
    const li = document.createElement('li');

    const lyrTitle = lyr.get('title');

    const checkboxId = LayerSwitcher.uuid();

    const label = document.createElement('label');

    if (lyr instanceof GroupLayer && !lyr.get('combine')) {
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
          const evt = e || window.event;
          LayerSwitcher.toggleFold_(lyr, li);
          evt.preventDefault();
        };
        li.appendChild(btn);
      }

      if (!isBaseGroup && options.groupSelectStyle != 'none') {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = checkboxId;
        input.checked = lyr.getVisible();
        input.indeterminate = lyr.get('indeterminate');
        input.onchange = function (e) {
          const target = <HTMLInputElement>e.target;
          LayerSwitcher.setVisible_(
            map,
            lyr,
            target.checked,
            options.groupSelectStyle
          );
          render(lyr);
        };
        li.appendChild(input);
        label.htmlFor = checkboxId;
      }

      label.innerHTML = lyrTitle;
      li.appendChild(label);
      const ul = document.createElement('ul');
      li.appendChild(ul);

      LayerSwitcher.renderLayers_(map, lyr, ul, options, render);
    } else {
      li.className = 'layer';
      const input = document.createElement('input');
      if (lyr.get('type') === 'base') {
        input.type = 'radio';
        input.name = 'base';
      } else {
        input.type = 'checkbox';
      }
      input.id = checkboxId;
      input.checked = lyr.get('visible');
      input.indeterminate = lyr.get('indeterminate');
      input.onchange = function (e) {
        const target = <HTMLInputElement>e.target;
        LayerSwitcher.setVisible_(
          map,
          lyr,
          target.checked,
          options.groupSelectStyle
        );
        render(lyr);
      };
      li.appendChild(input);

      label.htmlFor = checkboxId;
      label.innerHTML = lyrTitle;

      const rsl = map.getView().getResolution();
      if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()) {
        label.className += ' disabled';
      }

      li.appendChild(label);
    }

    return li;
  }

  /**
   * Render all layers that are children of a group.
   * @param {ol/Map~Map} map The map instance.
   * @param {ol/layer/Group~LayerGroup} lyr Group layer whose children will be rendered.
   * @param {Element} elm DOM element that children will be appended to.
   * @param {Object} options Options for groups and layers
   * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
   *   `'children'` (default) groups have a checkbox and affect child visibility or
   *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
   * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
   * @param {Function} render Callback for change event on layer
   * @protected
   */
  protected static renderLayers_(
    map: PluggableMap,
    lyr: PluggableMap | GroupLayer,
    elm: HTMLElement,
    options: RenderOptions,
    render: (changedLyr: BaseLayer) => void
  ): void {
    let lyrs = lyr.getLayers().getArray().slice();
    if (options.reverse) lyrs = lyrs.reverse();
    for (let i = 0, l; i < lyrs.length; i++) {
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
  static forEachRecursive(
    lyr: PluggableMap | GroupLayer,
    fn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => void
  ): void {
    lyr.getLayers().forEach(function (lyr, idx, a) {
      fn(lyr, idx, a);
      if (lyr instanceof GroupLayer) {
        LayerSwitcher.forEachRecursive(lyr, fn);
      }
    });
  }

  /**
   * **Static** Generate a UUID
   * Adapted from http://stackoverflow.com/a/2117523/526860
   * @returns {String} UUID
   */
  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
      c
    ) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Apply workaround to enable scrolling of overflowing content within an
   * element. Adapted from https://gist.github.com/chrismbarr/4107472
   * @param {HTMLElement} elm Element on which to enable touch scrolling
   * @protected
   */
  protected static enableTouchScroll_(elm: HTMLElement): void {
    if (LayerSwitcher.isTouchDevice_()) {
      let scrollStartPos = 0;
      elm.addEventListener(
        'touchstart',
        function (event) {
          scrollStartPos = this.scrollTop + event.touches[0].pageY;
        },
        false
      );
      elm.addEventListener(
        'touchmove',
        function (event) {
          this.scrollTop = scrollStartPos - event.touches[0].pageY;
        },
        false
      );
    }
  }

  /**
   * Determine if the current browser supports touch events. Adapted from
   * https://gist.github.com/chrismbarr/4107472
   * @returns {Boolean} True if client can have 'TouchEvent' event
   * @protected
   */
  protected static isTouchDevice_(): boolean {
    try {
      document.createEvent('TouchEvent');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Fold/unfold layer group
   * @param {ol/layer/Group~LayerGroup} lyr Layer group to fold/unfold
   * @param {HTMLElement} li List item containing layer group
   * @protected
   */
  protected static toggleFold_(lyr: GroupLayer, li: HTMLElement): void {
    li.classList.remove(CSS_PREFIX + lyr.get('fold'));
    lyr.set('fold', lyr.get('fold') === 'open' ? 'close' : 'open');
    li.classList.add(CSS_PREFIX + lyr.get('fold'));
  }

  /**
   * If a valid groupSelectStyle value is not provided then return the default
   * @param {String} groupSelectStyle The string to check for validity
   * @returns {String} The value groupSelectStyle, if valid, the default otherwise
   * @protected
   */
  protected static getGroupSelectStyle(
    groupSelectStyle: GroupSelectStyle
  ): GroupSelectStyle {
    return ['none', 'children', 'group'].indexOf(groupSelectStyle) >= 0
      ? groupSelectStyle
      : 'children';
  }
}

// Expose LayerSwitcher as ol.control.LayerSwitcher if using a full build of
// OpenLayers
if (window['ol'] && window['ol']['control']) {
  window['ol']['control']['LayerSwitcher'] = LayerSwitcher;
}

export { BaseLayerOptions, GroupLayerOptions };
