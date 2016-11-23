let joint = require('../../vendor/joint.js');
let _ = require('lodash');
let Backbone = require('backbone');

import { nodeTypes } from './index.jsx';

// This class represents a food process node. It creates an instance of the basic node and adds some configuration to it.
export class FoodProcessNode {
    constructor(position, numberOfInPorts, numberOfOutPorts) {
        // Set the properties of the node
        this.node = new joint.shapes.custom.Node({
            properties: new FoodProcessProperties()
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
            this.node.addDefaultPort('in');
        }
        for (let i = 0; i < numberOfOutPorts; i++) {
            this.node.addDefaultPort('out');
        }
        return this.node;
    };
}

// The properties for a food process node
let FoodProcessProperties = Backbone.Model.extend({
    defaults: {
        type: nodeTypes.FOOD_PROCESS,
        icon: 'random',
        cssClasses: 'food-process',
        processName: "",
        duration: 0,
        durationUnit: "min",
        temperature: 0,
        temperatureUnit: "C",
        pH: 0,
        aw: 0,
        pressure: 0,
        pressureUnit: "bar"
    }
});