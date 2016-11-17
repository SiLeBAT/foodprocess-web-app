let joint = require('../vendor/joint.js');

export let WorkspaceView = Backbone.View.extend({
    render: function() {
        let graph = new joint.dia.Graph;

        let paper = new joint.dia.Paper({
            el: this.$el,
            width: '100%',
            height: '100%',
            model: graph,
            gridSize: 1
        });

        let rect = new joint.shapes.basic.Rect({
            position: { x: 100, y: 30 },
            size: { width: 100, height: 30 },
            attrs: {
                rect: { fill: 'blue' },
                text: { text: 'my box2', fill: 'white' }
            }
        });

        let rect2 = rect.clone();
        rect2.translate(300);

        let link = new joint.dia.Link({
            source: { id: rect.id },
            target: { id: rect2.id }
        });

        graph.addCells([rect, rect2, link]);
    }
});