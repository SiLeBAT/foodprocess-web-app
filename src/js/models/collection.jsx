let Backbone = require('backbone');

export let CustomCollection = Backbone.Collection.extend({
    clone: function() {
        let collectionClone =  Backbone.Collection.prototype.clone.apply(this, arguments);
        for (let i = 0; i < collectionClone.length; i++) {
            let modelClone = collectionClone.at(i).clone();
            collectionClone.remove(collectionClone.at(i));
            collectionClone.add(modelClone, {at: i});
        }
        return collectionClone;
    }
});