let Backbone = require('backbone');

export let IngredientModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        value: "",
        amount: 0,
        unit: "g"
    }
});

export let IngredientCollection = Backbone.Collection.extend({
    model: IngredientModel
});