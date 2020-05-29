import { Group, Heatmap, Image, Layer, Tile, Vector, VectorImage, VectorTile } from 'ol/layer';
import BaseLayer from 'ol/layer/Base';
import Control, { Options as ControlOptions } from 'ol/control/Control';
import PluggableMap from 'ol/PluggableMap';

type GroupSelectStyle = 'none' | 'children' | 'group';

export interface Options extends ControlOptions {
    activationMode?: 'click' | 'mouseover';
    collapseLabel?: string;
    label?: string;
    tipLabel?: string;
    groupSelectStyle?: GroupSelectStyle;
    reverse?: boolean
}

export default class LayerSwitcher extends Control {
    constructor(options?: Options);
    static isBaseGroup(lyr: BaseLayer): boolean;
    static renderPanel(map: PluggableMap, panel: Element, options?: {groupSelectStyle?: GroupSelectStyle; reverse?: boolean;}): void;
    static setGroupVisibility(map: PluggableMap): void;
    static setChildVisibility(map: PluggableMap): void;
    static forEachRecursive(lyr: Group, fn: (lry: BaseLayer, idx: number, a: BaseLayer[]) => void): void
    getGroupsAndLayers(
        lyr: PluggableMap,
        filterFn?: (l: BaseLayer, idx: number, a: BaseLayer[]) => boolean,
      ): (Group | Heatmap | Image | Layer | Tile | Vector | VectorImage | VectorTile)[];
    hidePanel(): void;
    renderPanel(): void
    setMap(map: PluggableMap): void;
    showPanel(): void;
    uuid(): string;
}