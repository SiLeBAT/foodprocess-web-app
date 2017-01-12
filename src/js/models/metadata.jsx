let Backbone = require('backbone');

export let MetadataModel = Backbone.Model.extend({
    defaults: {
        workflowName: '',
        author: '',
        reference: '',
        description: '',
        created: '',
        lastChanged: '',
        lastSaved: '',
        metadata: [],
    }
});