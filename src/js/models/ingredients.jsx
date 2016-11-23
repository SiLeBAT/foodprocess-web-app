let joint = require('../../vendor/joint.js');
let _ = require('lodash');
let Backbone = require('backbone');

import { nodeTypes } from './index.jsx';

// This class represents an ingredients node. It creates an instance of the basic node and adds some configuration to it.
export class IngredientsNode {
    constructor(position) {
        // Set the properties of the node
        this.node = new joint.shapes.custom.Node({
            properties: new IngredientsProperties()
        });
        // Add the given position to the default position
        let newPosition = {
            x: this.node.position().x + position.x,
            y: this.node.position().y + position.y
        };
        this.node.position(newPosition.x, newPosition.y);
        this.node.addDefaultPort('out');
        return this.node;
    };
}

// The properties for an ingredients node
let IngredientsProperties = Backbone.Model.extend({
    defaults: {
        type: nodeTypes.INGREDIENTS,
        icon: 'cutlery',
        cssClasses: 'ingredients',
        ingredients: []
    }
});