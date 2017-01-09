let Backbone = require('backbone');

import { CustomCollection } from './collection.jsx';

export let IngredientModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        value: "",
        amount: 0,
        unit: "g"
    }
});

export let IngredientCollection = CustomCollection.extend({
    model: IngredientModel
});