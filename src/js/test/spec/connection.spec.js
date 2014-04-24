require(['models/dataset', 'models/dataset/connection'], function(Dataset, Connection) {

    describe('A connection model', function() {

        var dataset;

        beforeEach(function() {
            // Create a new dataset model
            dataset = new Dataset({
                    id: 'test01',
                    visualisation_id: 'test02'
                });

            // Don't make HTTP requests
            Connection.prototype.fetch = function() {};
        });

        it('should construct API URLs correctly for dimensions', function() {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test03',
                    measure: 'test04',
                    aggregation: 'sum'
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test03?aggregation=sum&measure=test04');
        });

        it('should construct API URLs correctly for dimensions with a cut', function() {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test04',
                    measure: 'test05',
                    aggregation: 'sum',
                    cut: {
                        test06: 'test07'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test04?test06=test07&aggregation=sum&measure=test05');
        });

        it('should construct API URLs correctly for observations', function() {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'observations',
                    dimension: 'test08',
                    measure: 'test09',
                    aggregation: 'sum'
                });
            expect(conn.url()).toEqual('/api/datasets/test01/observations/test08?aggregation=sum&measure=test09');
        });

        it('should construct API URLs correctly for observations with a cut', function() {
            var conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test10',
                    measure: 'test11',
                    aggregation: 'sum',
                    cut: {
                        test12: 'test13'
                    }
                });
            expect(conn.url()).toEqual('/api/datasets/test01/dimensions/test10?test12=test13&aggregation=sum&measure=test11');
        });

        it('should return dimension values correctly', function() {
            var data = {
                    id01: {
                        id: 'id01',
                        label: 'Test Label 01'
                    },
                    id02: {
                        id: 'id02',
                        label: 'Test Label 02'
                    }
                },
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test14',
                    measure: 'test15',
                    aggregation: 'sum',
                    test14: data
                });
            for (var key in data) {
                expect(conn.getValue(key)).toBe(data[key]);
            }
        });

        it('should return observations correctly', function() {
            var data = [
                    {
                        id: 'id01',
                        total: 23483
                    },
                    {
                        id: 'id02',
                        total: 8394.3204
                    }
                ],
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test16',
                    measure: 'test17',
                    aggregation: 'sum',
                    test16: data
                });
            for (var i = 0; i < data.length; i++) {
                expect(conn.getValue(i)).toBe(data[i]);
            }
        });

        it('should sum a total of observations correctly', function() {
            var data = [
                    {
                        id: 'id01',
                        total: 1000
                    },
                    {
                        id: 'id02',
                        total: 999.99
                    },
                    {
                        id: 'id02',
                        total: 0.01
                    }
                ],
                conn = new Connection({
                    dataset: dataset,
                    type: 'dimensions',
                    dimension: 'test18',
                    measure: 'test19',
                    aggregation: 'sum',
                    test18: data
                });
            expect(conn.getTotal()).toBe(2000.0);
        });

    });

});