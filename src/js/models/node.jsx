let joint = require('../../vendor/joint.js');
let _ = require('lodash');
let Backbone = require('backbone');

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

// The basic node object
export let Node = joint.shapes.basic.Rect.extend({

    markup: '<g class="rotatable"><g class="scalable"><rect class="node-body"/></g><text class="label"/></g>',
    portMarkup: '<rect class="node-port"/>',

    defaults: _.defaultsDeep({
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
                'ref-height': '100%',
                'shape-rendering': 'crispEdges'
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
        if (portsOfType.length <= 0) {
            return;
        }
        this.removePort(portsOfType[portsOfType.length - 1]);
    }
});