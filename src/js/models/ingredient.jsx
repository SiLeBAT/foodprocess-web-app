let Backbone = require('backbone');

export let IngredientModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        name: "",
        amount: 1
    }
});
