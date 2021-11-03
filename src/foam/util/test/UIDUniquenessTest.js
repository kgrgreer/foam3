/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.test',
  name: 'UIDUniquenessTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.X',
    'foam.util.UIDGenerator',
    'java.io.IOException',
    'java.util.Collections',
    'java.util.concurrent.CountDownLatch',
    'java.util.HashSet'
  ],

  properties: [
    {
      class: 'Int',
      name: 'size',
      value: 100000
    },
    {
      name: 'isDuplicate',
      class: 'Boolean',
      value: false
    },
    {
      name: 'isNotDuplicate',
      class: 'Boolean',
      value: false
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
      args: 'Context x, boolean isDifferent, boolean isDuplicate, boolean isNotDuplicate',
      documentation: 'Create two threads and add uids to each set',
      javaCode: `
        // To store unique ids into a set in the 1st thread.
        var uids = Collections.synchronizedSet(new HashSet());
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
                    uids.add(uid);
                  } else if ( tno == 1 ) {
                    if ( ! isDuplicate && uids.contains(uid) ) {
                      setIsDuplicate(true);
                      break;
                    } else if ( ! isNotDuplicate && ! uids.contains(uid) ) {
                      setIsNotDuplicate(true);
                      break;
                    }
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
        setIsNotDuplicate(true);
        addUids(x, isDifferent, getIsDuplicate(), getIsNotDuplicate());
        test(getIsDuplicate(), (getIsDuplicate() ? "A Duplicate Found" : "Duplicates Not Found"));
      `
    },
    {
      name: 'UIDUniquenessTest_UIDDuplicateNotFoundTest',
      args: 'Context x, boolean isDifferent',
      javaCode: `
        setIsDuplicate(true);
        addUids(x, isDifferent, getIsDuplicate(), getIsNotDuplicate());
        test(getIsNotDuplicate(), (getIsNotDuplicate() ? "No duplicate Found" : "Duplicates Found"));
      `
    }
  ]
});
