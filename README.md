# OpenLayers LayerSwitcher

Grouped layer list control for an OpenLayer map.

To be shown in the LayerSwitcher layers should have a `title` property; base
layers should have a `type` property set to `base`. Group layers
(`LayerGroup`) can be used to visually group layers together; a group with
a `fold` property set to either `open` or `close` will be displayed with a
toggle.

See [**API documentation**](#api) and [**Examples**](#examples) for usage.

Compatible with OpenLayers version 3, 4, 5 and 6 (see note in [Install - Parcel,
Webpack etc.](#parcel-webpack-etc) regarding installing the appropriate version
of `ol-layerswitcher` for OpenLayers).

## Examples

The examples demonstrate usage and can be viewed online thanks to [raw.githack.com](http://raw.githack.com/):

- [Basic usage](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/layerswitcher.html)
  - Create a layer switcher control. Each layer to be displayed in the layer switcher has a `title` property as does each Group; each base map layer has a `type: 'base'` property. See the comments in [examples/layerswitcher.js](./examples/layerswitcher.js) for other layer/ group options including `combine` and `fold`.
- [Add layer](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/addlayer.html)
  - Add a layer to an existing layer group after the layer switcher has been added to the map.
- [Scrolling](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/scroll.html)
  - Makes the panel scroll vertically, the height of the layer switcher is controlled by setting the `max-height` style (see [examples/scroll.css](examples/scroll.css)) and it's position relative to the bottom of the map (see the `.layer-switcher.shown` selector in [dist/ol-layerswitcher.css](dist/ol-layerswitcher.css)).
- [Side bar](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/sidebar.html)
  - Demonstrates rendering the layer tree into a [Turbo87/sidebar-v2](https://github.com/Turbo87/sidebar-v2) pane. This uses the static method [`LayerSwitcher.renderPanel`](#renderpanel) which can be used to render the layer tree to any arbitrary HTML element.
- [Collapse groups](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/collapse-groups.html)
  - Shows the effect of setting the `fold` property of a Group to allow the group to be collapsed.
- [Selectable Groups](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/select-groups.html)
  - Demonstrates setting the [`groupSelectStyle`](#layerswitcher) option which determines if groups have a checkbox and how toggling a groups visibility affects it's children. The demo includes the ability to change the `groupSelectStyle` to easily see the effect of the different values.
- [Bundling with `ol` package (Browserify, Parcel, Webpack...)](https://github.com/walkermatt/ol-layerswitcher-examples)
- [Activate panel with click](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/activation-mode-click.html)
  - Shows setting `activationMode: 'click'` (default is `'mouseover'`). When using this mode the control's button persists in the panel - use `collapseLabel` to set its text (default is `collapseLabel: '»'`, see the comments in [examples/layerswitcher.js](./examples/layerswitcher.js) for other examples). The close button is positioned to the left of the panel, to move it to the right add the following to your CSS:

```CSS
.layer-switcher.shown.layer-switcher-activation-mode-click {
  padding-right: 34px;
}
.layer-switcher.shown.layer-switcher-activation-mode-click > button {
  right: 0;
  border-left: 0;
}
```

- [Start with panel active](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/startactive-click.html)
  - Example with the layer switcher starting open using `startActive: true`. Here shown in combination with \`activationMode: 'click' which, while not required, is probably the most common scenario.
- [Multiple maps](http://raw.githack.com/walkermatt/ol-layerswitcher/master/examples/two-maps.html)

  - Demonstrates creating two independent maps each with a layer switcher control.

- To use the layer switcher with the [`ol` package](https://www.npmjs.com/package/ol) and a module bundler such as Browserify, Parcel, Webpack, TypeScript etc. see [ol-layerswitcher-examples](https://github.com/walkermatt/ol-layerswitcher-examples).

The source for all examples can be found in [examples](examples).

## Changelog

See [CHANGELOG](./CHANGELOG.md) for details of changes in each release.

## Install

### Browser

#### JS

Load `ol-layerswitcher.js` after OpenLayers. The layerswitcher control is available as `LayerSwitcher` or `ol.control.LayerSwitcher`.

```HTML
<script src="https://unpkg.com/ol-layerswitcher@4.0.0"></script>
```

#### CSS

```HTML
<link rel="stylesheet" href="https://unpkg.com/ol-layerswitcher@4.0.0/dist/ol-layerswitcher.css" />
```

### Parcel, Rollup, Webpack, TypeScript etc.

NPM package: [ol-layerswitcher](https://www.npmjs.com/package/ol-layerswitcher).

#### JS

Install the package via `npm`

    npm install ol-layerswitcher --save

:warning: If you're using the [`ol` package](https://www.npmjs.com/package/ol) prior to v5 you'll need to install `ol-layerswitcher@v2.0.0`.

#### CSS

The CSS file `ol-layerswitcher.css` can be found in `./node_modules/ol-layerswitcher/dist`

To use the layerswitcher with the [`ol` package](https://www.npmjs.com/package/ol) and a module bundler such as Parcel, Webpack etc. see [ol-layerswitcher-examples](https://github.com/walkermatt/ol-layerswitcher-examples).

#### TypeScript type definition

TypeScript types are shipped with the project in the `dist` directory and should be automatically used in a TypeScript project. Interfaces are provided for LayerSwitcher Options as well as extend interfaces for BaseLayer and LayerGroup Options that include the LayerSwitcher specific properties such as `title`, `combine` etc.

These interfaces can be imported into your project and used to cast object literals passed to layer or group constructors:

```typescript
import 'ol/ol.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';

import Map from 'ol/Map';
import View from 'ol/View';
import LayerGroup from 'ol/layer/Group';
import LayerTile from 'ol/layer/Tile';
import SourceOSM from 'ol/source/OSM';
import SourceStamen from 'ol/source/Stamen';

import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';

const osm = new LayerTile({
  title: 'OSM',
  type: 'base',
  visible: true,
  source: new SourceOSM()
} as BaseLayerOptions);

const watercolor = new LayerTile({
  title: 'Water color',
  type: 'base',
  visible: false,
  source: new SourceStamen({
    layer: 'watercolor'
  })
} as BaseLayerOptions);

const baseMaps = new LayerGroup({
  title: 'Base maps',
  layers: [osm, watercolor]
} as GroupLayerOptions);

const map = new Map({
  target: 'map',
  layers: [baseMaps]
});

const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);
```

See [BaseLayerOptions](#baselayeroptions) and [GroupLayerOptions](#grouplayeroptions).

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [LayerSwitcher](#layerswitcher)
  - [Parameters](#parameters)
  - [setMap](#setmap)
    - [Parameters](#parameters-1)
  - [showPanel](#showpanel)
  - [hidePanel](#hidepanel)
  - [renderPanel](#renderpanel)
  - [renderPanel](#renderpanel-1)
    - [Parameters](#parameters-2)
  - [isBaseGroup](#isbasegroup)
    - [Parameters](#parameters-3)
  - [getGroupsAndLayers](#getgroupsandlayers)
    - [Parameters](#parameters-4)
  - [forEachRecursive](#foreachrecursive)
    - [Parameters](#parameters-5)
  - [uuid](#uuid)
- [LayerSwitcher#show](#layerswitchershow)
- [LayerSwitcher#hide](#layerswitcherhide)
- [Options](#options)
  - [activationMode](#activationmode)
  - [startActive](#startactive)
  - [label](#label)
  - [collapseLabel](#collapselabel)
  - [tipLabel](#tiplabel)
  - [collapseTipLabel](#collapsetiplabel)
- [RenderOptions](#renderoptions)
  - [groupSelectStyle](#groupselectstyle)
  - [reverse](#reverse)
- [GroupSelectStyle](#groupselectstyle-1)
- [BaseLayerOptions](#baselayeroptions)
  - [title](#title)
  - [type](#type)
- [GroupLayerOptions](#grouplayeroptions)
  - [combine](#combine)
  - [fold](#fold)

### LayerSwitcher

**Extends ol/control/Control~Control**

OpenLayers LayerSwitcher Control, displays a list of layers and groups
associated with a map which have a `title` property.

To be shown in the LayerSwitcher panel layers must have a `title` property;
base map layers should have a `type` property set to `base`. Group layers
(`LayerGroup`) can be used to visually group layers together; a group
with a `fold` property set to either `'open'` or `'close'` will be displayed
with a toggle.

See [BaseLayerOptions](#baselayeroptions) for a full list of LayerSwitcher
properties for layers (`TileLayer`, `ImageLayer`, `VectorTile` etc.) and
[GroupLayerOptions](#grouplayeroptions) for group layer (`LayerGroup`)
LayerSwitcher properties.

Layer and group properties can either be set by adding extra properties
to their options when they are created or via their set method.

Specify a `title` for a Layer by adding a `title` property to it's options object:

```javascript
var lyr = new ol.layer.Tile({
  // Specify a title property which will be displayed by the layer switcher
  title: 'OpenStreetMap',
  visible: true,
  source: new ol.source.OSM()
});
```

Alternatively the properties can be set via the `set` method after a layer has been created:

```javascript
var lyr = new ol.layer.Tile({
  visible: true,
  source: new ol.source.OSM()
});
// Specify a title property which will be displayed by the layer switcher
lyr.set('title', 'OpenStreetMap');
```

To create a LayerSwitcher and add it to a map, create a new instance then pass it to the map's [`addControl` method](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html#addControl).

```javascript
var layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);
```

#### Parameters

- `opt_options` **[Options](#options)?** LayerSwitcher options, see [LayerSwitcher Options](#options) and [RenderOptions](#renderoptions) which LayerSwitcher `Options` extends for more details.

#### setMap

Set the map instance the control is associated with.

##### Parameters

- `map` **[PluggableMap](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html)** The map instance.

Returns **void**

#### showPanel

Show the layer panel. Fires `'show'` event.

Returns **void**

#### hidePanel

Hide the layer panel. Fires `'hide'` event.

Returns **void**

#### renderPanel

Re-draw the layer panel to represent the current state of the layers.

Returns **void**

#### renderPanel

**_[static]_** - Re-draw the layer panel to represent the current state of the layers.

##### Parameters

- `map` **[PluggableMap](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html)** The OpenLayers Map instance to render layers for
- `panel` **[HTMLElement](https://developer.mozilla.org/docs/Web/HTML/Element)** The DOM Element into which the layer tree will be rendered
- `options` **[RenderOptions](#renderoptions)** Options for panel, group, and layers

Returns **void**

#### isBaseGroup

**_[static]_** - Determine if a given layer group contains base layers

##### Parameters

- `grp` **[LayerGroup](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html)** Group to test

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)**

#### getGroupsAndLayers

**_[static]_** - Get an Array of all layers and groups displayed by the LayerSwitcher (has a `'title'` property)
contained by the specified map or layer group; optionally filtering via `filterFn`

##### Parameters

- `grp` **([PluggableMap](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html) | [LayerGroup](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html))** The map or layer group for which layers are found.
- `filterFn` **function (lyr: [BaseLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html), idx: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), arr: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[BaseLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html)>): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** Optional function used to filter the returned layers

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[BaseLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html)>**

#### forEachRecursive

**_[static]_** - Call the supplied function for each layer in the passed layer group
recursing nested groups.

##### Parameters

- `lyr` **([PluggableMap](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html) | [LayerGroup](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html))** The layer group to start iterating from.
- `fn` **function (lyr: [BaseLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html), idx: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number), arr: [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[BaseLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html)>): void** Callback which will be called for each layer
  found under `lyr`.

Returns **void**

#### uuid

**_[static]_** - Generate a UUID
Adapted from <http://stackoverflow.com/a/2117523/526860>

Returns **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** UUID

### LayerSwitcher#show

Event triggered after the panel has been shown.
Listen to the event via the `on` or `once` methods; for example:

```js
var layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);

layerSwitcher.on('show', (evt) => {
  console.log('show', evt);
});
```

### LayerSwitcher#hide

Event triggered after the panel has been hidden.

### Options

**Extends ControlOptions, RenderOptions**

**_[interface]_** - LayerSwitcher Options specified when creating a LayerSwitcher
instance, extends [RenderOptions](#renderoptions) and
[Control Options](https://openlayers.org/en/latest/apidoc/module-ol_control_Control-Control.html#Control).

Default values:

```javascript
{
  activationMode: 'mouseover',
  startActive: false,
  label: ''
  collapseLabel: '\u00BB',
  tipLabel: 'Legend',
  collapseTipLabel: 'Collapse legend',
  groupSelectStyle: 'children',
  reverse: false
}
```

#### activationMode

Event to use on the button to collapse or expand the panel. Defaults to
`"mouseover"`.

Type: (`"mouseover"` \| `"click"`)

#### startActive

Whether panel is open when created. Defaults to `false`.

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

#### label

Text label to use for the button that opens the panel. E.g.: `''` (default), `'«'` or `'\u00AB'`, `'+'`.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### collapseLabel

Text label to use for the button that closes the panel. E.g.: `'»'` (default) or `'\u00BB'`, `'-'` or `'\u2212'`. Only used when `activationMode: 'mouseover'`.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### tipLabel

The button tooltip when the panel is closed.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### collapseTipLabel

The button tooltip when the panel is open.

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

### RenderOptions

**_[interface]_** - LayerSwitcher Render Options as passed to [LayerSwitcher
constructor](#layerswitcher) as part of [Options](#options) and [static
LayerSwitcher.renderPanel](#renderpanel)

#### groupSelectStyle

How layers and groups behave when a given layer's visibility is set. See [GroupSelectStyle type for possible values](#groupselectstyle).

Type: [GroupSelectStyle](#groupselectstyle)

#### reverse

Should the order of layers in the panel be reversed?

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

### GroupSelectStyle

**_[type]_** - How layers and groups behave when a given layer's visibility is set, either:

- `'none'` - groups don't get a checkbox,
- `'children'` (default) groups have a checkbox and affect child visibility or
- `'group'` groups have a checkbox but do not alter child visibility (like QGIS).

Type: (`"none"` \| `"children"` \| `"group"`)

### BaseLayerOptions

**Extends [ol/layer/Base~Options](https://openlayers.org/en/latest/apidoc/module-ol_layer_Base.html#~Options)**

**_[interface]_** - Extended BaseLayer Options interface adding properties
used by the LayerSwitcher

#### title

Title of the layer displayed in the LayerSwitcher panel

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### type

Type of the layer, a layer of `type: 'base'` is treated as a base map
layer by the LayerSwitcher and is displayed with a radio button

Type: `"base"`

### GroupLayerOptions

**Extends [ol/layer/Group~Options](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group.html#~Options), BaseLayerOptions**

**_[interface]_** - Extended LayerGroup Options interface adding
properties used by the LayerSwitcher.

#### combine

When `true` child layers are not shown in the Layer Switcher panel

Type: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

#### fold

Fold state of the group, if set then the group will be displayed with a
button to allow the user to show/ hide the child layers.

Type: (`"open"` \| `"close"`)

## Tests

To run the tests you'll need to install the dependencies via `npm`. In the root of the repository run:

    npm install

Then run the tests by opening [test/index.html](test/index.html) in a browser.

## License

MIT (c) Matt Walker.

## Also see

If you find the layer switcher useful you might also like the
[ol-popup](https://github.com/walkermatt/ol-popup).

## Publishing

    npm run build
    # Open ./tests/ in browser
    # Open examples and manually test
    # Determine new version number (check current with `git tag --list`, check npm and GitHub)
    # Update version number in `package.json`, `bower.json` and `README.md`
    # Add entry to CHANGELOG.md
    git commit bower.json package.json CHANGELOG.md README.md
    git tag vX.Y.Z
    git push origin master --tags
    npm publish

### Beta release

    npm run build
    # Tests/ examples
    # Beta version should be X.Y.Z-beta.N
    # Update version number in `package.json`, `bower.json` and `README.md`
    # Add entry to CHANGELOG.md
    git commit bower.json package.json CHANGELOG.md README.md
    git tag vX.Y.Z-beta.N
    git push --tags
    npm publish --tag beta
    # To list all version on npm
    npm show ol-layerswitcher versions --json
