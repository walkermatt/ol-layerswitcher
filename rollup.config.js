import babel from 'rollup-plugin-babel';

module.exports = {
    entry: 'src/ol-layerswitcher.js',
    targets: [
        {
            dest: 'dist/ol-layerswitcher.js',
            // format: 'iife',
            format: 'umd',
            moduleName: 'LayerSwitcher'
        }
    ],
    plugins: [
        require('rollup-plugin-node-resolve')(),
        require('rollup-plugin-commonjs')(),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        })
    ],
    external: function(id) {
        console.log('id', id);
        return /ol\//.test(id);
    },
    globals: {
        'ol/Map': 'ol.Map',
        'ol/Observable': 'ol.Observable',
        'ol/control/Control': 'ol.control.Control'
    }
};
