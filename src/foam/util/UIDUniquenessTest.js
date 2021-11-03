/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'UIDUniquenessTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.X',
    'foam.util.UIDGenerator',
    'java.io.IOException',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashSet'
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
        /*
          Test case 1:
          When machine Id is same(isDifferent = false),
          the test passes if a duplicate is found.
        */
        UIDUniquenessTest_UIDDuplicateFoundTest(x, false);

        /*
          Test case 2:
          When machine Id is different(isDifferent = true),
          the test passes if no duplicate is found.
        */
        UIDUniquenessTest_UIDDuplicateNotFoundTest(x, true);
      `
    },
    {
      name: 'addUids',
      args: 'Context x, HashSet<String> uids1, HashSet<String> uids2, boolean isDifferent',
      documentation: 'Create two threads and add uids to each set',
      javaCode: `
        var numOfThread = 2;
        final CountDownLatch latch = new CountDownLatch(numOfThread);

        for ( int i = 0; i < numOfThread; i++ ) {
          final int tno = i;
          Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
              var uidGenerator = new UIDGenerator.Builder(x).setSalt("foobar").build();
              if ( isDifferent ) {
                uidGenerator.setMachineId(uidGenerator.getMachineId() + tno);
              }
              try {
                for ( int j = 0; j < getSize(); j++ ) {
                  String uid = uidGenerator.getNextString();
                  // Add a unique id into a set according to tno.
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
      name: 'UIDUniquenessTest_UIDDuplicateFoundTest',
      args: 'Context x, boolean isDifferent',
      javaCode: `
        // To store unique ids
        var uids1 = new HashSet<String>();
        var uids2 = new HashSet<String>();
        addUids(x, uids1, uids2, isDifferent);

        var isDuplicated = false;
        if ( uids1.size() == uids2.size() ) {
          for ( var uid : uids1 ) {
            if ( uids2.contains(uid) ) {
              isDuplicated = true;
              break;
            }
          }
        }
        test(isDuplicated, (isDuplicated ? "A Duplicate Found" : "Duplicates Not Found"));
      `
    },
    {
      name: 'UIDUniquenessTest_UIDDuplicateNotFoundTest',
      args: 'Context x, boolean isDifferent',
      javaCode: `
        // To store unique ids
        var uids1 = new HashSet<String>();
        var uids2 = new HashSet<String>();
        addUids(x, uids1, uids2, isDifferent);

        var isNotDuplicated = false;
        if ( uids1.size() == uids2.size() ) {
          for ( var uid : uids1 ) {
            if ( ! uids2.contains(uid) ) {
              isNotDuplicated = true;
              break;
            }
          }
        }
        test(isNotDuplicated, (isNotDuplicated ? "No duplicate Found" : "Duplicates Found"));
      `
    }
  ]
});
