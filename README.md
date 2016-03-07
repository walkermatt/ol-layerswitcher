# OpenLayers 3 LayerSwitcher

Grouped layer list control for an OL3 map.

All layers should have a `title` property and base layers should have a `type` property set to `base`. Group layers (`ol.layer.Group`) can be used to visually group layers together. See [examples/layerswitcher.js](examples/layerswitcher.js) for usage.

## Examples

The examples demonstrate usage and can be viewed online thanks to [RawGit](http://rawgit.com/):

* [Basic usage](http://rawgit.com/walkermatt/ol3-layerswitcher/master/examples/layerswitcher.html)
    * Create a layer switcher control. Each layer to be displayed in the layer switcher has a `title` property as does each Group; each base map layer has a `type: 'base'` property.
* [Add layer](http://rawgit.com/walkermatt/ol3-layerswitcher/master/examples/addlayer.html)
    * Add a layer to an existing layer group after the layer switcher has been added to the map.
* [Scrolling](http://rawgit.com/walkermatt/ol3-layerswitcher/master/examples/scroll.html)
    * Demonstrate the panel scrolling vertically, control the height of the layer switcher by setting the `max-height` (see [examples/scroll.css](examples/scroll.css)) and it's position relative to the bottom of the map (see the `.layer-switcher.shown` selector in [src/ol3-layerswitcher.css](src/ol3-layerswitcher.css)).

The source for all examples can be found in [examples](examples).

## Tests

To run the tests you'll need to install the dependencies via `npm`. In the root of the repository run:

    npm install

Then run the tests by opening [test/index.html](test/index.html) in a browser.

## API

### `new ol.control.LayerSwitcher(opt_options)`

OpenLayers 3 Layer Switcher Control.
See [the examples](./examples) for usage.

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`opt_options`|`Object`| Control options, extends olx.control.ControlOptions adding: **`tipLabel`** `String` - the button tooltip. |

#### Extends

`ol.control.Control`

#### Methods

##### `showPanel()`

Show the layer panel.

##### `hidePanel()`

Hide the layer panel.

##### `renderPanel()`

Re-draw the layer panel to represent the current state of the layers.

##### `setMap(map)`

Set the map instance the control is associated with.

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`map`|`ol.Map`| The map instance. |


##### `(static) ol.control.LayerSwitcher.forEachRecursive(lyr,fn)`

**Static** Call the supplied function for each layer in the passed layer group
recursing nested groups.

###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
|`lyr`|`ol.layer.Group`| The layer group to start iterating from. |
|`fn`|`function`| Callback which will be called for each `ol.layer.Base` found under `lyr`. The signature for `fn` is the same as `ol.Collection#forEach` |


##### `(static) ol.control.LayerSwitcher.uuid()`

Generate a UUID

## License

MIT (c) Matt Walker.

## Also see

If you find the layer switcher useful you might also like the
[ol3-popup](https://github.com/walkermatt/ol3-popup).

