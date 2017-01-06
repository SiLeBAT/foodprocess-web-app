window.$ = window.jQuery = require('jquery');
require('javascript-csv');
let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');

let ingredientsCSV = require('../../cv/ingredients.csv');

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

export let IngredientModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        name: "",
        amount: 1
    }
});

// The properties for an ingredients node
let IngredientsProperties = Backbone.Model.extend({
    defaults: {
        type: nodeTypes.INGREDIENTS,
        // font-awesome icon
        icon: 'cutlery',
        // optional additional css class for the node content
        cssClasses: 'ingredients',
        ingredients: []
    }
});

// TODO: Move me
class IngredientsService {
    constructor() {
        this.readFile();
    }
    getIngredients() {
        return this.ingredients;
    }
    readFile() {
        let self = this;
        $.ajax({
            url: ingredientsCSV,
            success: function(data) {
                let csvData = data;

                let list = $.csv.toObjects(csvData, {
                    'separator': ";",
                    'delimiter': "\n"
                });
                self.ingredients = list;
                self.ingredients.sort(self.compareByName);
            }
        })
    }
    compareByName(a, b) {
        if (a.Name < b.Name)
            return -1;
        if (a.Name > b.Name)
            return 1;
        return 0;
    }
}
// make it a singleton
export let ingredientsServiceInstance = new IngredientsService();
