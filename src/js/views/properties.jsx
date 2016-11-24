let Backbone = require('backbone');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsPropertiesTemplate = require('../../templates/ingredients-properties.html');
let emptyPropertiesTemplate = require('../../templates/empty-properties.html');

import {nodeTypes} from '../models/index.jsx';

export let PropertiesView = Backbone.View.extend({
    foodProcessTemplate: foodProcessPropertiesTemplate,
    ingredientsTemplate: ingredientsPropertiesTemplate,
    emptyTemplate: emptyPropertiesTemplate,
    defaultModel: new Backbone.Model(),
    // Bind the content of the input fields to the model of the node
    bindings: {
        '#nameInput': 'processName',
        '#durationInput': 'duration',
        '#temperatureInput': 'temperature',
        '#pHInput': 'pH',
        '#awInput': 'aw',
        '#pressureInput': 'pressure',
    },
    // Bind events to appropriate functions
    events: {
        'click #deleteNodeButton': 'deleteCurrentNode',
        'click #addInPortButton': 'addInPort',
        'click #addOutPortButton': 'addOutPort',
        'click #removeInPortButton': 'removeInPort',
        'click #removeOutPortButton': 'removeOutPort',
    },
    initialize: function() {
        this.model = this.model || this.defaultModel;
    },
    render: function() {
        // Render the appropriate context menu for the selected node
        let template = this.emptyTemplate;
        switch(this.model.toJSON().type) {
            case nodeTypes.FOOD_PROCESS:
                template = this.foodProcessTemplate;
                break;
            case nodeTypes.INGREDIENTS:
                template = this.ingredientsTemplate;
                break;
        }
        this.$el.html(template);
        this.stickit();
    },
    // Set the selected node and rerender the menu
    setCurrentNode: function(nodeView) {
        // Unregister change listener from current node
        this.model && this.model.off('change:processName');
        this.currentNode = nodeView.model;
        this.model = this.currentNode.get('properties');
        let model = this.model;
        let currentNode = this.currentNode;
        // Register change listener to update the model and label of the node
        this.model.on('change:processName', function() {
            currentNode.setName(model.get('processName'));
            $(nodeView.el).find('.label').text(model.get('processName'));
        });
        this.render();
    },
    // delete the node and clear the menu
    deleteCurrentNode: function() {
        if (!this.currentNode) {
            return;
        }
        this.currentNode.remove();
        delete this.currentNode;
        this.model = this.defaultModel;
        this.render();
    },
    // Add an input port to the selected node
    addInPort: function(){
        this.currentNode && this.currentNode.addDefaultPort('in');
    },
    // Add an output port to the selected node
    addOutPort: function(){
        this.currentNode && this.currentNode.addDefaultPort('out');
    },
    // Remove an input port from the selected node
    removeInPort: function(){
        this.currentNode && this.currentNode.removeDefaultPort('in');
    },
    // Remove an output port from the selected node
    removeOutPort: function(){
        this.currentNode && this.currentNode.removeDefaultPort('out');
    }
});