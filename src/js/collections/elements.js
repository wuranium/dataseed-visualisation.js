define(['backbone', 'underscore', '../models/visualisation/element/dynamic/measureElement', '../models/visualisation/element/dynamic/dimensionalElement', '../models/visualisation/element/staticElement'],
    function (Backbone, _, MeasureElement, DimensionalElement, StaticElement) {
    'use strict';

    var elementTypes = {
        summary: MeasureElement,
        text: StaticElement
    };

    var ElementsCollection = Backbone.Collection.extend({

        /**
         * Polymorphic Element models
         * http://backbonejs.org/#Collection-model
         */
        model: function (attrs, opts) {
            if (_.isUndefined(elementTypes[attrs.type])) {
                return new DimensionalElement(attrs, opts);
            }
            return new elementTypes[attrs.type](attrs, opts);
        },

        /**
         * Save all elements in collection
         */
        save: function (attrs, opts) {
            this.invoke('save', attrs, opts);
        },

        /**
         * Get a serialized representation of elements' state
         */
        getState: function() {
            return _.object(this.map(function(element) {
                return [element.get('id'), element.getState()];
            }));
        },

        /**
         * Update elements' state from serialized representations returned by getState()
         */
        setState: function(states) {
            this.forEach(function(element) {
                if (element.get('id') in states) {
                    element.setState(states[element.get('id')]);
                    element.resetConnections();
                }
            });
        }

    });

    return ElementsCollection;

});
