let Backbone = require('backbone');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsPropertiesTemplate = require('../../templates/ingredients-properties.html');
let emptyPropertiesTemplate = require('../../templates/empty-properties.html');

import {nodeTypes} from '../models/index.jsx';

export let PropertiesView = Backbone.View.extend({
    foodProcessTemplate: foodProcessPropertiesTemplate,
    ingredientsTemplate: ingredientsPropertiesTemplate,
    emptyTemplate: emptyPropertiesTemplate,
    // Bind the content of the input fields to the model of the node
    bindings: {
        '#processName': 'processName',
        '#duration': 'duration',
        '#temperature': 'temperature',
        '#pH': 'pH',
        '#aw': 'aw',
        '#pressure': 'pressure',
    },
    // Bind the the click events of the buttons to the appropriate functions
    events: {
        'click #deleteNode': 'deleteNode',
        'click #addInPort': 'addInPort',
        'click #addOutPort': 'addOutPort',
        'click #removeInPort': 'removeInPort',
        'click #removeOutPort': 'removeOutPort'
    },
    defaultModel: new Backbone.Model(),
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
    setCurrentNode: function(node) {
        this.currentNode = node;
        this.model = node.attributes.properties;
        let model = this.model;
        let currentNode = this.currentNode;
        this.model.on('change:processName', function() {
            currentNode.setName(model.attributes.processName);
        });
        this.render();
    },
    // delete the node and clear the menu
    deleteNode: function(){
        this.currentNode && this.currentNode.remove();
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