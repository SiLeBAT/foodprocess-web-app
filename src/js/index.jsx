// Dependencies
window.$ = window.jQuery = require('jquery');
var lodash = require('lodash');
var _ = require('underscore');
var Backbone = require('backbone');

// JointJS
var joint = require('../vendor/joint.js');
require('../vendor/joint.css');

// Foundation
require('foundation-sites/dist/foundation.js');
require('foundation-sites/dist/foundation.css');

// Stylesheets
require('../scss/main.scss');

var AppView = Backbone.View.extend({
    el: $('#appViewContainer'),
    template: _.template($('#appView').html()),
    initialize: function() {
        this.render();

        var graph = new joint.dia.Graph;

        var paper = new joint.dia.Paper({
            el: $('#modelArea'),
            width: '100vw',
            height: '100vh',
            model: graph,
            gridSize: 1
        });

        var rect = new joint.shapes.basic.Rect({
            position: { x: 100, y: 30 },
            size: { width: 100, height: 30 },
            attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
        });

        var rect2 = rect.clone();
        rect2.translate(300);

        var link = new joint.dia.Link({
            source: { id: rect.id },
            target: { id: rect2.id }
        });

        graph.addCells([rect, rect2, link]);
    },
    render: function() {
        this.$el.html(this.template({}));
    }
});

var appView = new AppView();