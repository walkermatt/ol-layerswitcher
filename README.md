# OpenLayers 3 LayerSwitcher

Grouped layer list control for an OL3 map.

All layers should have a `title` property and base layers should have a `type` property set to `base`. Group layers (`ol.layer.Group`) can be used to visually group layers together. See [examples/layerswitcher.js](examples/layerswitcher.js) for usage.

## Examples

* [master](https://rawgit.com/ca0v/ol3-layerswitcher/master/rawgit.html)
* [2.0.5](https://rawgit.com/ca0v/ol3-layerswitcher/v2.0.5/rawgit.html)
* [2.0.4](https://cdn.rawgit.com/ca0v/ol3-layerswitcher/v2.0.4/rawgit.html)

## Build

* tsd install
* bower install
* tsc -w

## Consume

* `typings install ol3-layerswitcher=github:ca0v/layerswitcher/built/index.d.ts#v2.0.5 --save`
* `bower install ol3-layerswitcher=git://github.com/ca0v/layerswitcher.git#v2.0.5 --save`
