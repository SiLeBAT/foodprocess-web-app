let $ = require('jquery');

let propertiesTemplate = require('../templates/properties.html');

export let PropertiesView = Backbone.View.extend({
    template: _.template(propertiesTemplate),
    render: function() {
        this.$el.html(this.template({}));
    }
});