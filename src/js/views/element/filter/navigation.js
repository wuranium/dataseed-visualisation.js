define(['backbone', 'underscore', '../filter', 'text!../../../templates/element/filter/navigationDimension.html', 'text!../../../templates/element/filter/navigationElement.html', 'bootstrap_collapse'],
    function (Backbone, _, FilterElementView, navigationDimensionTemplate, navigationElementTemplate) {
    'use strict';

    var NavigationDimensionView = Backbone.View.extend({

        template: _.template(navigationDimensionTemplate),

        initialize: function(opts) {
            this.visualisation = opts.visualisation;
            this.navigation = opts.navigation;
            this.dimension = opts.dimension;
            this.index = opts.index;
        },

        render: function() {
            var attrs = this.navigation.getDimension(this.dimension, this.index);
            attrs.dataset = this.visualisation.dataset;
            this.$el.html(this.template(_.extend({}, attrs)));
            return this;
        }

    });

    var NavigationElementView = FilterElementView.extend({

        events: {
            'click td .dimension-cut input': 'toggleCut',
            'click h3 a': 'toggleAccordion'
        },

        template: _.template(navigationElementTemplate),

        initialize: function(options) {
            this.visualisation = options.visualisation;
            this.accordionState = {};

            this.dimensions = _(this.model.get('dimensions')).map(function (dimension, index) {
                return new NavigationDimensionView({
                    visualisation: this.visualisation,
                    navigation: this,
                    dimension: dimension,
                    index: index
                });
            }, this);
        },

        render: function () {
            this.$el.html(this.template(this.model.attributes));
            var $accordion = this.$('.accordion');

            _.each(this.dimensions, function(dimension) {
                $accordion.append(dimension.render().el);
            }, this);

            /*
             * Set the style for the filter DOM elements depending on the
             * current cut set.
             */

            // DOM elements related to dimensions not included in the cut
            this.$('.table .dimension-cut .cut-label').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            this.$('.table .cut-totals').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

            // DOM elements related to:
            //  - dimensions included in the cut
            //  - values that are not cut values
            this.$('.table.cut .dimension-cut .cut-label').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));
            this.$('.table.cut .cut-totals').css('color', this.visualisation.styles.getStyle('featureFillActive', this.model));

            // DOM elements related to:
            //  - dimensions included in the cut
            //  - values that are cut values
            this.$('.table.cut .active .dimension-cut .cut-label').css('color', this.visualisation.styles.getStyle('featureFill', this.model));
            this.$('.table.cut .active .cut-totals').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

            /*
             * Set the style for the DOM elements that do not visually depend on
             * the cut
             */

            this.$('.dimension-filter .num-selected').css('color', this.visualisation.styles.getStyle('featureFill', this.model));

            return this;
        },

        getDimension: function (dimension, index) {
            var attrs = this.getDimensionAttrs(dimension, index),
                field = this.visualisation.dataset.fields.findWhere({id: attrs.id});

            // Check if there are a cut on the filter dimensions. Show reset if so.
            if(this.model.isCut(index)) {
                this.$(".container-icon").addClass('in');
                this.$('.remove-filter').tipsy({gravity: 's'});
            }

            return {
                id: attrs.id,
                accordion_id: this.model.get('id') + '_' + attrs.id.replace(/[^a-z0-9_\-]/gi, '_'),
                label: _.isUndefined(field) ? this.model.get('label') : field.get('label'),
                cut: this.model.getCut(index),
                num_selected : _.isUndefined(this.model.getCut(index))?
                    attrs.values.length:
                    this.model.getCut(index).length,
                state: (this.accordionState[attrs.id] === true),
                values: attrs.values
            };
        },

        toggleAccordion: function(e) {
            var id = $(e.currentTarget).parents('.accordion-group').data('dimension');
            this.accordionState[id] = (this.accordionState[id] !== true);
        },

        /**
         * Override FilterElementView.toggleCut() in order to handle cuts on
         * multiple dimensions.
         */
        toggleCut: function (e) {
            e.preventDefault();
            var $cut = $(e.currentTarget),
                dimension = $cut.parents('.filter-group').data('dimension');
            if ($cut.closest('.cut-wrapper').hasClass('active')) {
                this.visualisation.dataset.removeCut([dimension], [$cut.data('value')]);

            } else {
                this.visualisation.dataset.addCut(_.object([dimension], [$cut.data('value')]), true);
            }
        }

    });

    return NavigationElementView;

});
