let $ = require('jquery');
let joint = require('../../vendor/joint.js');
let Backbone = require('backbone');

let menuTemplate = require('../../templates/menu.html');

import {FoodProcessNode, IngredientsNode, nodeConfig} from '../models/index.jsx';
import {SettingsView} from './index.jsx';

export let MenuView = Backbone.View.extend({
    template: menuTemplate,
    // Render the nodes library in the element with the given selector
    nodesLibraryElementId: 'nodes-library',
    // Bind the content of the input fields to the model
    bindings: {
        '#processNameInput': 'processName',
        '#authorInput': 'author',
        '#settingsProcessNameInput': 'processName',
        '#settingsAuthorInput': 'author',
        '#settingsCreated': 'created',
        '#settingsLastChange': 'lastChange',
    },
    // Bind events to appropriate functions
    events: {
        'click #sendToAPIButton': 'sendToAPI',
        'click #saveButton': 'saveModel',
        'click #loadButton': 'loadModel',
    },
    // The model for all metadata
    model: new Backbone.Model({
        processName: '',
        author: '',
        created: '',
        lastChanged: '',
        metadata: [],
    }),
    initialize: function(workspaceGraph, workspaceElement) {
        this.workspaceGraph = workspaceGraph;
        this.workspaceElement = workspaceElement;
    },
    render: function() {
        this.workspaceGraph.set('meta', this.model);
        this.$el.html(this.template);
        this.renderNodesLibrary();
        this.stickit();

        // Render the settings modal
        this.settings = new SettingsView(this.model, this.workspaceGraph, this.$el.find('#processNameInput'), this.$el.find('#authorInput'));
        this.settings.setElement(this.$('#settings'));
        this.settings.render();
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

        // Create a reference of the workspace object for later
        let workspaceGraph = this.workspaceGraph;
        let workspaceElement = this.workspaceElement;

        // Listen for drag events to enable drag and drop of the nodes of the library
        this.addDragAndDropListener(workspaceGraph, workspaceElement, nodesLibraryPaper);
    },
    // Create the nodes for the library
    createMenuNodes: function() {
        let nodes = [];
        nodes.push(new FoodProcessNode({ x: 0, y: 0}, 1, 1));
        nodes.push(new FoodProcessNode({ x: nodeConfig.totalWidth + nodeConfig.spacing, y: 0}, 2, 1));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight}, 1, 2));
        nodes.push(new FoodProcessNode({ x: nodeConfig.totalWidth + nodeConfig.spacing, y: nodeConfig.totalHeight}, 1, 0));
        nodes.push(new IngredientsNode({ x: 0, y: nodeConfig.totalHeight*2}, 0, 1));
        return nodes;
    },
    addDragAndDropListener: function(workspaceGraph, workspaceElement, nodesLibraryPaper) {
        // Listen for the "pointerdown" event on a node of the library
        nodesLibraryPaper.on('cell:pointerdown', function(nodeView, event, x, y) {
            let rootElement = $('body');
            // Add a DOM element to hold the node that is dragged
            rootElement.append(`<div id="flyingNode" class="flyingNode"></div>`);
            let flyingNodeElement = $('#flyingNode');
            // Create new graph and paper for the dragged node
            let flyingNodeGraph = new joint.dia.Graph;
            let flyingNodePaper = new joint.dia.Paper({
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
            flyingNodeElement.offset({
                left: event.pageX - offset.x - nodeConfig.portSize/2,
                top: event.pageY - offset.y
            });

            // Move the flying node with the movement of the mouse
            rootElement.on('mousemove.fly touchmove.fly', function(event) {
                let posX = event.pageX;
                let posY = event.pageY;
                if (event.type === 'touchmove') {
                    posX = event.originalEvent.touches[0].pageX;
                    posY = event.originalEvent.touches[0].pageY;
                }
                flyingNodeElement.offset({
                    left: posX - offset.x,
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
                    // Clone the properties separately to generate a unique id
                    newNode.set({
                        properties: newNode.get('properties').clone()
                    });
                    newNode.position(posX - target.left - offset.x + nodeConfig.portSize/2, posY - target.top - offset.y);
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
    sendToAPI: function() {
        console.log(this.workspaceGraph);
        console.log(this.workspaceGraph.toJSON());
        console.log(JSON.stringify(this.workspaceGraph.toJSON()));
    },
    saveModel: function() {
        // TODO
    },
    loadModel: function() {
        // TODO
    }
});