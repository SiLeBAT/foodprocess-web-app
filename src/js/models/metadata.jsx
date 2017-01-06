let Backbone = require('backbone');

export let MetadataModel = Backbone.Model.extend({
    defaults: {
        workflowName: '',
        author: '',
        created: '',
        lastChanged: '',
        metadata: [],
        URL: ''
    }
});