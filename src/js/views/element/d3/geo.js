define(['./chart', 'underscore', 'd3', '../../../lib/format'],
    function(ChartView, _, d3, format) {
    'use strict';

    var GeoChartView = ChartView.extend({

        scalingFactorX: 150,
        scalingFactorY: 10,

        scaleTicks: 7,

        scaleGutterLeft: 10,
        scaleGutterTop: -50,
        scaleGutterBottom: 10,

        scaleItemHeight: 15,
        scaleItemMarginTop: 10,

        scaleMeasureHeight: 25,

        render: function() {

            // Setup chart
            ChartView.prototype.render.apply(this, arguments);

            // Get current values
            var values = this.model.getObservations(),

                // Get polygons (in the form of GeoJSON features) for all data points
                data = _.map(values, _.bind(this.getBoundary, this)),

                // Get bounds enclosing all polygons
                bounds = d3.geo.bounds(this.createFeature(
                    'MultiPolygon',
                    _.reduce(data, this.concatCoords, [])
                )),

                // Get map size
                mapWidth = Math.abs(bounds[1][0] - bounds[0][0]),
                mapHeight = Math.abs(bounds[1][1] - bounds[0][1]);

            // Calculate map height
            this.height = (this.width / mapHeight) * this.scalingFactorY;

            // Set map projection
            var projection = d3.geo.stereographic()
                .translate([this.width / 2, this.height / 2])
                .scale((this.width / mapWidth) * this.scalingFactorX),

                // Set geo path generator using our projection
                path = d3.geo.path()
                    .projection(projection),

                // Calculate centre point of map from bounding box
                // and convert from pixel coordinates to lat/lon
                centroid = projection.invert(path.centroid(this.createFeature(
                    'Polygon',
                    [[
                        [bounds[0][0], bounds[0][1]], // left, top
                        [bounds[0][0], bounds[1][1]], // left, bottom
                        [bounds[1][0], bounds[1][1]], // right, bottom
                        [bounds[1][0], bounds[0][1]], // right, top
                        [bounds[0][0], bounds[0][1]] // left, top
                    ]]
                )));

            // Set the centre point for our projection and update path generator with new projection
            path = path.projection(projection.rotate([-centroid[0], 0]).center([0, centroid[1]]));

            // Get colour range for the current set of values
            this.colourScale = d3.scale.linear()
                .domain([
                    d3.min(values, this.getMeasure),
                    d3.max(values, this.getMeasure)
                ])
                .range([this.model.visualisation.styles.getStyle('choroplethMin'), this.model.visualisation.styles.getStyle('choroplethMax')]);

            // Attach map SVG
            var chart = d3.select(this.chartContainerEl)
                .append('svg:svg')
                    .attr('class', 'geoChart')
                    .classed('inactive', _.bind(this.model.isCut, this.model));

            // Build choropleth
            chart.append('svg:g')
                .selectAll('path')
                    .data(data)
                .enter().append('svg:path')
                    .attr('d', path)
                    .style('fill', _.bind(this.featureFill, this))
                    .attr('title', _.bind(this.getTooltip, this))
                    .on('click', _.bind(this.featureClick, this));

            // Attach tooltips
            this.attachTooltips('path');

            // Create scale
            this.height += this.scaleGutterTop;
            var chartScale = chart.append('svg:g')
                    .attr('transform', 'translate(' + this.scaleGutterLeft + ',' + this.height + ')'),
                scaleTicks = this.colourScale.ticks(this.scaleTicks),
                scaleY = this.scaleItemMarginTop;

            this.scaleItemWidth = Math.floor((this.width - (this.scaleGutterLeft * 2)) / scaleTicks.length);

            chartScale.selectAll('.scale')
                    .data(scaleTicks)
                .enter().append('rect')
                    .attr('class', 'scale')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', scaleY)
                    .attr('width', this.scaleItemWidth)
                    .attr('height', this.scaleItemHeight)
                    .attr('fill', this.colourScale);

            scaleY += this.scaleItemMarginTop + this.scaleItemHeight;
            chartScale.selectAll('.scaleLabel')
                    .data(scaleTicks)
                .enter().append('text')
                    .attr('class', 'scaleLabel')
                    .attr('x', _.bind(this.getScaleItemX, this))
                    .attr('y', scaleY)
                    .style('fill', this.getStyle('scaleLabel'))
                    .text(format.numScale);

            scaleY += this.scaleMeasureHeight;
            chartScale.append('text')
                    .attr('class', 'scaleLabel')
                    .attr('text-anchor', 'middle')
                    .attr('x', (this.width - (this.scaleGutterLeft * 2)) / 2)
                    .attr('y', (this.scaleItemMarginTop * 2) + this.scaleItemHeight + this.scaleMeasureHeight)
                    .attr('dy', -5)
                    .style('fill', this.getStyle('scaleFeature'))
                    .text(this.model.getMeasureLabel());

            // Set height
            this.height += scaleY + this.scaleGutterBottom;
            chart.attr('height', this.height);

            return this;

        },

        /**
         * Overriden: Reset all chart features
         */
        resetFeatures: function() {
            d3.select(this.chartContainerEl)
                .select('svg')
                    .selectAll('g path')
                        .style('fill', _.bind(this.featureFill, this));
        },

        /**
         * Get boundary GeoJSON data
         */
        getBoundary: function (d) {
            var modelData = this.model.getLabels();
            if (d.id in modelData) {
                return modelData[d.id].area;
            }
            return;
        },

        /**
         * Concatenate the coordinates of multiple GeoJSON features
         */
        concatCoords: function(coords, d) {
            try {
                coords = coords.concat(d.geometry.coordinates);
            } catch (e) { }
            return coords;
        },

        /**
         * Helper function to create a GeoJSON feature
         */
        createFeature: function(type, coords) {
            return {
                'type': 'Feature',
                'geometry': {
                    'type': type,
                    'coordinates': coords
                }
            };
        },

        /**
         * Set colour of geo chart feature
         */
        featureFill: function(d, i) {
            if (this.model.hasCutValue(i)) {
                return this.model.visualisation.styles.getStyle('featureFill');
            }
            return this.colourScale(this.model.getObservation(i).total);
        },

        /**
         * Set X position of scale item
         */
        getScaleItemX: function(d, i) {
            return i * this.scaleItemWidth;
        }

    });

    return GeoChartView;

});
