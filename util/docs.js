#!/usr/bin/env node

var fs = require('fs'),
    nunjucks = require('nunjucks'),
    _ = require('lodash'),
    JSPath = require('jspath');

function filter(json, template) {

    // Build an object we can pass to our template
    var content = _.reduce(JSON.parse(json), function(result, item) {
        // Skip undocumented or private stuff
        if (item.undocumented || (item.access && item.access === 'private')) {
            return result;
        }
        if (item.kind === 'class') {
            result._classes[item.longname] = item;
            item.methods = [];
            result.classes.push(item);
        } else if (item.kind === 'function') {
            if (item.memberof) {
                result._classes[item.memberof].methods.push(item)
            } else {
                result.functions.push(item);
            }
        }
        if (item.kind === 'class' || item.kind === 'function') {
            item.signature = _.map(item.params, function(param) {
                return param.name;
            });
        }
        return result;
    }, {classes: [], _classes: {}});

    // Remove newlines from parameter descriptions to avoid breaking tables
    _.forEach(JSPath.apply('..params..{.description}', content.classes), function(item) {
        item.description = item.description.replace(/\n/g, ' ');
    });

    // Apply the template
    nunjucks.configure({autoescape: false});
    return nunjucks.render(template, content);

}

// Attempt to read JSON data from stdin and template file path from args
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
    var args = process.argv.slice(2);
    if (!args.length) {
        console.error('Usage: docs.js template.md\n');
        process.exit(1);
    }
    console.log(filter(data, args[0]));
});
