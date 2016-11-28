let $ = require('jquery');
let joint = require('jointjs/dist/joint.js');
let Backbone = require('backbone');
let moment = require('moment');
let _ = require('lodash');

let settingsTemplate = require('../../templates/settings.html');
let metadataTemplate = require('../../templates/metadata.html');

export let SettingsView = Backbone.View.extend({
    template: _.template(settingsTemplate),
    metadataTemplate: _.template(metadataTemplate),
    // Bind the content of the input fields to the model
    bindings: {
        '#settingsWorkflowNameInput': 'workflowName',
        '#settingsAuthorInput': 'author',
        '#settingsCreated': {
            observe: 'created',
            onGet: 'formatDate'
        },
        '#settingsLastChange': {
            observe: 'lastChanged',
            onGet: 'formatDate'
        }
    },
    // Bind events to appropriate functions
    events: {
        'click #addMetadataButton': 'addMetadata'
    },
    listenerAdded: false,
    initialize: function(model, workspaceGraph, workflowNameInput, authorInput) {
        this.model = model;
        this.workspaceGraph = workspaceGraph;
        this.workflowNameInput = workflowNameInput;
        this.authorInput = authorInput;

        // Set the dates of creation and last change
        this.model.set('created', new Date());
        this.model.set('lastChanged', new Date());

        // Listen to changes and update the date of the last change
        let self = this;
        this.workspaceGraph.on('add remove change', function() {
            self.updateLastChanged();
        });
        this.model.on('change', function() {
            if (self.model.changedAttributes().hasOwnProperty('lastChanged')) {
                return;
            }
            self.updateLastChanged();
        });
    },
    render: function() {
        this.$el.html(this.template({model: this.model}));
        if (!this.listenerAdded) {
            this.addMetadataListener();
            this.createListenerForSettingSynchronisation();
            this.stickit();
            this.listenerAdded = true;
        }
    },
    // Create additional listeners to synchronize the settings that are displayed twice (workflowName and author)
    createListenerForSettingSynchronisation: function() {
        let self = this;
        // Update the input field in the menu if the input field in the settings changes
        this.$el.find('#settingsWorkflowNameInput').on('propertychange change click keyup input paste', function() {
            self.workflowNameInput.val($(this).val());
        });
        this.$el.find('#settingsAuthorInput').on('propertychange change click keyup input paste', function() {
            self.authorInput.val($(this).val());
        });
    },
    // Format date
    formatDate: function(date) {
        return moment(date).format('DD.MM.YYYY HH:mm');
    },
    updateLastChanged: function() {
        this.model.set('lastChanged', new Date());
    },
    // Add a key value pair to the metadata
    addMetadataListener: function() {
        let self = this;
        this.$el.find('#addMetadataButton').on('click', function() {
            // Add empty key value pair
            self.model.get('metadata').push({
                key: '',
                value: ''
            });
            // Set element to the generated settings root element (generated by foundation)
            self.$el = $('.reveal-overlay');
            // Re-render the metadata section
            self.$el.find('#metadataSection').html(self.metadataTemplate({model: self.model}));
            // Add bindings for all metadata inputs for data synchronization
            self.addBindings();
            // Scroll to bottom if the settings view is higher than the viewport
            self.$el.scrollTop(self.$el.children(':first').height());
        });
        // Update last changed when settings are closed
        this.$el.find('#settingsModal').on('closed.zf.reveal', function() {
            self.updateLastChanged();
        });
    },
    // Add bindings for all metadata inputs for data synchronization
    addBindings: function() {
        for (let i = 0; i < this.model.get('metadata').length; i++) {
            this.addMetadataBinding('key', i);
            this.addMetadataBinding('value', i);
        }
    },
    // Create a listener for the metadata attribute
    addMetadataBinding: function(type, index) {
        let self = this;
        this.$el.find('#metadata-' + type + '-' + index).on('propertychange change click keyup input paste', function() {
            self.model.get('metadata')[index][type] = $(this).val();
        });
    }
});