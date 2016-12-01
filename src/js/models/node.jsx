let joint = require('jointjs/dist/joint.js');
let _ = require('lodash');
let Backbone = require('backbone');

// Possible types of nodes
export const nodeTypes = {
    FOOD_PROCESS: 0,
    INGREDIENTS: 1
};

// Some configuration for the nodes
export let nodeConfig = {
    bodyWidth: 60,
    bodyHeight: 60,
    portSize: 12,
    labelOffset: -15,
    spacing: 10
};
nodeConfig.totalWidth = nodeConfig.bodyWidth + nodeConfig.portSize;
nodeConfig.totalHeight = nodeConfig.bodyHeight - nodeConfig.labelOffset;

// Configuration for the ports of a node
let basicPortGroup = {
    attrs: {
        rect: {
            width: nodeConfig.portSize,
            height: nodeConfig.portSize,
            magnet: 'active',
            'shape-rendering': 'crispEdges'
        }
    },
    position: {
        args: {
            dx: -(nodeConfig.portSize/2),
            dy: -(nodeConfig.portSize/2),
        }
    }
};
let rightPortGroup = _.cloneDeep(basicPortGroup);
rightPortGroup.position.name = 'right';

// Basic node object
joint.shapes.custom = {};
joint.shapes.custom.Node = joint.shapes.basic.Rect.extend({

    markup: `<g class="rotatable"><g class="scalable"><rect class="node-body"/></g><text class="label"/></g>`,
    portMarkup: `<rect class="node-port"/>`,

    defaults: _.defaultsDeep({
        type: 'custom.Node',
        size: {
            width: nodeConfig.bodyWidth,
            height: nodeConfig.bodyHeight
        },
        position: {
            x: nodeConfig.portSize/2,
            y: 0
        },
        attrs: {
            '.label': {
                text: '',
                'ref-y': nodeConfig.labelOffset,
                position: 'outside'
            },
            '.node-body': {
                'ref-width': '100%',
                'ref-height': '100%'
            }
        },
        ports: {
            groups: {
                inPorts: basicPortGroup,
                outPorts: rightPortGroup
            }
        },
        properties: {}
    }, joint.shapes.devs.Model.prototype.defaults),

    // Add an input or output port to the node
    // Use type 'in' for input and 'out' for output
    addDefaultPort(type) {
        let portsOfType = _.filter(this.getPorts(), {group: type + 'Ports'});
        // Maximal number of ports reached
        if (portsOfType.length >= 4) {
            return;
        }
        this.addPort({
            id: type + (portsOfType.length + 1),
            group: type + 'Ports'
        });
    },
    // Remove the last added input or output port from the node
    // Use type 'in' for input and 'out' for output
    removeDefaultPort(type) {
        let portsOfType = _.filter(this.getPorts(), {group: type + 'Ports'});
        // Minimal number of ports reached
        if (type === 'out' && portsOfType.length <= 0) {
            return;
        } else if (type === 'in' && portsOfType.length <= 1) {
            return;
        }
        this.removePort(portsOfType[portsOfType.length - 1]);
    },
    setName: function(name) {
        this.attr({
            '.label': {
                text: name
            }
        });
    },
    // Overwrite the toJSON method to convert the custom properties to json too
    toJSON: function() {
        let propertiesJSON = this.get('properties').toJSON();
        let jsonNode = joint.shapes.basic.Rect.prototype.toJSON.apply(this, arguments);
        jsonNode.properties = propertiesJSON;
        return jsonNode;
    }
});

// The NodeView creates a HTML element wich follows the node and displays the node icon.
joint.shapes.custom.NodeView = joint.dia.ElementView.extend({
    init: function() {
        this.template = this.createTemplate(this.model.get('properties').get('icon'), this.model.get('properties').get('cssClasses') || '');

        // Update the box position whenever the underlying model changes.
        this.listenTo(this.model, 'change', this.updateBox);
    },

    createTemplate: function(icon, cssClasses) {
        return '<div class="node-content ' + cssClasses + '"><i class="fa fa-' + icon + ' fa-2x" aria-hidden="true"></i></div>';
    },

    onRender: function() {

        if (this.$box) this.$box.remove();

        let boxMarkup = joint.util.template(this.template)();
        let $box = this.$box = $(boxMarkup);

        // Update the box size and position whenever the paper transformation changes.
        this.listenTo(this.paper, 'scale', this.updateBox);

        $box.appendTo(this.paper.el);
        this.updateBox();

        return this;
    },

    updateBox: function() {

        // Set the position and the size of the box so that it covers the JointJS element
        // (taking the paper transformations into account).
        let bbox = this.getBBox({ useModelGeometry: true });
        // let scale = V(this.paper.viewport).scale();
        let scale = {
            sx: 1,
            sy: 1
        };
        this.$box.css({
            transform: 'scale(' + scale.sx + ',' + scale.sy + ')',
            transformOrigin: '0 0',
            width: bbox.width / scale.sx,
            height: bbox.height / scale.sy,
            left: bbox.x,
            top: bbox.y
        });
    },

    onRemove: function() {

        this.$box.remove();
    }

});
