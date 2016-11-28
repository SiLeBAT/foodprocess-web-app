// Dependencies
window.$ = window.jQuery = require('jquery');
let _ = require('lodash');
let Backbone = require('backbone');
// Stickit for easier data binding
require('backbone.stickit');

// JointJS
let joint = require('jointjs/dist/joint.js');
require('jointjs/dist/joint.css');

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
        $(document).foundation();
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

        this.addKeydownListener();
    },
    // Listen for keydown events
    addKeydownListener: function() {
        let self = this;
        $(document).keydown(function(event) {
            // 46 = DEL, 8 = BACKSPACE
            if (event.keyCode === 46 || event.keyCode === 8) {
                // Delete currently selected node
                self.properties.deleteCurrentNode();
            }
        });
    }
});

let appView = new AppView();
