define(['jquery', 'models/dataset', 'models/dataset/connection', 'models/visualisation/element', 'views/element/d3/bubble'],
    function($, Dataset, Connection, Element, BubbleChartView) {

    describe('A bubble chart view', function() {

        beforeEach(function() {
            Connection.prototype.fetch = function() {};

            this.$el = $('<div style="width: 800px; height: 600px;"/>');

            this.dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02',
                    fields: [{
                        id: 'test04'
                    }, {
                        id: 'test05'
                    }]
                });
            this.dataset.reset();

            this.element = new Element({
                    id: 'test03',
                    dataset: this.dataset,
                    visualisation: this.dataset.visualisation,
                    type: 'bubble',
                    width: 1,
                    display: true,
                    dimensions: [{
                        field: {
                            id: 'test04'
                        }
                    }],
                    measure: {
                        id: 'test05'
                    },
                    label: 'Test Bubble Chart'
                });

            this.view = new BubbleChartView({
                    parent: this.$el,
                    model: this.element,
                    visualisation: this.dataset.visualisation
                });
        });

        it('should not render without data', function() {
            this.element.observations[0].set({
                test04: []
            }, {
                silent: true
            });
            this.element.dimensions[0].set({
                test04: {}
            }, {
                silent: true
            });
            this.view.render();

            expect(this.view.el).not.toContainElement('svg');
        });

        it('should render bubbles and labels correctly', function(done) {
            this.element.observations[0].set({
                test04: [
                    {
                        id: 'id01',
                        total: 1234000
                    },
                    {
                        id: 'id02',
                        total: 5678000
                    }
                ]
            }, {
                silent: true
            });
            this.element.dimensions[0].set({
                test04: {
                    id01: {
                        id: 'id01',
                        label: 'Test Label 01'
                    },
                    id02: {
                        id: 'id02',
                        label: 'Test Label 02'
                    }
                }
            }, {
                silent: true
            });
            this.view.render();

            expect(this.view.el).toContainElement('svg');
            expect(this.view.el).toContainElement('circle');
            expect(this.view.el).toContainElement('text.chartLabel');
            expect(this.view.el).toContainElement('text.scaleLabel');

            expect(this.view.$el.find('circle:not(.scaleBubble)').length).toEqual(2);
            expect(this.view.$el.find('text.chartLabel').length).toEqual(2);

            expect(this.view.el).toContainText('Test Bubble Chart');
            expect(this.view.el).toContainText('Test Label 01');
            expect(this.view.el).toContainText('Test Label 02');

            // Performance tests
            if (!window.__telemetry__) {
                done();
                return;
            }

            window.__telemetry__(function(results) {
                expect(results.load_time_ms).toBeLessThan(1000);
                expect(results.dom_content_loaded_time_ms).toBeLessThan(1000);
                expect(results.first_paint).toBeLessThan(1000);
                done();
            });
        });

    });

});