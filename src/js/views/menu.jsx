/**
 *   This file declares and exports the view for the menu. The declaration contains all data bindings and events for the view. It implements the behavior for the drag and drop node library and the import, export and send functionality. Furthermore it renders the settings view.
 */

let $ = require('jquery');
let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');
let _ = require('lodash');
let moment = require('moment');
let platform = require('platform');

let menuTemplate = require('../../templates/menu.html');

import {FoodProcessNode, IngredientsNode, nodeConfig, MetadataModel} from '../models/index.jsx';
import {SettingsView} from './index.jsx';

let configJSON = require('../../../config.json');

export let MenuView = Backbone.View.extend({
    template: _.template(menuTemplate),
    // Render the nodes library in the element with the given selector
    nodesLibraryElementId: 'nodes-library',
    // Bind the content of the input fields to the model
    bindings: {
        '#workflowNameInput': 'workflowName',
        '#authorInput': 'author',
    },
    // Bind events to appropriate functions
    events: {
        'click #sendToAPIButton': 'sendToAPIOpened',
        'click #saveButton': 'saveModel',
        'change #uploadInput': 'loadModel'
    },
    // The model for all metadata
    model: new MetadataModel(),
    initialize: function(workspaceGraph, workspaceElement, workspace) {
        this.workspaceGraph = workspaceGraph;
        this.workspaceElement = workspaceElement;
        this.workspace = workspace;
        this.config = configJSON;

        let self = this;
        $(window).on('beforeunload', function() {
            if (self.unsavedChanged()) {
                return "The model contains unsaved changes that will be lost. Continue anyway?";
            }
        });
    },
    render: function() {
        this.workspaceGraph.set('settings', this.model);
        this.$el.html(this.template({model: this.model, url: this.config.defaultAPIUrl}));
        this.renderNodesLibrary();
        this.stickit();

        this.$el.foundation();

        // Render the settings modal
        this.settings = new SettingsView(this.model, this.workspaceGraph, this.$el.find('#workflowNameInput'), this.$el.find('#authorInput'));
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
    sendToAPIOpened: function() {
        if (this.sendToAPIInitialized) {
            return;
        }
        let self = this;
        $('#sendToAPISendButton').on('click', function() {
            self.sendToAPI($('#sendToAPIURL').val());
        });
        this.sendToAPIInitialized = true;
    },
    sendToAPI: function(url) {
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: JSON.stringify(this.workspaceGraph.toJSON()),
            success: function (response) {
                console.log("Success: ", response);
            },
            error: function(response) {
                console.error("Error: ", response);
            }
        });
    },
    saveModel: function(event) {
        this.model.set('lastSaved', new Date());
        let exportJSON = this.workspaceGraph.toJSON();
        let blob = new Blob([JSON.stringify(exportJSON)], {type: "application/json"});
        let url  = URL.createObjectURL(blob);
        let fileName = (exportJSON.settings.get('workflowName') || 'workflow') + '.json';
        if (platform.name === "Microsoft Edge") {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
            return;
        }
        $(event.target).attr('download', fileName);
        $(event.target).attr('href', url);
    },
    loadModel: function(event) {
        if (!this.unsavedChanged() || confirm('The model contains unsaved changes that will be lost. Continue anyway?')) {
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
        } else {
            event.target.value = "";
        }
    },
    unsavedChanged: function() {
        let lastChanged = moment(this.model.get('lastChanged')).unix();
        let lastSaved = moment(this.model.get('lastSaved')).unix() || null;
        let created = moment(this.model.get('created')).unix();
        return (!lastSaved || lastChanged > lastSaved) && lastChanged !== created;
    }
});