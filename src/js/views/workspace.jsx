let joint = require('../../vendor/joint.js');

export let WorkspaceView = Backbone.View.extend({
    initialize: function(workspaceGraph) {
        this.workspaceGraph = workspaceGraph;
    },
    render: function() {
        let paper = new joint.dia.Paper({
            el: this.$el,
            width: '100%',
            height: '100%',
            model: this.workspaceGraph,
            // TODO style link
            defaultLink: new joint.dia.Link({
                attrs: {
                }
            }),
            linkPinning: false,
            multiLinks: false,
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
    }
});