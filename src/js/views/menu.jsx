let $ = require('jquery');
let joint = require('../../vendor/joint.js');

let menuTemplate = require('../../templates/menu.html');

import {FoodProcessNode, nodeConfig} from '../models/index.jsx';

export let MenuView = Backbone.View.extend({
    template: _.template(menuTemplate),
    nodesLibraryElementId: '#nodes-library',
    initialize: function(workspaceGraph, workspaceElement) {
        this.workspaceGraph = workspaceGraph;
        this.workspaceElement = workspaceElement;
    },
    render: function() {
        this.$el.html(this.template({}));
        this.renderNodesLibrary();
    },
    renderNodesLibrary: function() {
        let nodesLibraryGraph = new joint.dia.Graph;
        let nodesLibraryPaper = new joint.dia.Paper({
            el: this.$(this.nodesLibraryElementId),
            width: nodeConfig.totalWidth+ 'px',
            height: '100%',
            model: nodesLibraryGraph,
            interactive: false,
        });

        nodesLibraryGraph.addCells(this.createMenuNodes());

        let workspaceGraph = this.workspaceGraph;
        let workspaceElement = this.workspaceElement;

        this.addDragAndDropListener(workspaceGraph, workspaceElement, nodesLibraryPaper);
    },
    createMenuNodes: function() {
        let nodes = [];
        nodes.push(new FoodProcessNode({ x: 0, y: 0}, "", 0, 1));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight}, "", 1, 0));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight*2}, "", 1, 1));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight*3}, "", 2, 1));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight*4}, "", 1, 2));
        nodes.push(new FoodProcessNode({ x: 0, y: nodeConfig.totalHeight*5}, "", 2, 2));
        return nodes;
    },
    addDragAndDropListener: function(workspaceGraph, workspaceElement, nodesLibraryPaper) {
        nodesLibraryPaper.on('cell:pointerdown', function(nodeView, event, x, y) {
            let rootElement = $('body');
            rootElement.append(`<div id="flyingNode" class="flyingNode"></div>`);
            let flyingNodeElement = $('#flyingNode');
            let flyingNodeGraph = new joint.dia.Graph;
            let flyingNodePaper = new joint.dia.Paper({
                el: flyingNodeElement,
                model: flyingNodeGraph,
                width: nodeConfig.totalWidth + 'px',
                height: nodeConfig.totalHeight + 'px',
                interactive: false
            });
            let flyingNodeShape = nodeView.model.clone();
            let position = nodeView.model.position();
            let offset = {
                x: x - position.x,
                y: y - position.y
            };

            flyingNodeShape.position(nodeConfig.portSize/2, 0);
            flyingNodeGraph.addCell(flyingNodeShape);
            flyingNodeElement.offset({
                left: event.pageX - offset.x,
                top: event.pageY - offset.y
            });

            rootElement.on('mousemove.fly', function(event) {
                flyingNodeElement.offset({
                    left: event.pageX - offset.x,
                    top: event.pageY - offset.y
                });
            });
            rootElement.on('mouseup.fly', function(event) {

                let x = event.pageX;
                let y = event.pageY;
                let target = workspaceElement.offset();

                // Dropped over paper ?
                if (x > target.left && x < target.left + workspaceElement.width() && y > target.top && y < target.top + workspaceElement.height()) {
                    let newNode = flyingNodeShape.clone();
                    newNode.position(x - target.left - offset.x + nodeConfig.portSize/2, y - target.top - offset.y);
                    workspaceGraph.addCell(newNode);
                }
                rootElement.off('mousemove.fly').off('mouseup.fly');
                flyingNodeShape.remove();
                flyingNodeElement.remove();
            });
        });
    },
});