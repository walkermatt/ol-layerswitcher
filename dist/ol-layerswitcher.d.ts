import Control from 'ol/control/Control';
import { EventsKey } from 'ol/events';
import { Options as ControlOptions } from 'ol/control/Control';
import PluggableMap from 'ol/PluggableMap';
import BaseLayer from 'ol/layer/Base';
import GroupLayer from 'ol/layer/Group';
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
    protected activationMode: 'mouseover' | 'click';
    protected startActive: boolean;
    protected groupSelectStyle: 'none' | 'children' | 'group';
    protected reverse: boolean;
    protected mapListeners: Array<EventsKey>;
    protected hiddenClassName: string;
    protected shownClassName: string;
    protected panel: HTMLElement;
    constructor(opt_options?: Options);
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
    /**
     * **Static** Determine if a given layer group contains base layers
     * @param {ol/layer/Group~GroupLayer} grp GroupLayer to test
     * @returns {boolean}
     */
    static isBaseGroup(grp: GroupLayer): boolean;
    protected static setGroupVisibility(map: PluggableMap): void;
    protected static setChildVisibility(map: PluggableMap): void;
    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     * @param {ol/Map~Map} map The map instance.
     * @param {String} groupSelectStyle either:
     *   `'none'` - groups don't get a checkbox,
     *   `'children'` (default) groups have a checkbox and affect child visibility or
     *   `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
     * @protected
     */
    protected static ensureTopVisibleBaseLayerShown(map: PluggableMap, groupSelectStyle: GroupSelectStyle): void;
    /**
     * **Static** Get an Array of all layers and groups displayed by the LayerSwitcher (has a `'title'` property)
     * contained by the specified map or layer group; optionally filtering via `filterFn`
     * @param {ol/Map~Map|ol/layer/Group~GroupLayer} grp The map or layer group for which layers are found.
     * @param {Function} filterFn Optional function used to filter the returned layers
     * @returns {Array<ol/layer/Base~BaseLayer>}
     */
    static getGroupsAndLayers(grp: PluggableMap | GroupLayer, filterFn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => boolean): BaseLayer[];
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
    protected static setVisible_(map: PluggableMap, lyr: BaseLayer, visible: boolean, groupSelectStyle: GroupSelectStyle): void;
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
    protected static renderLayer_(map: PluggableMap, lyr: BaseLayer, idx: number, options: RenderOptions, render: (changedLyr: BaseLayer) => void): HTMLElement;
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
    protected static renderLayers_(map: PluggableMap, lyr: PluggableMap | GroupLayer, elm: HTMLElement, options: RenderOptions, render: (changedLyr: BaseLayer) => void): void;
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
     * Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     * @param {HTMLElement} elm Element on which to enable touch scrolling
     * @protected
     */
    protected static enableTouchScroll_(elm: HTMLElement): void;
    /**
     * Determine if the current browser supports touch events. Adapted from
     * https://gist.github.com/chrismbarr/4107472
     * @returns {Boolean} True if client can have 'TouchEvent' event
     * @protected
     */
    protected static isTouchDevice_(): boolean;
    /**
     * Fold/unfold layer group
     * @param {ol/layer/Group~LayerGroup} lyr Layer group to fold/unfold
     * @param {HTMLElement} li List item containing layer group
     * @protected
     */
    protected static toggleFold_(lyr: GroupLayer, li: HTMLElement): void;
    /**
     * If a valid groupSelectStyle value is not provided then return the default
     * @param {String} groupSelectStyle The string to check for validity
     * @returns {String} The value groupSelectStyle, if valid, the default otherwise
     * @protected
     */
    protected static getGroupSelectStyle(groupSelectStyle: GroupSelectStyle): GroupSelectStyle;
}
export { BaseLayerOptions, GroupLayerOptions };
