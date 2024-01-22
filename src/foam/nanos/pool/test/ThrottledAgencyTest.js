/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool.test',
  name: 'ThrottledAgencyTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.pool.ThrottledAgency',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        testThrottling(x, 1f,   10);
        testThrottling(x, 2f,   10);
        testThrottling(x, 1.5f, 10);
      `
    },
    {
      name: 'testThrottling',
      args: 'Context x, float rate, int count',
      javaCode: `
        var agency = new ThrottledAgency(x);
        agency.setRate(rate);
        agency.setName("testThrottling " + rate + " tps");

        try {
          agency.start();
        } catch (Exception e) {
          test(false, "ThrottledAgency start failed: " + e.getMessage());
        }


        // submit all jobs to the throttled agency
        long startTime = System.currentTimeMillis();
        for ( int i = 0 ; i < count ; i++ ) {
          agency.submit(x, (_x) -> {}, null);
        }

        // test all jobs should be throttled then executed
        test(agency.getQueued() == count, "ThrottledAgency(" + rate + " tps) queued expected: " + count + ", actual: " + agency.getQueued());
        for ( int j = 0; j < count; j++ ) {
          long max = (long) (1 + rate * j);
          long actual = agency.getExecuted();
          long elapsed = System.currentTimeMillis() - startTime;

          test(agency.getExecuted() <= max, elapsed + " ms: ThrottledAgency executed <= " + max + ", actual: " + agency.getExecuted());

          if ( actual == count ) break;

          try { Thread.sleep(1000); } catch (InterruptedException e) { }
        }
      `
    }
  ]
});
