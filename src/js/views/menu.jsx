let $ = require('jquery');
let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');
let _ = require('lodash');

let menuTemplate = require('../../templates/menu.html');

import {FoodProcessNode, IngredientsNode, nodeConfig, MetadataModel} from '../models/index.jsx';
import {SettingsView} from './index.jsx';

export let MenuView = Backbone.View.extend({
    template: menuTemplate,
    // Render the nodes library in the element with the given selector
    nodesLibraryElementId: 'nodes-library',
    // Bind the content of the input fields to the model
    bindings: {
        '#workflowNameInput': 'workflowName',
        '#authorInput': 'author',
        '#settingsWorkflowNameInput': 'workflowName',
        '#settingsAuthorInput': 'author',
        '#settingsCreated': 'created',
        '#settingsLastChange': 'lastChange',
    },
    // Bind events to appropriate functions
    events: {
        'click #sendToAPIButton': 'sendToAPI',
        'click #saveButton': 'saveModel',
        'change #uploadInput': 'loadModel',
    },
    // The model for all metadata
    model: new MetadataModel(),
    initialize: function(workspaceGraph, workspaceElement, workspace) {
        this.workspaceGraph = workspaceGraph;
        this.workspaceElement = workspaceElement;
        this.workspace = workspace;
    },
    render: function() {
        this.workspaceGraph.set('settings', this.model);
        this.$el.html(this.template);
        this.renderNodesLibrary();
        this.stickit();

        // Render the settings modal
        this.settings = new SettingsView(this.model, this.workspaceGraph, this.$el.find('#workflowNameInput'), this.$el.find('#authorInput'));
        this.settings.setElement(this.$('#settings'));
        this.settings.render();

        this.$el.foundation();
    },
    renderNodesLibrary: function() {
        // Create a graph to hold the nodes of the library
        let nodesLibraryGraph = new joint.dia.Graph;
        // Create a paper to display the nodes of the library
        let nodesLibraryPaper = new joint.dia.Paper({
            el: this.$('#' + this.nodesLibraryElementId),
            // The size of the paper is equal with the size of a node
            width: nodeConfig.totalWidth*2 + nodeConfig.spacing + 'px',
            height: nodeConfig.totalHeight*3 + 'px',
            model: nodesLibraryGraph,
            // Configure the library to be not interactive, so the nodes can't be moved
            interactive: false,
        });

        // Add the library nodes
        nodesLibraryGraph.addCells(this.createMenuNodes());

        // Listen for drag events to enable drag and drop of the nodes of the library
        this.addDragAndDropListener(nodesLibraryPaper);
    },
    // Create the nodes for the library
    createMenuNodes: function() {
        let nodes = [];
        nodes.push(new FoodProcessNode({ x: 0, y: 1}, 1, 1));
        nodes.push(new FoodProcessNode({ x: nodeConfig.totalWidth + nodeConfig.spacing, y: 1}, 2, 1));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight + 1}, 1, 2));
        nodes.push(new FoodProcessNode({ x: nodeConfig.totalWidth + nodeConfig.spacing, y: nodeConfig.totalHeight + 1}, 1, 0));
        nodes.push(new IngredientsNode({ x: 0, y: nodeConfig.totalHeight*2 + 1}, 0, 1));
        return nodes;
    },
    addDragAndDropListener: function(nodesLibraryPaper) {
        // Create a reference of the workspace object for later
        let workspaceGraph = this.workspaceGraph;
        let workspaceElement = this.workspaceElement;
        let workspace = this.workspace;

        // Listen for the "pointerdown" event on a node of the library
        nodesLibraryPaper.on('cell:pointerdown', function(nodeView, event, x, y) {
            let rootElement = $('body');
            // Add a DOM element to hold the node that is dragged
            rootElement.append(`<div id="flyingNode" class="flyingNode"></div>`);
            let flyingNodeElement = $('#flyingNode');
            // Create new graph and paper for the dragged node
            let flyingNodeGraph = new joint.dia.Graph;
            new joint.dia.Paper({ // needs to be initialized
                el: flyingNodeElement,
                model: flyingNodeGraph,
                width: nodeConfig.totalWidth + 'px',
                height: nodeConfig.totalHeight + 'px',
                interactive: false
            });
            // Copy the dragged node of the library
            let flyingNodeShape = nodeView.model.clone();
            let position = nodeView.model.position();
            let offset = {
                x: x - position.x,
                y: y - position.y
            };

            flyingNodeShape.position(nodeConfig.portSize/2, 0);
            // Add the copy of the node to the new graph
            flyingNodeGraph.addCell(flyingNodeShape);

            // Move the flying node with the movement of the mouse
            rootElement.on('mousemove.fly touchmove.fly', function(event) {
                let posX = event.pageX;
                let posY = event.pageY;
                if (event.type === 'touchmove') {
                    posX = event.originalEvent.touches[0].pageX;
                    posY = event.originalEvent.touches[0].pageY;
                }
                flyingNodeElement.offset({
                    left: posX - offset.x - nodeConfig.portSize/2,
                    top: posY - offset.y
                });
            });
            // Listen for the drop
            rootElement.on('mouseup.fly touchend.fly', function(event) {
                let posX = event.pageX;
                let posY = event.pageY;
                if (event.type === 'touchend') {
                    posX = event.originalEvent.changedTouches[0].pageX;
                    posY = event.originalEvent.changedTouches[0].pageY;
                }
                let target = workspaceElement.offset();

                // Dropped over paper ?
                if (posX > target.left && posX < target.left + workspaceElement.width() && posY > target.top && posY < target.top + workspaceElement.height()) {
                    let newNode = flyingNodeShape.clone();
                    // Clone the properties and parameters separately to generate a unique id (applies for all nested models)
                    let clonedProperties = newNode.get('properties').clone();
                    let parameters = clonedProperties.get('parameters');
                    if (parameters) {
                        let clonedParameters = parameters.clone();
                        clonedProperties.set('parameters', clonedParameters);
                    }
                    newNode.set({
                        properties: clonedProperties
                    });
                    let currentWorkspaceScale = joint.V(workspace.viewport).scale();
                    let currentWorkspaceOrigin = workspace.options.origin;
                    let newPosition = {
                        x: (posX - target.left - offset.x - currentWorkspaceOrigin.x) / currentWorkspaceScale.sx,
                        y: (posY - target.top - offset.y - currentWorkspaceOrigin.y) / currentWorkspaceScale.sy
                    };
                    newNode.position(newPosition.x, newPosition.y);
                    // Add the node to the main workspace
                    workspaceGraph.addCell(newNode);
                }
                // cleanup
                rootElement.off('mousemove.fly touchmove.fly').off('mouseup.fly touchend.fly');
                flyingNodeShape.remove();
                flyingNodeElement.remove();
            });
        });
    },
    sendToAPI: function(event) {
        // TODO
    },
    saveModel: function(event) {
        let exportJSON = this.workspaceGraph.toJSON();
        let blob = new Blob([JSON.stringify(exportJSON)], {type: "application/json"});
        let url  = URL.createObjectURL(blob);
        let fileName = (exportJSON.settings.get('workflowName') || 'workflow') + '.json';
        $(event.target).attr('download', fileName);
        $(event.target).attr('href', url);
    },
    loadModel: function(event) {
        let files = event.target.files;
        if (!files || !files.length) {
            return;
        }
        let fileReader = new FileReader();
        let self = this;
        fileReader.onload = function(event) {
            let dataFromJSON = JSON.parse(event.target.result);
            self.workspaceGraph.fromJSON(dataFromJSON);
            self.model = new MetadataModel(dataFromJSON.settings);
            self.render();
        };
        fileReader.readAsText(files.item(0));
    },

});