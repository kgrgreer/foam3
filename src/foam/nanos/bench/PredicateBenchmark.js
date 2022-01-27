/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'PredicateBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  documentation: `Test predicates as a benchmark.`,

  javaImports: [
    'foam.nanos.test.Test',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'expected',
      class: 'Boolean',
      documentation: 'expected outcome'
    },
    {
      name: 'predicate',
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      documentation: 'predicate to be tested'
    },
    {
      name: 'testObject',
      class: 'FObjectProperty',
      of: 'FObject',
      documentation: 'list of objects to test against predicate'
    }BenchmarkRunner
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
        if ( ! ( getPredicate().f(getTestObject()) == getExpected() ) ) {
          //nop maybe log
        }
      `
    }
  ]
});
