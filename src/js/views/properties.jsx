let Backbone = require('backbone');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsTemplate = require('../../templates/ingredients-properties.html');

import {nodeTypes} from '../models/index.jsx';

export let PropertiesView = Backbone.View.extend({
    foodProcessTemplate: foodProcessPropertiesTemplate,
    ingredientsTemplate: ingredientsTemplate,
    bindings: {
        '#processName': 'processName',
        '#duration': 'duration',
        '#temperature': 'temperature',
        '#pH': 'pH',
        '#aw': 'aw',
        '#pressure': 'pressure',
    },
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
        let template = '';
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
    setCurrentNode: function(node) {
        this.currentNode = node;
        this.model = node.attributes.properties;
        this.render();
    },
    deleteNode: function(){
        this.currentNode && this.currentNode.remove();
        this.model = this.defaultModel;
        this.render();
    },
    addInPort: function(){
        this.currentNode && this.currentNode.addDefaultPort('in');
    },
    addOutPort: function(){
        this.currentNode && this.currentNode.addDefaultPort('out');
    },
    removeInPort: function(){
        this.currentNode && this.currentNode.removeDefaultPort('in');
    },
    removeOutPort: function(){
        this.currentNode && this.currentNode.removeDefaultPort('out');
    }
});