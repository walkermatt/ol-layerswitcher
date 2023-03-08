# ol-sidebar

The `ol-sidebar.js` and `ol-sidebar.css` files are derived from
[github.com/turbo87/sidebar-v2](https://github.com/turbo87/sidebar-v2). The
JavaScript is updated to be an ES6 class so that it is compatible with
OpenLayers 7 which ships ES6 classes instead of ES5 prototype based classes.

There is an existing issue related to `ol@7.x.x` support here:
[Turbo87/sidebar-v2/issues/321](https://github.com/Turbo87/sidebar-v2/issues/321).

The JavaScript is currently loaded a global and depends on the legacy `ol`
bundle, it would be nice to also support use as an ES6 module.
