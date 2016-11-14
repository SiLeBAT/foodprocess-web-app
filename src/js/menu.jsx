let $ = require('jquery');

let menuTemplate = require('../templates/menu.html');

export let MenuView = Backbone.View.extend({
    template: _.template(menuTemplate),
    render: function() {
        this.$el.html(this.template({}));
    }
});