let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');

export let WorkspaceView = Backbone.View.extend({
    activeNodeView: null,
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
                    name: 'metro'
                },
                connector: {
                    name: 'rounded'
                },
                attrs: { '.connection':
                    {'stroke-width': 2 }
                },
            }),
            drawGrid: true,
            gridSize: 15,
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

        let self = this;
        // Listen for clicks on a node
        workspace.on('cell:pointerdown', function(nodeView) {
            // Remove the focus of the element that is currently in focus
            $($(':focus')[0]).blur();
            // Check if cell a node
            if (nodeView.model instanceof joint.shapes.custom.Node) {
                // Deselect currently selected node
                self.activeNodeView && self.activeNodeView.$el.find('.node-body').removeClass('active');

                // Set node element to active
                nodeView.$el.find('.node-body').addClass('active');
                // Update the model of the properties view to the model of the selected node
                propertiesView.setCurrentNode(nodeView);
                self.activeNodeView = nodeView;
            }
        });
        // Listen for clicks on the paper
        workspace.on('blank:pointerdown', function(nodeView) {
            // Remove the focus of the element that is currently in focus
            $($(':focus')[0]).blur();
            // Deselect currently selected node
            if (self.activeNodeView) {
                self.activeNodeView.$el.find('.node-body').removeClass('active');
                self.activeNodeView = null;
                propertiesView.setCurrentNode(null);
            }
        });

        let zoomLevel = 1;
        this.$el.on('mousewheel', function(event) {
            if (event.originalEvent.wheelDelta > 0) {
                // zoom in
                zoomLevel = Math.min(3, zoomLevel + 0.1);
            } else {
                // zoom out
                zoomLevel = Math.max(0.2, zoomLevel - 0.1);
            }
            workspace.scale(zoomLevel, zoomLevel); //, 0, 0);
        });
    }
});