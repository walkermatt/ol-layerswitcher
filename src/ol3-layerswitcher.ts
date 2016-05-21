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

/**
* @desc Apply workaround to enable scrolling of overflowing content within an
* element. Adapted from https://gist.github.com/chrismbarr/4107472
*/
function enableTouchScroll(elm) {
    if (isTouchDevice()) {
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
 * @desc Determine if the current browser supports touch events. Adapted from
 * https://gist.github.com/chrismbarr/4107472
 */
function isTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

const DEFAULT_OPTIONS = {
    tipLabel: 'Layers',
    target: <HTMLElement>null
};

class LayerSwitcher extends ol.control.Control {

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
    constructor(options?: typeof DEFAULT_OPTIONS) {
        options = defaults(options || {}, DEFAULT_OPTIONS);       
        // hack to workaround base constructor not being called first
        super(this.beforeCreate(options));
    }

    private beforeCreate(options: typeof DEFAULT_OPTIONS) {

        this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (isTouchDevice()) {
            this.hiddenClassName += ' touch';
        }
        this.shownClassName = this.hiddenClassName + ' shown';

        let element = document.createElement('div');
        element.className = this.hiddenClassName;

        let button = this.button = document.createElement('button');
        button.setAttribute('title', options.tipLabel);
        element.appendChild(button);

        this.panel = document.createElement('div');
        this.panel.className = 'panel';
        element.appendChild(this.panel);
        enableTouchScroll(this.panel);

        button.addEventListener('click', e => {
            this.isVisible() ? this.hidePanel() : this.showPanel();
            e.preventDefault();
        });

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
        let lyrId = uuid();

        let label = document.createElement('label');

        if ('getLayers' in lyr && !lyr.get('combine')) {

            if (!lyr.get('label-only')) {
                let input = result = document.createElement('input');
                input.type = 'checkbox';
                input.checked = lyr.getVisible();

                input.addEventListener('change', () => {
                    ul.classList.toggle('hide-layer-group', !input.checked);
                    this.setVisible(lyr, input.checked);
                    let childLayers = (<ol.layer.Group>lyr).getLayers();
                    childLayers.forEach((l, i) => {
                        if (childItems[i] && childItems[i].checked) {
                            this.setVisible(l, input.checked);
                        }
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

            let childItems = this.renderLayers(<ol.layer.Group>lyr, ul);

        } else {

            li.classList.add('layer');
            let input = result = document.createElement('input');
            input.classList.add("basemap");
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
            input.id = lyrId;
            input.checked = lyr.get('visible');
            li.appendChild(input);

            label.htmlFor = lyrId;
            label.innerHTML = lyrTitle;
            li.appendChild(label);

        }

        return result;

    }

    /**
     * Render all layers that are children of a group.
     */
    private renderLayers(map: ol.Map | ol.layer.Group, elm: HTMLElement) {
        var lyrs = map.getLayers().getArray().slice().reverse();
        return lyrs.map((l, i) => l.get('title') ? this.renderLayer(l, elm) : null);
    }

}

export = LayerSwitcher;