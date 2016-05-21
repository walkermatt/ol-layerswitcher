# OpenLayers 3 LayerSwitcher

Grouped layer list control for an OL3 map.

All layers should have a `title` property and base layers should have a `type` property set to `base`. Group layers (`ol.layer.Group`) can be used to visually group layers together. See [examples/layerswitcher.js](examples/layerswitcher.js) for usage.

## Examples

The examples demonstrate usage and can be viewed online thanks to [RawGit](http://rawgit.com/):

* [Basic usage](https://rawgit.com/ca0v/ol3-layerswitcher/master/examples/rawgit.html?run=./layerswitcher)
    * Create a layer switcher control. Each layer to be displayed in the layer switcher has a `title` property as does each Group; each base map layer has a `type: 'base'` property.

The source for all examples can be found in [examples](examples).

## Also see

If you find the layer switcher useful you might also like the
[ol3-popup](https://github.com/walkermatt/ol3-popup).

