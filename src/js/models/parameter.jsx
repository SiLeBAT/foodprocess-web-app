let Backbone = require('backbone');

export let ParameterModel = Backbone.Model.extend({
    defaults: {
        name: "",
        unit: "",
        timeValues: []
    }
});

export let ParameterCollection = Backbone.Collection.extend({
    model: ParameterModel
});