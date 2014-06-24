define(['backbone', 'underscore', '../../lib/format', 'text!../../templates/element/table.html'],
    function(Backbone, _, format, tableTemplate) {
    'use strict';

    var TableChartView = Backbone.View.extend({

        events: {
            'click .table-row a': 'featureClick',
            'click .table-sort': 'sortSelect'
        },

        template: _.template(tableTemplate),

        sortProperty: 'total',
        sortDirection: -1,

        // Chart constants
        margin: 25,
        rowHeight: 29,
        maxHeight: 400,

        render: function() {
            var attrs = _.extend({
                values: this.getTableValues(),
                dimension: this.model.get('dimensions')[0],
                cut: this.model.getCut(),
                sortProperty: this.sortProperty,
                sortDirection: this.sortDirection,
                dataset : this.model.dataset
            }, this.model.attributes);

            // Render template
            this.$el.html(this.template(attrs));

            // Set styles (including cut highlighting)
            this.resetFeatures();

            // Calculate the table height
            if (!this.height) {
                this.height = (attrs.values.length * this.rowHeight) + this.margin;
            }

            return this;
        },

        getTableValues: function() {
            var values = _.chain(this.model.getObservations())
                //._map transforms an array to another array
                //value parameter is the value of the chained getObservation
                .map(function(value, index) {
                    //_.extend used to add more objects to the value object
                    return {
                        index: index,
                        id: value.id,
                        total: value.total,
                        totalFormat: format.num(value.total),
                        label: this.model.getLabel(value).label
                    };
                }, this)
                //sort the object by the current sorting property
                .sortBy(this.sortProperty)
                //value() to return the value only and not the wrapped methods in _.chain()
                .value();

            if (this.sortDirection === -1) {
                values.reverse();
            }

            return values;
        },

        featureClick: function(e) {
            e.preventDefault();
            var index = $(e.currentTarget).parents('tr').data('index');
            if (this.model.featureClick(index)) {
                this.resetFeatures();
            }
        },

        sortSelect: function(e) {
            e.preventDefault();
            var $sort = $(e.currentTarget);

            //if the same th sort header is selected then change the direction, else switch the th
            if ($sort.data('sort-property') === this.sortProperty) {
                this.sortDirection *= -1;
            } else {
                this.sortProperty = $sort.data('sort-property');
            }

            this.render();
            return;
        },

        resetFeatures: function() {
            // Get the colours from the model
            var featureFill = this.model.visualisation.styles.getStyle('featureFill', this.model),
                backgroundColour = this.model.visualisation.styles.getStyle('background', this.model),
                headingColour = this.model.visualisation.styles.getStyle('heading', this.model),
                featureFillActive = this.model.visualisation.styles.getStyle('featureFillActive', this.model);

            // Generic styles
            this.$('h2').css('color', headingColour);
            this.$el.parent().css('background-color', backgroundColour);

            // Styles to apply if the table's dimension is not included in the
            // current cut.
            this.$('.table-row a').css('color', featureFill);

            // Styles to apply if the table's dimension is included in the
            // current cut.
            this.$('.table.cut .table-row a').css('color', featureFillActive);
            this.$('.table.cut .table-row.cut-active a').css('color', featureFill);
        }

    });

    return TableChartView;

});
