let joint = require('../vendor/joint.js');

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
            gridSize: 1
        });
    }
});