let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');

export let WorkspaceView = Backbone.View.extend({
    initialize: function(workspaceGraph, propertiesView) {
        this.workspaceGraph = workspaceGraph;
        this.propertiesView = propertiesView;
    },
    render: function() {
        let workspaceGraph = this.workspaceGraph;
        let propertiesView = this.propertiesView;

        let workspace = new joint.dia.Paper({
            el: this.$el,
            width: '100%',
            height: '100%',
            model: workspaceGraph,
            defaultLink: new joint.dia.Link({
                router: {
                    name: 'manhattan'
                },
                connector: {
                    name: 'normal'
                }
            }),
            // Remove links without target
            linkPinning: false,
            // An element may not have more than one link with the same source and target element
            multiLinks: false,
            // Enable link snapping
            snapLinks: {
                radius: 15
            },
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                // Prevent linking from input ports to input ports.
                if (magnetS && magnetS.getAttribute('port-group') === 'inPorts' && magnetT && magnetT.getAttribute('port-group') === 'inPorts') {
                    return false;
                }
                // Prevent linking from output ports to output ports.
                if (magnetS && magnetS.getAttribute('port-group') === 'outPorts' && magnetT && magnetT.getAttribute('port-group') === 'outPorts') {
                    return false;
                }
                // Prevent linking to any element other than ports
                if (!magnetT || !magnetT.getAttribute('port-group')) {
                    return false;
                }
                // Prevent linking from output ports to input ports within one element.
                return cellViewS !== cellViewT;
            },
            interactive: function(cellView) {
                if (cellView.model instanceof joint.dia.Link) {
                    // Disable the default vertex add functionality on pointerdown.
                    return { vertexAdd: false };
                }
                return true;
            }
        });

        // Listen for clicks on a node
        workspace.on('cell:pointerdown', function(nodeView) {
            // Check if cell a node
            if (nodeView.model instanceof joint.shapes.custom.Node) {
                // Deselect currently selected node
                this.activeNodeView && this.activeNodeView.$el.find('.node-body').removeClass('active');
                // Set node element to active
                nodeView.$el.find('.node-body').addClass('active');
                // Update the model of the properties view to the model of the selected node
                propertiesView.setCurrentNode(nodeView);
                this.activeNodeView = nodeView;
            }
        });
        // Listen for clicks on the paper
        workspace.on('blank:pointerdown', function(nodeView) {
            // Deselect currently selected node
            if (this.activeNodeView) {
                this.activeNodeView.$el.find('.node-body').removeClass('active');
                this.activeNodeView = null;
                propertiesView.setCurrentNode(null);
            }
        });
    },
    activeNodeView: null
});