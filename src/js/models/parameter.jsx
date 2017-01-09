let Backbone = require('backbone');

import { CustomCollection } from './collection.jsx';

export let ParameterModel = Backbone.Model.extend({
    defaults: {
        id: undefined,
        name: "",
        unit: "",
        timeValues: [],
        optional: true
    }
});

export let ParameterCollection = CustomCollection.extend({
    model: ParameterModel
});