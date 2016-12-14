let Backbone = require('backbone');
let modelbinder = require('backbone.modelbinder');
let _ = require('lodash');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsPropertiesTemplate = require('../../templates/ingredients-properties.html');
let emptyPropertiesTemplate = require('../../templates/empty-properties.html');

import {nodeTypes, ParameterModel} from '../models/index.jsx';
import {TimetableView} from './index.jsx'

export let PropertiesView = Backbone.View.extend({
    foodProcessTemplate: _.template(foodProcessPropertiesTemplate),
    ingredientsTemplate: _.template(ingredientsPropertiesTemplate),
    emptyTemplate: _.template(emptyPropertiesTemplate),
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
        '#parameterInput': 'parameter',
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
        'click #addParameterButton': 'addParameter'
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
        this.$el.html(template({model: this.model}));

        // if food process, render food process specific elements
        if(this.model.toJSON().type == nodeTypes.FOOD_PROCESS && this.model != this.emptyModel) {
            // Render the timetable modal
            this.timetable = new TimetableView(this.model); // model now == food node properties
            this.timetable.setElement(this.$('#timetable'));
            this.timetable.render();

            // now that we have a model and parameters, we can add more bindings
            this.addParameterBindings();
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

            // Test
            //let param = new ParameterModel({name : "gold", unit: "w", timeValues: [{ 1: 2}, { 3: 4}]});
            //this.model.set('parameters', new ParameterCollection([param]));

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
    addParameterBindings: function() {
        let parameters = this.model.get('parameters').models;
        let self = this;
        _.each(parameters, function (parameterModel) {
            let parameterName = parameterModel.get('name');
            let bindings = {
                // FIXME: binding erfolgt noch über name -entweder in ui validieren oder auf ID ändern)
                name: '#parameterInputName' + parameterName,
                value: '#parameterInputValue' + parameterName,
                unit: '#pressureUnitInput' + parameterName
            };
            let binder = new Backbone.ModelBinder(); // needs to be a new instance for each "bindings"!
            binder.bind(parameterModel, self.el, bindings);
        });
    },
    addParameter: function() {
        let parametersCollection = this.model.get('parameters');
        let colectionSize = parametersCollection.size();
        parametersCollection.add(new ParameterModel({name: "optional-" + colectionSize}));
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
    },
    close: function () {
        this.model.unbind();
    }
});