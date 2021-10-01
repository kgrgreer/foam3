/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.bench.BenchmarkRunner',
  targetModel: 'foam.nanos.bench.BenchmarkResult',
  forwardName: 'benchmarkResults',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    section: 'benchmarkResultsSection',
    createVisibility: 'HIDDEN',
    updateVisibility: 'RO',
    readVisibility: 'RO',
    tableCellFormatter: function(value, obj, axiom) {
      var dao = this.__subSubContext__[foam.String.daoize(this.type)];
      if ( dao ) {
        dao
        .find(value)
        .then((entry) => this.add(entry.id))
        .catch((error) => {
          this.add(value);
        });
      }
    }
  },
  targetProperty: {
    label: 'Benchmark Runner Id',
    visibility: 'HIDDEN',
    tableWidth: 300,
    // javaPostSet: `
    //   setBenchmarkRunnerId(val);
    // `
  }
});
