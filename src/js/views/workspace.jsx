let joint = require('../../vendor/joint.js');
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
            // TODO style link
            defaultLink: new joint.dia.Link({
                attrs: {
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
            }
        });

        // Listen for clicks on a node
        workspace.on('cell:pointerdown', function(cellView) {
            // Check if cell is a port or node
            if (!cellView.model.hasPorts ||!cellView.model.hasPorts()) {
                return;
            }
            // Update the model of the properties view to the model of the selected node
            propertiesView.setCurrentNode(cellView);
        });
    }
});