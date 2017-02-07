import ol = require("openlayers");

/**
 * assigns undefined values
 */
function defaults<A, B>(a: A, ...b: B[]): A & B {
    b.forEach(b => {
        Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
    });
    return <A & B>a;
}

/**
 * NodeList -> array
 */
function asArray<T extends HTMLInputElement>(list: NodeList) {
    let result = <Array<T>>new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        result.push(<T>list[i]);
    }
    return result;
}

/**
 * Creates an array containing all sub-layers
 */
function allLayers(lyr: ol.Map | ol.layer.Group) {
    let result = <Array<ol.layer.Base>>[];
    lyr.getLayers().forEach(function (lyr, idx, a) {
        result.push(lyr);
        if ("getLayers" in lyr) {
            result = result.concat(allLayers(<ol.layer.Group>lyr));
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

export interface ILayerSwitcherOptions {
    tipLabel?: string;
    openOnMouseOver?: boolean;
    closeOnMouseOut?: boolean;
    openOnClick?: boolean;
    closeOnClick?: boolean;
    className?: string;
    target?: HTMLElement;
}

const DEFAULT_OPTIONS: ILayerSwitcherOptions = {
    tipLabel: 'Layers',
    openOnMouseOver: false,
    closeOnMouseOut: false,
    openOnClick: true,
    closeOnClick: true,
    className: 'layer-switcher',
    target: <HTMLElement>null
};

export class LayerSwitcher extends ol.control.Control {

    private state: Array<{ container: HTMLElement; input: HTMLInputElement; layer: ol.layer.Base }>;
    private unwatch: Array<() => void>;

    hiddenClassName: string;
    shownClassName: string;
    panel: HTMLDivElement;
    element: HTMLElement;
    button: HTMLButtonElement;

    /**
     * OpenLayers 3 Layer Switcher Control.
     * See [the examples](./examples) for usage.
     * @param opt_options Control options, extends olx.control.ControlOptions adding:
     *                              **`tipLabel`** `String` - the button tooltip.
     */
    constructor(options?: ILayerSwitcherOptions) {
        options = defaults(options || {}, DEFAULT_OPTIONS);
        super(options);
        this.afterCreate(options);
    }

    private afterCreate(options: typeof DEFAULT_OPTIONS) {

        this.hiddenClassName = `ol-unselectable ol-control ${options.className}`;
        this.shownClassName = this.hiddenClassName + ' shown';

        let element = document.createElement('div');
        element.className = this.hiddenClassName;

        let button = this.button = document.createElement('button');
        button.setAttribute('title', options.tipLabel);
        element.appendChild(button);

        this.panel = document.createElement('div');
        this.panel.className = 'panel';
        element.appendChild(this.panel);

        this.unwatch = [];

        this.element = element;
        this.setTarget(options.target);

        if (options.openOnMouseOver) {
            element.addEventListener("mouseover", () => this.showPanel());
        }
        if (options.closeOnMouseOut) {
            element.addEventListener("mouseout", () => this.hidePanel());
        }
        if (options.openOnClick || options.closeOnClick) {
            button.addEventListener('click', e => {
                this.isVisible() ? options.closeOnClick && this.hidePanel() : options.openOnClick && this.showPanel();
                e.preventDefault();
            });
        }

    }

    dispatch(name: string, args?: any) {
        let event = new Event(name);
        args && Object.keys(args).forEach(k => event[k] = args[k]);
        this["dispatchEvent"](event);
    }

    isVisible() {
        return this.element.className != this.hiddenClassName
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
        this.element.className = this.hiddenClassName;
        this.unwatch.forEach(f => f());
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

        this.state = [];

        let map = this.getMap();
        let view = map.getView();

        this.renderLayers(map, ul);

        {
            let doit = () => {
                let res = view.getResolution();
                this.state.filter(s => !!s.input).forEach(s => {
                    let min = s.layer.getMinResolution();
                    let max = s.layer.getMaxResolution();
                    console.log(res, min, max, s.layer.get("title"));
                    s.input.disabled = !(min <= res && (max === 0 || res < max));
                });
            };
            let h = view.on("change:resolution", doit);
            doit();

            this.unwatch.push(() => view.unByKey(h));
        }
    };

    /**
     * Ensure only the top-most base layer is visible if more than one is visible.
     */
    private ensureTopVisibleBaseLayerShown() {
        let visibleBaseLyrs = allLayers(this.getMap()).filter(l => l.get('type') === 'base' && l.getVisible());
        if (visibleBaseLyrs.length) this.setVisible(visibleBaseLyrs.shift(), true);
    };

    /**
     * Toggle the visible state of a layer.
     * Takes care of hiding other layers in the same exclusive group if the layer
     * is toggle to visible.
     */
    private setVisible(lyr: ol.layer.Base, visible: boolean) {
        if (lyr.getVisible() !== visible) {
            if (visible && lyr.get('type') === 'base') {
                // Hide all other base layers regardless of grouping
                allLayers(this.getMap()).filter(l => l !== lyr && l.get('type') === 'base' && l.getVisible()).forEach(l => this.setVisible(l, false));
            }
            lyr.setVisible(visible);
            this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
        }
    };

    /**
     * Render all layers that are children of a group.
     */
    private renderLayer(lyr: ol.layer.Base, container: HTMLElement) {
        let result: HTMLInputElement;

        let li = document.createElement('li');
        container.appendChild(li);

        let lyrTitle = lyr.get('title');

        let label = document.createElement('label');
        label.htmlFor = uuid();

        lyr.on('load:start', () => li.classList.add("loading"));
        lyr.on('load:end', () => li.classList.remove("loading"));
        li.classList.toggle("loading", true === lyr.get("loading"));

        if ('getLayers' in lyr && !lyr.get('combine')) {

            if (!lyr.get('label-only')) {
                let input = result = document.createElement('input');
                input.id = label.htmlFor;
                input.type = 'checkbox';
                input.checked = lyr.getVisible();

                input.addEventListener('change', () => {
                    ul.classList.toggle('hide-layer-group', !input.checked);
                    this.setVisible(lyr, input.checked);
                    let childLayers = (<ol.layer.Group>lyr).getLayers();
                    this.state.filter(s => s.container === ul && s.input && s.input.checked).forEach(state => {
                        this.setVisible(state.layer, input.checked);
                    });
                });
                li.appendChild(input);
            }

            li.classList.add('group');
            label.innerHTML = lyrTitle;
            li.appendChild(label);
            let ul = document.createElement('ul');
            result && ul.classList.toggle('hide-layer-group', !result.checked);
            li.appendChild(ul);

            this.renderLayers(<ol.layer.Group>lyr, ul);

        } else {

            li.classList.add('layer');
            let input = result = document.createElement('input');
            input.id = label.htmlFor;

            if (lyr.get('type') === 'base') {
                input.classList.add('basemap');
                input.type = 'radio';
                input.addEventListener("change", () => {
                    if (input.checked) {
                        asArray<HTMLInputElement>(this.panel.getElementsByClassName("basemap")).filter(i => i.tagName === "INPUT").forEach(i => {
                            if (i.checked && i !== input) i.checked = false;
                        })
                    }
                    this.setVisible(lyr, input.checked);
                });
            } else {
                input.type = 'checkbox';
                input.addEventListener("change", () => {
                    this.setVisible(lyr, input.checked);
                });
            }
            input.checked = lyr.get('visible');
            li.appendChild(input);

            label.innerHTML = lyrTitle;
            li.appendChild(label);

        }

        this.state.push({
            container: container,
            input: result,
            layer: lyr
        });

    }

    /**
     * Render all layers that are children of a group.
     */
    private renderLayers(map: ol.Map | ol.layer.Group, elm: HTMLElement) {
        var lyrs = map.getLayers().getArray().slice().reverse();
        return lyrs.filter(l => !!l.get('title')).forEach(l => this.renderLayer(l, elm));
    }

}
