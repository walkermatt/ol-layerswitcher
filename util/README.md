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
* [Browserify](examples/browserify/)
    * Example of using ol3-layerswitcher with Browserify (see [examples/browserify/README.md](examples/browserify/README.md) for details of building.

The source for all examples can be found in [examples](examples).

## Tests

To run the tests you'll need to install the dependencies via `npm`. In the root of the repository run:

    npm install

Then run the tests by opening [test/index.html](test/index.html) in a browser.

## API

{% for class in classes -%}

### `new {{ class.longname }}({{ class.signature }})`

{{ class.description }}

#### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
{% for param in class.params %}|`{{ param.name }}`|`{{ param.type.names[0] }}`| {{ param.description }} |{% endfor %}

#### Extends

`{{ class.augments }}`

#### Methods

{% for method in class.methods -%}
##### `{% if method.scope == 'static' %}(static) {{ class.longname }}.{% endif %}{{ method.name }}({{ method.signature }})`

{{ method.description }}

{% if method.params -%}
###### Parameters:

|Name|Type|Description|
|:---|:---|:----------|
{% for param in method.params -%}
|`{{ param.name }}`|`{{ param.type.names[0] }}`| {{ param.description }} |
{% endfor %}

{% endif %}
{%- endfor %}
{%- endfor -%}

## License

MIT (c) Matt Walker.

## Also see

If you find the layer switcher useful you might also like the
[ol3-popup](https://github.com/walkermatt/ol3-popup).
