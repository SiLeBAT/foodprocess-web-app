let joint = require('../../vendor/joint.js');
let _ = require('lodash');

// This class represents a food process node. It creates an instance of the basic node and adds some configuration to it.
export class FoodProcessNode {
    constructor(position, name, numberOfInPorts, numberOfOutPorts) {
        // Set the name of the label
        this.node = new Node({
            attrs: {
                '.label': {
                    text: name ? name : ''
                }
            }
        });
        // Add the given position to the default position
        let newPosition = {
            x: this.node.position().x + position.x,
            y: this.node.position().y + position.y
        };
        this.node.position(newPosition.x, newPosition.y);
        // Take the default number of ports it's undefined
        numberOfInPorts = numberOfInPorts !== undefined ? numberOfInPorts : 2;
        numberOfOutPorts = numberOfOutPorts !== undefined ? numberOfOutPorts : 1;
        // Add the input and output ports
        for (let i = 0; i < numberOfInPorts; i++) {
            this.addInPort();
        }
        for (let i = 0; i < numberOfOutPorts; i++) {
            this.addOutPort();
        }
        return this.node;
    };

    // Add an input port to the node
    addInPort() {
        this.node.addPort({
            id: 'in' + this.node.getPorts().length + 1,
            group: 'inPorts'
        });
    };

    // Add an output port to the node
    addOutPort() {
        this.node.addPort({
            id: 'out' + this.node.getPorts().length + 1,
            group: 'outPorts'
        });
    };
}

// Some configuration for the nodes
export let nodeConfig = {
    bodyWidth: 60,
    bodyHeight: 60,
    portSize: 12,
    labelOffset: -15
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
    },
};
let rightPortGroup = _.cloneDeep(basicPortGroup);
rightPortGroup.position.name = 'right';

// The basic node object
let Node = joint.shapes.basic.Rect.extend({

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
        }

    }, joint.shapes.devs.Model.prototype.defaults)
});