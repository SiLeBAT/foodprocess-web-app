/**
 *   This file declares and exports a model for the metadata of the workflow. It declares all attributes that are detached to a workflow.
 */

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