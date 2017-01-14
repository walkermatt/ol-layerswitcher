# Using ol3-layerswitcher with Browserify 

Based on [OpenLayers 3 Browserify Tutorial](https://openlayers.org/en/latest/doc/tutorials/browserify.html).

## Building

For a one-time build run:

    npm run build

If you want to make changes and have the project auto build run:

    npm run start

## Requiring ol3-layerswitcher

    // Pass the path to `ol3-layerswitcher.js` minus the extension to `require`
    // which will return the constructor
    var LayerSwitcher = require('../../src/ol3-layerswitcher');

    // Create an instance
    var layerSwitcher = new LayerSwitcher();

    // Add to a `ol.Map` instance as normal
    map.addControl(layerSwitcher);
