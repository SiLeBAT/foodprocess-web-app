// Dependencies
window.$ = window.jQuery = require('jquery');
let _ = require('lodash');
let Backbone = require('backbone');
// Stickit for easier data binding
require('backbone.stickit');

// JointJS
let joint = require('../vendor/joint.js');
require('../vendor/joint.css');

// Foundation
require('foundation-sites/dist/foundation.js');
require('foundation-sites/dist/foundation.css');

// Icon font
require('font-awesome/css/font-awesome.css');

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
        // Element to render the workspace in
        let workspaceElement = this.$('#workspace');

        // Render the menu
        this.menu = new MenuView(workspaceGraph, workspaceElement);
        this.menu.setElement(this.$('#menu'));
        this.menu.render();
        // Render the properties
        this.properties = new PropertiesView();
        this.properties.setElement(this.$('#properties'));
        this.properties.render();
        // Render the workspace
        this.workspace = new WorkspaceView(workspaceGraph, this.properties);
        this.workspace.setElement(workspaceElement);
        this.workspace.render();
    }
});

let appView = new AppView();