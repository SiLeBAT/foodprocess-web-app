let Backbone = require('backbone');

export let ParameterModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        name: "",
        unit: "",
        timeValues: []
    }
});

export let ParameterCollection = Backbone.Collection.extend({
    model: ParameterModel
});