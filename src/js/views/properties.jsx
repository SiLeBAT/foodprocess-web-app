require('backbone.modelbinder');

let Backbone = require('backbone');
let _ = require('lodash');

let foodProcessPropertiesTemplate = require('../../templates/food-process-properties.html');
let ingredientsPropertiesTemplate = require('../../templates/ingredients-properties.html');
let emptyPropertiesTemplate = require('../../templates/empty-properties.html');

import {nodeTypes, ParameterModel, IngredientModel} from '../models/index.jsx';
import {TimetableView} from './index.jsx'

let ingredientsCV = require('../../cv/ingredients.csv');
let processNamesCV = require('../../cv/processes.csv');

export let PropertiesView = Backbone.View.extend({
    ingredients: [],
    foodProcessTemplate: _.template(foodProcessPropertiesTemplate),
    ingredientsTemplate: _.template(ingredientsPropertiesTemplate),
    emptyTemplate: _.template(emptyPropertiesTemplate),
    emptyModel: new Backbone.Model(),
    durationUnits: [{name:'sec'}, {name:'min'}, {name:'h'}, {name:'d'}],
    processNames: processNamesCV,
    // Bind the content of the input fields to the model of the node
    bindings: {
        '#processNameSelect': {
            observe: 'processName',
            selectOptions: {
                collection: 'this.processNames',
                labelPath: 'Name',
                valuePath: 'ID',
                defaultOption: {
                    label: 'Choose one...',
                    value: null
                }
            }
        },
        '#durationInput': 'duration',
        '#durationUnitSelect': {
            observe: 'durationUnit',
            selectOptions: {
                collection: 'this.durationUnits',
                labelPath: 'name',
                valuePath: 'name'
            }
        }
    },
    // Bind events to appropriate functions
    events: {
        'click #deleteNodeButton': 'deleteCurrentNode',
        'click #addParameterButton': 'addParameter',
        'click #addIngredientButton': 'addIngredient',
        'click #addInPortButton': 'addInPort',
        'click #addOutPortButton': 'addOutPort',
        'click #removeInPortButton': 'removeInPort',
        'click #removeOutPortButton': 'removeOutPort'
    },
    initialize: function() {
        this.model = this.emptyModel;
        this.ingredients = ingredientsCV.sort(this.compareByName);
    },
    render: function() {
        this.unstickit();
        // Render the appropriate context menu for the selected node
        let template = this.emptyTemplate;

        switch(this.model.toJSON().type) {
            case nodeTypes.FOOD_PROCESS:
                // food node
                template = this.foodProcessTemplate;
                this.$el.html(template({model: this.model}));

                // if food process, render food process specific elements
                if(this.model != this.emptyModel) {
                    // now that we have a model and parameters, we can add more bindings
                    this.addParameterBindings();

                    // Render the timetable modal
                    let parameters = this.model.get('parameters').models;
                    let self = this;
                    _.each(parameters, function (parameterModel) {
                        let nodeId = self.model.cid;
                        let timetableModalId = '#timetableModal' + nodeId + parameterModel.get('id');
                        // Only render if modal doesn't already exist
                        if ($(timetableModalId).length === 0) {
                            let timetableModal = new TimetableView(parameterModel, nodeId);
                            timetableModal.setElement(self.$('#timetable' + nodeId + parameterModel.get('id')));
                            timetableModal.render();
                        }
                    });
                }
                this.stickit();
                this.$el.foundation();
                this.initValidators();
                break;

            case nodeTypes.INGREDIENTS:
                // ingredient node
                template = this.ingredientsTemplate;
                this.$el.html(template({
                    model: this.model, 
                    ingredients: this.ingredients})
                );
                this.addIngredientBindings();
                this.stickit();
                this.$el.foundation();
                break;

            default:
                this.$el.html(template);
                break;
        }
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
            let self = this;
            this.model.on('change:processName', function() {
                let processName = _.find(self.processNames, { ID: propertiesModel.get('processName') }).Name;
                currentNode.setName(processName);
                $(nodeView.el).find('.label').text(processName);
            });
        }
        this.render();
    },
    addParameterBindings: function() {
        let parameters = this.model.get('parameters').models;
        let self = this;
        _.each(parameters, function (parameterModel) {
            let parameterId = parameterModel.get('id');
            let bindings = {
                value: '#parameterInputValue' + parameterId
            };
            if (parameterModel.get('optional')) {
                bindings.name = '#parameterInputName' + parameterId;
            }
            if (parameterModel.get('unit') !== null) {
                bindings.unit = '#parameterUnitSelect' + parameterId;
            }
            let binder = new Backbone.ModelBinder(); // needs to be a new instance for each "bindings"!
            binder.bind(parameterModel, self.el, bindings);
            // Add a click listener for the remove button
            self.$el.find('#removeParameter' + parameterId).on('click', function() {
                // Remove the parameter
                self.model.get('parameters').remove(parameterId);
                // Re-render the section
                self.render();
            });
        });
    },
    addParameter: function() {
        let parametersCollection = this.model.get('parameters');
        let idString = "Param";
        let idNumber = 0;
        if (parametersCollection.size()) {
            idNumber = parseInt(parametersCollection.at(parametersCollection.size() - 1).get('id').replace(idString, '')) + 1;
        }
        parametersCollection.add(new ParameterModel({
            id: idString + idNumber,
            timeValues: []
        }));
        this.render();
    },
    addIngredientBindings: function() {
        let ingredients = this.model.get('ingredients').models;
        let self = this;
        _.each(ingredients, function (ingredientModel) {
            let ingredientId = ingredientModel.get('id');
            let bindings = {
                value: '#ingredientValueSelect' + ingredientId,
                amount: '#ingredientAmountInput' + ingredientId,
                unit: '#ingredientUnitSelect' + ingredientId
            };
            let binder = new Backbone.ModelBinder(); // needs to be a new instance for each "bindings"!
            binder.bind(ingredientModel, self.el, bindings);
            // Add a click listener for the remove button
            self.$el.find('#removeIngredient' + ingredientId).on('click', function() {
                // Remove the parameter
                self.model.get('ingredients').remove(ingredientId);
                // Re-render the section
                self.render();
            });
        });
    },
    addIngredient: function() {
        let ingredientsCollection = this.model.get('ingredients');
        let idString = "Ingredient";
        let idNumber = 0;
        if (ingredientsCollection.size()) {
            idNumber = parseInt(ingredientsCollection.at(ingredientsCollection.size() - 1).get('id').replace(idString, '')) + 1;
        }
        ingredientsCollection.add(new IngredientModel({
            id: idString + idNumber,
            value: this.ingredients[0].ID
        }));
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
    initValidators: function() {
        Foundation.Abide.defaults.validators['awValidation'] =
            function($el, required) {
                if(!required) return true;
                let value = $el.val();
                return (0 <= value && value <= 1)
            };
        Foundation.Abide.defaults.validators['phValidation'] =
            function($el, required) {
                if(!required) return true;
                let value = $el.val();
                return (0 <= value && value <= 14)
            };
        Foundation.Abide.defaults.validators['tempValidation'] =
            function($el, required) {
                if(!required) return true;
                let value = $el.val();
                return (-273.15 <= value && value <= 1000)
            };
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
    // Compare elements by Name for sorting
    compareByName: function(a, b) {
        if (a.Name < b.Name)
            return -1;
        if (a.Name > b.Name)
            return 1;
        return 0;
    }
});