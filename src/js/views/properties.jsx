let Backbone = require('backbone');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsPropertiesTemplate = require('../../templates/ingredients-properties.html');
let emptyPropertiesTemplate = require('../../templates/empty-properties.html');

import {nodeTypes} from '../models/index.jsx';
import {TimetableView} from './index.jsx'

export let PropertiesView = Backbone.View.extend({
    foodProcessTemplate: foodProcessPropertiesTemplate,
    ingredientsTemplate: ingredientsPropertiesTemplate,
    emptyTemplate: emptyPropertiesTemplate,
    emptyModel: new Backbone.Model(),
    durationUnits: [{name:'sec'}, {name:'min'}, {name:'h'}, {name:'d'}],
    temperatureUnits: [{name:'°C'}, {name:'°F'}, {name:'K'}],
    pressureUnits: [{name:'bar'}, {name:'Pa'}],
    // Bind the content of the input fields to the model of the node
    bindings: {
        '#processNameInput': 'processName',
        '#durationInput': 'duration',
        'select#durationUnitInput': {
            observe: 'durationUnit',
            selectOptions: {
                collection: 'this.durationUnits',
                labelPath: 'name',
                valuePath: 'name'
            }
        },
        '#temperatureInput': 'temperature',
        '#temperatureUnitInput': {
            observe: 'temperatureUnit',
            selectOptions: {
                collection: 'this.temperatureUnits',
                labelPath: 'name',
                valuePath: 'name'
            }
        },
        '#pHInput': 'pH',
        '#awInput': 'aw',
        '#pressureInput': 'pressure',
        '#pressureUnitInput': {
            observe: 'pressureUnit',
            selectOptions: {
                collection: 'this.pressureUnits',
                labelPath: 'name',
                valuePath: 'name'
            }
        },
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
        this.model = this.model || this.emptyModel; // MPA
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

        if(this.model != this.emptyModel) {
            // Render the timetable modal
            this.timetable = new TimetableView(this.model); // model now == food node properties
            this.timetable.setElement(this.$('#timetable'));
            this.timetable.render();
        }

        this.stickit();
        this.$el.foundation();
    },
    // Set the selected node and rerender the menu
    setCurrentNode: function(nodeView) {
        if (!nodeView) {
            this.model = this.emptyModel;
            this.currentNode = null;
        } else {
            // Unregister change listener from current node
            this.model && this.model.off('change:processName');
            this.currentNode = nodeView.model;
            this.model = this.currentNode.get('properties');

            // Register change listener to update the model and label of the node
            let propertiesModel = this.model;
            let currentNode = this.currentNode;
            this.model.on('change:processName', function() {
                currentNode.setName(propertiesModel.get('processName'));
                $(nodeView.el).find('.label').text(propertiesModel.get('processName'));
            });
        }
        this.render();
    },
    // delete the node and clear the menu
    deleteCurrentNode: function() {
        if (!this.currentNode) {
            return;
        }
        this.currentNode.remove();
        delete this.currentNode;
        this.model = this.emptyModel;
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