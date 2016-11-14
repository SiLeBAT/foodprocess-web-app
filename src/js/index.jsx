// Dependencies
window.$ = window.jQuery = require('jquery');
var lodash = require('lodash');
var _ = require('underscore');
var Backbone = require('backbone');

// JointJS Stylesheets
require('../vendor/joint.css');

// Foundation
require('foundation-sites/dist/foundation.js');
require('foundation-sites/dist/foundation.css');

// Stylesheets
require('../scss/main.scss');

import {WorkspaceView} from './workspace.jsx';
import {MenuView} from './menu.jsx';

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
        this.workspace.render(this.calcWorkspaceWidth(), this.calcWorkspaceHeight());
    },
    calcWorkspaceWidth: function() {
        // return $(window).width() - this.menu.$el.outerWidth();
        return 600;
    },
    calcWorkspaceHeight: function() {
        // return $(window).height() - this.menu.$el.outerHeight();
        return $(window).height();
    }
});

let appView = new AppView();
