// Dependencies
window.$ = window.jQuery = require('jquery');
let _ = require('underscore');
let Backbone = require('backbone');

// JointJS Stylesheets
require('../vendor/joint.css');

// Foundation
require('foundation-sites/dist/foundation.js');
require('foundation-sites/dist/foundation.css');

// Stylesheets
require('../scss/main.scss');

import {WorkspaceView} from './workspace.jsx';
import {MenuView} from './menu.jsx';
import {PropertiesView} from './properties.jsx';

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
        // Menu
        this.menu = new MenuView();
        this.menu.$el = this.$('#menu');
        this.menu.render();
        // Workspace
        this.workspace = new WorkspaceView();
        this.workspace.$el = this.$('#workspace');
        this.workspace.render();
        // Properties
        this.properties = new PropertiesView();
        this.properties.$el = this.$('#properties');
        this.properties.render();
    }
});

let appView = new AppView();
