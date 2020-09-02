// List of stuff to log to console if a test fails
var __log_output = [];

/**
 * Use log instead of console.log in tests if you only want to
 * log to the console if the current test fails
 */
function log(o1, o2, o3, oN) {
  __log_output = __log_output.concat(Array.prototype.slice.call(arguments));
}

beforeEach(function () {
  __log_output = [];
});

afterEach(function () {
  // If the test fails then log it's output to the console
  if (this.currentTest.state === 'failed') {
    __log_output.forEach(function (o) {
      console.log(o);
    });
  }
});

// OpenLayers related utils

/**
 * Returns the Layer instance that has the given title
 */
function getLayerByTitle(grp, title) {
  var layer = null;
  ol.control.LayerSwitcher.forEachRecursive(grp, function (lyr) {
    if (lyr.get('title') && lyr.get('title') === title) {
      layer = lyr;
      return;
    }
  });
  return layer;
}

/**
 * Creates a plain JS representation of a group and it's layers with
 * properties that we need to compare in tests.
 */
function groupToJson(group) {
  function walk(g, group) {
    group.getLayers().forEach(function (lyr, idx, a) {
      const title = lyr.get('title');
      if (title) {
        const l = { title: title, visible: lyr.getVisible() };
        const keys = lyr.getKeys();
        if (keys.includes('indeterminate'))
          l.indeterminate = lyr.get('indeterminate');
        if (keys.includes('fold')) l.fold = lyr.get('fold');
        g.layers.push(l);
        if (lyr.getLayers) {
          l.layers = [];
          walk(l, lyr);
        }
      }
    });
    return g;
  }
  const g = walk({ title: 'map', visible: true, layers: [] }, group);
  return g;
}

/**
 * Return a flattened Array of all layers regardless including those not
 * shown by the LayerSwitcher
 */
function allLyrs(group) {
  return flatten(group, function (lyr) {
    return lyr.getLayers ? lyr.getLayers().getArray() : lyr;
  });
}

/**
 * Return a flattened Array of only those layers that the LayerSwitcher
 * should show
 */
function shownLyrs(group) {
  // Pass in the Array from the root LayerGroup as it doesn't have a
  // title but we don't want to filter out all layers
  lyrs = group.getLayers().getArray();
  var flat = flatten(lyrs, function (lyr) {
    // Return a Groups layer array only if the group has a title
    // otherwise just return the group so that it's children will be
    // skipped
    return lyr.getLayers && lyr.get('title') ? lyr.getLayers().getArray() : lyr;
  });
  // Only return layers with a title
  return _.filter(flat, lyrTitle);
}

/**
 * Returns the title of a given layer or null if lyr is falsey
 */
function lyrTitle(lyr) {
  return lyr ? lyr.get('title') : null;
}

/**
 * Flattens a given nested collection using the provided function getArray
 * to get an Array of the collections children.
 */
function flatten(srcCollection, getArray) {
  getArray =
    getArray ||
    function (item) {
      return item;
    };
  var src = getArray(srcCollection),
    dest = [];
  for (var i = 0, item; i < src.length; i++) {
    item = src[i];
    dest = dest.concat(item);
    if (_.isArray(getArray(item))) {
      dest = dest.concat(flatten(item, getArray));
    }
  }
  return dest;
}

// jQuery/ DOM utils

/**
 * Get the input associated with a layer by it's title
 */
function getElmByTitle(panel, name) {
  return jQuery('label:contains("' + name + '")', panel)
    .siblings('input')
    .get(0);
}

/**
 * Does jQuery selection `elms` contain an element with tagName `tag`
 */
function includesTag(elms, tag) {
  return _.includes(
    elms.get().map(function (elm) {
      return elm.tagName;
    }),
    tag
  );
}

function domToJson(elm) {
  var state = jQuery('li', elm)
    .map(function () {
      var input = jQuery(this).find('>input').get(0);
      var label = jQuery(this).find('>label').get(0);
      var data = {
        title: label.innerText,
        className: this.className
      };
      if (input) {
        data.checked = input.checked;
        data.indeterminate = input.indeterminate;
        data.type = input.type;
      }
      return data;
    })
    .get();
  return state;
}

// Object utils

/**
 * Produce a unified diff of two objects.
 */
function diff(obj1, obj2) {
  return difflib
    .unifiedDiff(
      JSON.stringify(obj1, null, 2).split('\n'),
      JSON.stringify(obj2, null, 2).split('\n')
    )
    .join('\n');
}

/**
 * Expect current to deep equal fixture, logs diff as JSON if they differ
 */
function expectEqual(current, fixture) {
  log(diff(current, fixture));
  expect(current).to.eql(fixture);
}
