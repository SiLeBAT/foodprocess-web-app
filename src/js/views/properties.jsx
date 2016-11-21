let Backbone = require('backbone');

let propertiesTemplate = require('../../templates/properties.html');

import {nodeTypes} from '../models/index.jsx';

export let PropertiesView = Backbone.View.extend({
    template: propertiesTemplate,
    bindings: {
        '#processName': 'processName',
        '#duration': 'duration',
        '#temperature': 'temperature',
        '#pH': 'pH',
        '#aw': 'aw',
        '#pressure': 'pressure',
    },
    initialize: function() {
        this.model = this.model || new Backbone.Model();
    },
    render: function() {
        if (this.model.toJSON().type === nodeTypes.FOOD_PROCESS) {
            this.$el.html(this.template);
        }
        this.stickit();
    }
});