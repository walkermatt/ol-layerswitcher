import Control from 'ol/control/Control';
import { EventsKey } from 'ol/events';
import { Options as ControlOptions } from 'ol/control/Control';
import PluggableMap from 'ol/PluggableMap';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import { Options as OlLayerBaseOptions } from 'ol/layer/Base';
import { Options as OlLayerGroupOptions } from 'ol/layer/Group';
/**
 * OpenLayers LayerSwitcher Control, displays a list of layers and groups
 * associated with a map which have a `title` property.
 *
 * To be shown in the LayerSwitcher panel layers must have a `title` property;
 * base map layers should have a `type` property set to `base`. Group layers
 * (`LayerGroup`) can be used to visually group layers together; a group
 * with a `fold` property set to either `'open'` or `'close'` will be displayed
 * with a toggle.
 *
 * See [BaseLayerOptions](#baselayeroptions) for a full list of LayerSwitcher
 * properties for layers (`TileLayer`, `ImageLayer`, `VectorTile` etc.) and
 * [GroupLayerOptions](#grouplayeroptions) for group layer (`LayerGroup`)
 * LayerSwitcher properties.
 *
 * Layer and group properties can either be set by adding extra properties
 * to their options when they are created or via their set method.
 *
 * Specify a `title` for a Layer by adding a `title` property to it's options object:
 * ```javascript
 * var lyr = new ol.layer.Tile({
 *   // Specify a title property which will be displayed by the layer switcher
 *   title: 'OpenStreetMap',
 *   visible: true,
 *   source: new ol.source.OSM()
 * })
 * ```
 *
 * Alternatively the properties can be set via the `set` method after a layer has been created:
 * ```javascript
 * var lyr = new ol.layer.Tile({
 *   visible: true,
 *   source: new ol.source.OSM()
 * })
 * // Specify a title property which will be displayed by the layer switcher
 * lyr.set('title', 'OpenStreetMap');
 * ```
 *
 * To create a LayerSwitcher and add it to a map, create a new instance then pass it to the map's [`addControl` method](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html#addControl).
 * ```javascript
 * var layerSwitcher = new LayerSwitcher({
 *   reverse: true,
 *   groupSelectStyle: 'group'
 * });
 * map.addControl(layerSwitcher);
 * ```
 *
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param opt_options LayerSwitcher options, see  [LayerSwitcher Options](#options) and [RenderOptions](#renderoptions) which LayerSwitcher `Options` extends for more details.
 */
export default class LayerSwitcher extends Control {
    protected activationMode: 'mouseover' | 'click';
    protected startActive: boolean;
    protected groupSelectStyle: 'none' | 'children' | 'group';
    protected reverse: boolean;
    protected label: string;
    protected collapseLabel: string;
    protected tipLabel: string;
    protected collapseTipLabel: string;
    protected mapListeners: Array<EventsKey>;
    protected hiddenClassName: string;
    protected shownClassName: string;
    protected panel: HTMLElement;
    protected button: HTMLElement;
    constructor(opt_options?: Options);
    /**
     * Set the map instance the control is associated with.
     * @param map The map instance.
     */
    setMap(map: PluggableMap): void;
    /**
     * Show the layer panel. Fires `'show'` event.
     * @fires LayerSwitcher#show
     */
    showPanel(): void;
    /**
     * Hide the layer panel. Fires `'hide'` event.
     * @fires LayerSwitcher#hide
     */
    hidePanel(): void;
    /**
     * Update button text content and attributes based on current
     * state
     */
    protected updateButton(): void;
    /**
     * Re-draw the layer panel to represent the current state of the layers.
     */
    renderPanel(): void;
    /**
     * **_[static]_** - Re-draw the layer panel to represent the current state of the layers.
     * @param map The OpenLayers Map instance to render layers for
     * @param panel The DOM Element into which the layer tree will be rendered
     * @param options Options for panel, group, and layers
     */
    static renderPanel(map: PluggableMap, panel: HTMLElement, options: RenderOptions): void;
    /**
     * **_[static]_** - Determine if a given layer group contains base layers
     * @param grp Group to test
     */
    static isBaseGroup(grp: LayerGroup): boolean;
    protected static setGroupVisibility(map: PluggableMap): void;
    protected static setChildVisibility(map: PluggableMap): void;
    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     * @param map The map instance.
     * @param groupSelectStyle
     * @protected
     */
    protected static ensureTopVisibleBaseLayerShown(map: PluggableMap, groupSelectStyle: GroupSelectStyle): void;
    /**
     * **_[static]_** - Get an Array of all layers and groups displayed by the LayerSwitcher (has a `'title'` property)
     * contained by the specified map or layer group; optionally filtering via `filterFn`
     * @param grp The map or layer group for which layers are found.
     * @param filterFn Optional function used to filter the returned layers
     */
    static getGroupsAndLayers(grp: PluggableMap | LayerGroup, filterFn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => boolean): BaseLayer[];
    /**
     * Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     * @protected
     * @param map The map instance.
     * @param lyr layer whose visibility will be toggled.
     * @param visible Set whether the layer is shown
     * @param groupSelectStyle
     * @protected
     */
    protected static setVisible_(map: PluggableMap, lyr: BaseLayer, visible: boolean, groupSelectStyle: GroupSelectStyle): void;
    /**
     * Render all layers that are children of a group.
     * @param map The map instance.
     * @param lyr Layer to be rendered (should have a title property).
     * @param idx Position in parent group list.
     * @param options Options for groups and layers
     * @protected
     */
    protected static renderLayer_(map: PluggableMap, lyr: BaseLayer, idx: number, options: RenderOptions, render: (changedLyr: BaseLayer) => void): HTMLElement;
    /**
     * Render all layers that are children of a group.
     * @param map The map instance.
     * @param lyr Group layer whose children will be rendered.
     * @param elm DOM element that children will be appended to.
     * @param options Options for groups and layers
     * @protected
     */
    protected static renderLayers_(map: PluggableMap, lyr: PluggableMap | LayerGroup, elm: HTMLElement, options: RenderOptions, render: (changedLyr: BaseLayer) => void): void;
    /**
     * **_[static]_** - Call the supplied function for each layer in the passed layer group
     * recursing nested groups.
     * @param lyr The layer group to start iterating from.
     * @param fn Callback which will be called for each layer
     * found under `lyr`.
     */
    static forEachRecursive(lyr: PluggableMap | LayerGroup, fn: (lyr: BaseLayer, idx: number, arr: BaseLayer[]) => void): void;
    /**
     * **_[static]_** - Generate a UUID
     * Adapted from http://stackoverflow.com/a/2117523/526860
     * @returns {String} UUID
     */
    static uuid(): string;
    /**
     * Apply workaround to enable scrolling of overflowing content within an
     * element. Adapted from https://gist.github.com/chrismbarr/4107472
     * @param elm Element on which to enable touch scrolling
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
     * @param lyr Layer group to fold/unfold
     * @param li List item containing layer group
     * @protected
     */
    protected static toggleFold_(lyr: LayerGroup, li: HTMLElement): void;
    /**
     * If a valid groupSelectStyle value is not provided then return the default
     * @param groupSelectStyle The string to check for validity
     * @returns The value groupSelectStyle, if valid, the default otherwise
     * @protected
     */
    protected static getGroupSelectStyle(groupSelectStyle: GroupSelectStyle): GroupSelectStyle;
}
/**
 * **_[interface]_** - LayerSwitcher Options specified when creating a LayerSwitcher
 * instance, extends [RenderOptions](#renderoptions) and
 * [Control Options](https://openlayers.org/en/latest/apidoc/module-ol_control_Control-Control.html#Control).
 *
 * Default values:
 * ```javascript
 * {
 *   activationMode: 'mouseover',
 *   startActive: false,
 *   label: ''
 *   collapseLabel: '\u00BB',
 *   tipLabel: 'Legend',
 *   collapseTipLabel: 'Collapse legend',
 *   groupSelectStyle: 'children',
 *   reverse: false
 * }
 * ```
 */
interface Options extends ControlOptions, RenderOptions {
    /**
     * Event to use on the button to collapse or expand the panel. Defaults to
     * `"mouseover"`.
     */
    activationMode?: 'mouseover' | 'click';
    /**
     * Whether panel is open when created. Defaults to `false`.
     */
    startActive?: boolean;
    /**
     * Text label to use for the button that opens the panel. E.g.:  `''` (default), `'«'` or `'\u00AB'`, `'+'`.
     */
    label?: string;
    /**
     * Text label to use for the button that closes the panel. E.g.: `'»'` (default) or `'\u00BB'`, `'-'` or `'\u2212'`. Only used when `activationMode: 'mouseover'`.
     */
    collapseLabel?: string;
    /**
     * The button tooltip when the panel is closed.
     */
    tipLabel?: string;
    /**
     * The button tooltip when the panel is open.
     */
    collapseTipLabel?: string;
}
/**
 * **_[interface]_** - LayerSwitcher Render Options as passed to [LayerSwitcher
 * constructor](#layerswitcher) as part of [Options](#options) and [static
 * LayerSwitcher.renderPanel](#renderpanel)
 */
interface RenderOptions {
    /**
     * How layers and groups behave when a given layer's visibility is set. See [GroupSelectStyle type for possible values](#groupselectstyle).
     */
    groupSelectStyle?: GroupSelectStyle;
    /**
     * Should the order of layers in the panel be reversed?
     */
    reverse?: boolean;
}
/**
 * **_[type]_** - How layers and groups behave when a given layer's visibility is set, either:
 * - `'none'` - groups don't get a checkbox,
 * - `'children'` (default) groups have a checkbox and affect child visibility or
 * - `'group'` groups have a checkbox but do not alter child visibility (like QGIS).
 */
declare type GroupSelectStyle = 'none' | 'children' | 'group';
/**
 * **_[interface]_** - Extended BaseLayer Options interface adding properties
 * used by the LayerSwitcher
 */
interface BaseLayerOptions extends OlLayerBaseOptions {
    /**
     * Title of the layer displayed in the LayerSwitcher panel
     */
    title?: string;
    /**
     * Type of the layer, a layer of `type: 'base'` is treated as a base map
     * layer by the LayerSwitcher and is displayed with a radio button
     */
    type?: 'base';
    /**
     * Internal property used to track the indeterminate state of a layer/ group
     *
     * @protected
     */
    indeterminate?: boolean;
}
/**
 * **_[interface]_** - Extended LayerGroup Options interface adding
 * properties used by the LayerSwitcher.
 */
interface GroupLayerOptions extends OlLayerGroupOptions, BaseLayerOptions {
    /**
     * When `true` child layers are not shown in the Layer Switcher panel
     */
    combine?: boolean;
    /**
     * Fold state of the group, if set then the group will be displayed with a
     * button to allow the user to show/ hide the child layers.
     */
    fold?: 'open' | 'close';
}
export { Options, RenderOptions, GroupSelectStyle, BaseLayerOptions, GroupLayerOptions };
