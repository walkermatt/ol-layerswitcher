# OpenLayers 3 LayerSwitcher

Grouped layer list control for an OL3 map.

All layers should have a `title` property and base layers should have a `type` property set to `base`. Group layers (`ol.layer.Group`) can be used to visually group layers together. See [examples/layerswitcher.js](examples/layerswitcher.js) for usage.

## Demo

Clone or download the repository and open [examples/layerswitcher.html](examples/layerswitcher.html) in a browser or [view the example on RawGit](http://rawgit.com/walkermatt/ol3-layerswitcher/master/examples/layerswitcher.html).

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
