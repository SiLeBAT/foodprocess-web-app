let joint = require('../../vendor/joint.js');
let _ = require('lodash');

export class FoodProcessNode {
    constructor(position, name, numberOfInPorts, numberOfOutPorts) {
        this.node = new Node({
            attrs: {
                '.label': {
                    text: name ? name : ''
                }
            }
        });
        let newPosition = {
            x: this.node.position().x + position.x,
            y: this.node.position().y + position.y
        };
        this.node.position(newPosition.x, newPosition.y);
        numberOfInPorts = numberOfInPorts !== undefined ? numberOfInPorts : 2;
        numberOfOutPorts = numberOfOutPorts !== undefined ? numberOfOutPorts : 1;
        for (let i = 0; i < numberOfInPorts; i++) {
            this.addInPort();
        }
        for (let i = 0; i < numberOfOutPorts; i++) {
            this.addOutPort();
        }
        return this.node;
    };

    addInPort() {
        this.node.addPort({
            id: 'in' + this.node.getPorts().length + 1,
            group: 'inPorts'
        });
    };

    addOutPort() {
        this.node.addPort({
            id: 'out' + this.node.getPorts().length + 1,
            group: 'outPorts'
        });
    };
}

export let nodeConfig = {
    bodyWidth: 60,
    bodyHeight: 60,
    portSize: 12,
    labelOffset: -15
};
nodeConfig.totalWidth = nodeConfig.bodyWidth + nodeConfig.portSize;
nodeConfig.totalHeight = nodeConfig.bodyHeight - nodeConfig.labelOffset;

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