// Dependencies
window.$ = window.jQuery = require('jquery');
let _ = require('underscore');
let Backbone = require('backbone');

// JointJS
let joint = require('../vendor/joint.js');
require('../vendor/joint.css');

// Foundation
require('foundation-sites/dist/foundation.js');
require('foundation-sites/dist/foundation.css');

// Stylesheets
require('../scss/main.scss');

import {WorkspaceView, MenuView, PropertiesView} from './views/index.jsx';

// Templates
let appTemplate = require('../templates/app.html');

let AppView = Backbone.View.extend({
    el: $('#app'),
    template: _.template(appTemplate),
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(this.template({}));

        // Workspace graph
        let workspaceGraph = new joint.dia.Graph;
        let workspaceElement = this.$('#workspace');

        // Menu
        this.menu = new MenuView(workspaceGraph, workspaceElement);
        this.menu.$el = this.$('#menu');
        this.menu.render();
        // Workspace
        this.workspace = new WorkspaceView(workspaceGraph);
        this.workspace.$el = workspaceElement;
        this.workspace.render();
        // Properties
        this.properties = new PropertiesView();
        this.properties.$el = this.$('#properties');
        this.properties.render();
    }
});

let appView = new AppView();
