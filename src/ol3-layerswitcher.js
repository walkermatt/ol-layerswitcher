ol.control.LayerSwitcher = function(opt_options) {

    var options = opt_options || {};

    var element = document.createElement('div');
    var className = 'ol-unselectable ol-control layer-switcher';
    var shownClassName = className + ' shown';
    element.className = className;

    var button = document.createElement('button');
    element.appendChild(button);

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);

    element.addEventListener('mouseover', function(e) {
        element.className = shownClassName;
    });
    element.addEventListener('mouseout', function(e) {
        element.className = className;
        button.blur();
    });
    element.addEventListener('click', function(e) {
        element.className = shownClassName;
    });

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};

ol.inherits(ol.control.LayerSwitcher, ol.control.Control);

ol.control.LayerSwitcher.prototype.setMap = function(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.render(map);
};

function forEachRecursive(lyr, fn) {
    lyr.getLayers().forEach(function(lyr, idx, a) {
        fn(lyr, idx, a);
        if (lyr.getLayers) {
            forEachRecursive(lyr, fn);
        }
    });
}

ol.control.LayerSwitcher.prototype.setState = function(map, lyr) {
    lyr.setVisible(!lyr.getVisible());
    if (lyr.get('type') === 'base') {
        // Hide all other base layers
        forEachRecursive(map, function(l, idx, a) {
            if (l.get('type') === 'base' && l != lyr) {
                l.setVisible(false);
            }
        });
    }
    this.render(map);
};

ol.control.LayerSwitcher.prototype.renderLayer = function(lyr, idx) {

    var this_ = this;

    var li = document.createElement('li');

    var lyrId = lyr.get('title').replace(' ', '-') + '_' + idx;

    if (lyr.getLayers) {

        var label = document.createElement('label');
        label.innerText = lyr.get('title');
        li.appendChild(label);
        var ul = document.createElement('ul');
        li.appendChild(ul);

        lyr.getLayers().forEach(function(lyr, idx, a) {
            ul.appendChild(this_.renderLayer(lyr, idx));
        });

    } else {

        var input = document.createElement('input');
        input.type = 'checkbox';
        if (lyr.get('type') == 'base') {
            input.type = 'radio';
            input.name = 'base';
        }
        input.id = lyrId;
        input.checked = lyr.get('visible');
        input.addEventListener('change', function(e) {
            this_.setState(map, lyr);
        });
        li.appendChild(input);

        var label = document.createElement('label');
        label.htmlFor = lyrId;
        label.innerText = lyr.get('title');
        li.appendChild(label);

    }

    return li;

};

ol.control.LayerSwitcher.prototype.render = function(map) {

    var this_ = this;

    while(this.panel.firstChild) {
        this.panel.removeChild(this.panel.firstChild);
    }

    var ul = document.createElement('ul');
    this.panel.appendChild(ul);

    map.getLayers().forEach(function(lyr, idx, a) {
        ul.appendChild(this_.renderLayer(lyr, idx));
    });

};
