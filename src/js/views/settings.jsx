let $ = require('jquery');
let joint = require('../../vendor/joint.js');
let Backbone = require('backbone');
let moment = require('moment');

let settingsTemplate = require('../../templates/settings.html');

export let SettingsView = Backbone.View.extend({
    template: settingsTemplate,
    // Bind the content of the input fields to the model
    bindings: {
        '#settingsProcessNameInput': 'processName',
        '#settingsAuthorInput': 'author',
        '#settingsCreated': {
            observe: 'created',
            // onGet: function() {
            //     return 'hello';
            // }
        },
        '#settingsLastChange': 'lastChanged',
    },
    initialize: function(model, workspaceGraph, processNameInput, authorInput) {
        this.model = model;
        this.workspaceGraph = workspaceGraph;
        this.processNameInput = processNameInput;
        this.authorInput = authorInput;

        // Set the dates of creation and last change
        this.model.set('created', new Date());
        this.model.set('lastChanged', new Date());

        // Listen to changes and update the date of the last change
        let self = this;
        this.workspaceGraph.on('add remove change', function() {
            self.model.set('lastChanged', new Date());
        });
    },
    render: function() {
        this.$el.html(this.template);
        this.stickit();
        this.createListenerForSettingSynchronisation();
    },
    // Create additional listeners to synchronize the settings that are displayed twice (processName and author)
    createListenerForSettingSynchronisation: function() {
        let self = this;
        // Update the input field in the menu if the input field in the settings changes
        this.$el.find('#settingsProcessNameInput').on('propertychange change click keyup input paste', function() {
            self.processNameInput.val($(this).val());
        });
        this.$el.find('#settingsAuthorInput').on('propertychange change click keyup input paste', function() {
            self.authorInput.val($(this).val());
        });
    }
});