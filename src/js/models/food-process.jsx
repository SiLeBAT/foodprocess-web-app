let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');

import { nodeTypes, ParameterCollection, ParameterModel } from './index.jsx';


// This class represents a food process node. It creates an instance of the basic node and adds some configuration to it.
export class FoodProcessNode {
    constructor(position, numberOfInPorts, numberOfOutPorts) {
        // Set the properties of the node
        this.node = new joint.shapes.custom.Node({
            properties: new FoodProcessProperties()
        });
        this.node.get('properties').set('parameters', this.buildDefaultCollection());
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

    buildDefaultCollection() { // FIXME
        return new ParameterCollection();
        // temperature
        // aw ...
    }
}
// The properties for a food process node
let FoodProcessProperties = Backbone.Model.extend({
    defaults: {
        type: nodeTypes.FOOD_PROCESS,
        // font-awesome icon
        icon: 'random',
        // optional additional css class for the node content
        cssClasses: 'food-process',
        processName: "",
        duration: undefined,
        durationUnit: "min",
        temperature: undefined,
        temperatureUnit: "°C",
        temperatureTimeValues: [],
        pH: undefined,
        phTimeValues: [],
        aw: undefined,
        awTimeValues: [],
        pressure: undefined,
        pressureUnit: "bar",
        pressureTimeValues: [],
        parameters: undefined // instance of ParameterCollection
    }
});
