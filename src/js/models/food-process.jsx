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
        let collection = new ParameterCollection();
        collection.add(new ParameterModel({
            id: 'Param0',
            name: 'Temperature',
            unit: '°C',
            unitOptions: [{Name:'°C'}, {Name:'°F'}, {Name:'K'}],
            timeValues: [],
            optional: false
        }));
        collection.add(new ParameterModel({
            id: 'Param1',
            name: 'pH',
            unit: null,
            timeValues: [],
            optional: false
        }));
        collection.add(new ParameterModel({
            id: 'Param2',
            name: 'aw',
            unit: null,
            timeValues: [],
            optional: false
        }));
        collection.add(new ParameterModel({
            id: 'Param3',
            name: 'Pressure',
            unit: 'bar',
            unitOptions: [{Name:'bar'}, {Name:'Pa'}],
            timeValues: [],
            optional: false
        }));
        return collection;
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
        // temperature: undefined,
        // temperatureUnit: "°C",
        // temperatureTimeValues: [],
        // pH: undefined,
        // phTimeValues: [],
        // aw: undefined,
        // awTimeValues: [],
        // pressure: undefined,
        // pressureUnit: "bar",
        // pressureTimeValues: [],
        parameters: undefined // instance of ParameterCollection
    },
    clone: function() {
        let propertiesClone =  Backbone.Model.prototype.clone.apply(this, arguments);
        let parameters = propertiesClone.get('parameters');
        if (parameters) {
            let parametersClone = parameters.clone();
            propertiesClone.set('parameters', parametersClone);
        }
        return propertiesClone;
    }
});
