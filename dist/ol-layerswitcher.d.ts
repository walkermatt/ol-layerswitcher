import Control from 'ol/control/Control';
import { Options as ControlOptions } from 'ol/control/Control';
import PluggableMap from 'ol/PluggableMap';
import BaseLayer from 'ol/layer/Base';
import GroupLayer from 'ol/layer/Group';
declare type GroupSelectStyle = 'none' | 'children' | 'group';
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
    private activationMode;
    private startActive;
    private groupSelectStyle;
    private reverse;
    private mapListeners;
    private hiddenClassName;
    private shownClassName;
    private panel;
    constructor(opt_options: Options);
    /**
     * Set the map instance the control is associated with.
     * @param {ol/Map~Map} map The map instance.
     */
    setMap(map: PluggableMap): void;
    /**
     * Show the layer panel.
     */
    showPanel(): void;
    /**
     * Hide the layer panel.
     */
    hidePanel(): void;
    /**
     * Re-draw the layer panel to represent the current state of the layers.
     */
    renderPanel(): void;
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
    static renderPanel(map: PluggableMap, panel: HTMLElement, options: RenderOptions): void;
    static isBaseGroup(lyr: BaseLayer): boolean;
    static setGroupVisibility(map: PluggableMap): void;
    static setChildVisibility(map: PluggableMap): void;
    /**
     * **Static** Ensure only the top-most base layer is visible if more than one is visible.
     * @param {ol/Map~Map} map The map instance.
     * @private
     */
    static ensureTopVisibleBaseLayerShown_(map: PluggableMap, groupSelectStyle: GroupSelectStyle): void;
    static getGroupsAndLayers(lyr: PluggableMap | GroupLayer, filterFn: Function): BaseLayer[];
    /**
     * **Static** Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     * @private
     * @param {ol/Map~Map} map The map instance.
     * @param {ol/layer/Base~BaseLayer} lyr layer whose visibility will be toggled.
     * @param {Boolean} visible Set whether the layer is shown
     * @param {String} groupSelectStyle either:
     *   `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     */
    static setVisible_(map: PluggableMap, lyr: BaseLayer, visible: boolean, groupSelectStyle: GroupSelectStyle): void;
    /**
     * **Static** Render all layers that are children of a group.
     * @private
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
     */
    static renderLayer_(map: PluggableMap, lyr: BaseLayer, idx: number, options: RenderOptions, render: Function): HTMLLIElement;
    /**
     * **Static** Render all layers that are children of a group.
     * @private
     * @param {ol/Map~Map} map The map instance.
     * @param {ol/layer/Group~LayerGroup} lyr Group layer whose children will be rendered.
     * @param {Element} elm DOM element that children will be appended to.
     * @param {Object} options Options for groups and layers
     * @param {String} options.groupSelectStyle either `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     * @param {boolean} options.reverse Reverse the layer order. Defaults to true.
     * @param {Function} render Callback for change event on layer
     */
    static renderLayers_(map: PluggableMap, lyr: PluggableMap | GroupLayer, elm: HTMLElement, options: RenderOptions, render: Function): void;
    /**
     * **Static** Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param {ol/layer/Group~LayerGroup} lyr The layer group to start iterating from.
     * @param {Function} fn Callback which will be called for each `ol/layer/Base~BaseLayer`
     * found under `lyr`. The signature for `fn` is the same as `ol/Collection~Collection#forEach`
     */
    static forEachRecursive(lyr: PluggableMap | GroupLayer, fn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => void): void;
    /**
     * **Static** Generate a UUID
     * Adapted from http://stackoverflow.com/a/2117523/526860
     * @returns {String} UUID
     */
    static uuid(): string;
    /**
     * @private
     * @desc Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     * @param {HTMLElement} elm Element on which to enable touch scrolling
     */
    static enableTouchScroll_(elm: HTMLElement): void;
    /**
     * @private
     * @desc Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     * @returns {Boolean} True if client can have 'TouchEvent' event
     */
    static isTouchDevice_(): boolean;
    /**
     * Fold/unfold layer group
     * @private
     * @param {ol/layer/Group~LayerGroup} lyr Layer group to fold/unfold
     * @param {HTMLElement} li List item containing layer group
     */
    static toggleFold_(lyr: GroupLayer, li: HTMLElement): void;
    /**
     * If a valid groupSelectStyle value is not provided then return the default
     * @private
     * @param {String} groupSelectStyle The string to check for validity
     * @returns {String} The value groupSelectStyle, if valid, the default otherwise
     */
    static getGroupSelectStyle(groupSelectStyle: GroupSelectStyle): GroupSelectStyle;
}
export {};
