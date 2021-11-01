/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'TwoUIDGeneratorTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.X',
    'foam.util.UIDGenerator',
    'java.io.IOException',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashSet',
    'java.util.Set'
  ],

  properties: [
    {
      class: 'Int',
      name: 'size',
      value: 100000
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var uids1 = new HashSet<String>();
        var uids2 = new HashSet<String>();
        TwoUIDGeneratorTest_UIDDuplicateFoundTest(x, uids1, uids2);
        TwoUIDGeneratorTest_UIDDuplicateNotFoundTest(x, uids1, uids2);
      `
    },
    {
      name: 'addUids',
      args: 'Context x, HashSet<String> uids1, HashSet<String> uids2',
      documentation: 'Create two threads and add uids to each set',
      javaCode: `
        var numOfThread = 2;
        final CountDownLatch latch = new CountDownLatch(numOfThread);
        for ( int i = 0; i < numOfThread; i++ ) {
          final int tno = i;
          Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
              int n = getSize();
              try {
                for ( int j = 0; j < n; j++ ) {
                  var uidGenerator = new UIDGenerator.Builder(x).setSalt("foobar").build();
                  String uid = uidGenerator.generate();
                  if ( tno == 0 ) {
                    uids1.add(uid);
                  } else if ( tno == 1 ) {
                    uids2.add(uid);
                  }
                }
              } catch (Throwable t) {
                throw new RuntimeException(t);
              }
              // Count down the latch when finished
              latch.countDown();
            }
          });
          thread.start();
        }

        // Wait until latch reaches 0
        try {
          latch.await();
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
      `
    },
    {
      name: 'TwoUIDGeneratorTest_UIDDuplicateFoundTest',
      args: 'Context x, HashSet<String> uids1, HashSet<String> uids2',
      javaCode: `
        addUids(x, uids1, uids2);

        // TODO: compare each machine Id of the uids1 and uids2 (if same)
        var isDuplicated = false;
        if ( uids1.size() == uids2.size() ) {
          for ( var uid : uids1 ) {
            if ( uids2.contains(uid) ) {
              isDuplicated = true;
              break;
            }
          }
        }
        test(isDuplicated, (isDuplicated ? "Passed: A Duplicate Found" : "Failed: A Duplicate Not Found"));
      `
    },
    {
      name: 'TwoUIDGeneratorTest_UIDDuplicateNotFoundTest',
      args: 'Context x, HashSet<String> uids1, HashSet<String> uids2',
      javaCode: `
        addUids(x, uids1, uids2);
        // TODO: compare each machine Id of the uids1 and uids2 (if different)
        var isNotDuplicated = false;
        if ( uids1.size() == uids2.size() ) {
          for ( var uid : uids1 ) {
            if ( ! uids2.contains(uid) ) {
              isNotDuplicated = true;
              break;
            }
          }
        }
        test(isNotDuplicated, (isNotDuplicated ? "Passed: No Duplicate Found" : "Failed: A Duplicate Found"));
      `
    }
  ]
});
