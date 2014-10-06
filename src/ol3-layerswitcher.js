ol.control.LayerSwitcher = function(opt_options) {

    var options = this.options = opt_options || { reverse: true};

    var hiddenClassName = 'ol-unselectable ol-control layer-switcher';
    this.hiddenClassName = hiddenClassName;

    var shownClassName = hiddenClassName + ' shown';
    this.shownClassName = shownClassName;

    var element = document.createElement('div');
    element.className = hiddenClassName;

    var button = document.createElement('button');
    element.appendChild(button);

    this.panel = document.createElement('div');
    this.panel.className = 'panel';
    element.appendChild(this.panel);

    var this_ = this;

    element.addEventListener('mouseover', function(e) {
        this_.showPanel();
    });

    button.addEventListener('click', function(e) {
        this_.showPanel();
    });

    element.addEventListener('mouseout', function(e) {
        this_.hidePanel();
    });

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });

};

ol.inherits(ol.control.LayerSwitcher, ol.control.Control);

ol.control.LayerSwitcher.prototype.showPanel = function() {
    this.element.className = this.shownClassName;
};

ol.control.LayerSwitcher.prototype.hidePanel = function() {
    this.element.className = this.hiddenClassName;
};

ol.control.LayerSwitcher.prototype.setMap = function(map) {
    ol.control.Control.prototype.setMap.call(this, map);
    var this_ = this;
    map.on('pointerdown', function() {
        this_.hidePanel();
    });
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

function reverseArray(input) {
    var ret = new Array;
    for(var i = input.length-1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
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
        label.innerHTML = lyr.get('title');
        li.appendChild(label);
        var ul = document.createElement('ul');
        li.appendChild(ul);

        var arrayLegend = lyr.getLayers().getArray();
        if (this.options.reverse) {
            arrayLegend = reverseArray(arrayLegend);
        }

        arrayLegend.forEach(function(lyr, idx, a) {
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
            this_.setState(this_.getMap(), lyr);
        });
        li.appendChild(input);

        var label = document.createElement('label');
        label.htmlFor = lyrId;
        label.innerHTML = lyr.get('title');
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

    var arrayLegend = map.getLayers().getArray();
    if (this.options.reverse) {
        arrayLegend = reverseArray(arrayLegend);
    }
    
    arrayLegend.forEach(function(lyr, idx, a) {
        ul.appendChild(this_.renderLayer(lyr, idx));
    });

};
