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
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'Map',
      name: 'uids1',
      documentation: 'Store UIDGenerator.',
      javaType: 'Map<Integer, UIDGenerator>',
      javaFactory: `
        return new HashMap<Integer, UIDGenerator>();
      `
    },
    {
      class: 'Map',
      name: 'uids2',
      documentation: 'Store UIDGenerator.',
      javaType: 'Map<Integer, UIDGenerator>',
      javaFactory: `
        return new HashMap<Integer, UIDGenerator>();
      `
    },
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
        TwoUIDGeneratorTest_MachineIDDuplicateFoundTest(x);
        TwoUIDGeneratorTest_MachineIDDuplicateNotFoundTest(x);
      `
    },
    {
      name: 'TwoUIDGeneratorTest_MachineIDDuplicateFoundTest',
      args: 'Context x',
      javaCode: `
        Map<Integer, UIDGenerator> uids1 = ( Map<Integer, UIDGenerator> ) getUids1();
        Map<Integer, UIDGenerator> uids2 = ( Map<Integer, UIDGenerator> ) getUids2();

        Thread t1 = new Thread(new Runnable() {
          public void run() {
            int n = getSize();
            try {
              for ( int i = 0; i < n; i++ ) {
                var uid = new UIDGenerator.Builder(x).setSalt("foobar").build();
                uids1.put(Integer.valueOf(i + 1), uid);
              }
            } catch (Throwable t) {
              throw new RuntimeException(t);
            }
          }
        });
        t1.start();

        Thread t2 = new Thread(new Runnable() {
          public void run() {
            int n = getSize();
            try {
              for ( int i = 0; i < n; i++ ) {
                var uid = new UIDGenerator.Builder(x).setSalt("foobar").build();
                uids2.put(Integer.valueOf(i + 1), uid);
              }
            } catch (Throwable t) {
              throw new RuntimeException(t);
            }
          }
        });
        t2.start();

        var isDuplicated = false;
        var it1 = uids1.entrySet().iterator();
        var it2 = uids2.entrySet().iterator();
        while ( it1.hasNext() && it2.hasNext() ) {
          // Get each machine ID from two UIdGenerator objs
          Map.Entry uid1 = (Map.Entry)it1.next();
          int mid1 = ((UIDGenerator) uid1.getValue()).getMachineId();

          Map.Entry uid2 = (Map.Entry) it2.next();
          int mid2 = ((UIDGenerator) uid2.getValue()).getMachineId();

          // Compare two machine IDs from each map (uids1, uids2)
          isDuplicated = mid1 == mid2 ? true : false;
          if ( isDuplicated )  break;
        }

        test(isDuplicated, (isDuplicated ? "Passed: A Duplicate Found" : "Failed: A Duplicate Not Found"));
      `
    },
    {
      name: 'TwoUIDGeneratorTest_MachineIDDuplicateNotFoundTest',
      args: 'Context x',
      javaCode: `
        Map<Integer, UIDGenerator> uids1 = ( Map<Integer, UIDGenerator> ) getUids1();
        Map<Integer, UIDGenerator> uids2 = ( Map<Integer, UIDGenerator> ) getUids2();

        Thread t1 = new Thread(new Runnable() {
          public void run() {
            int n = getSize();
            try {
              for ( int i = 0; i < n; i++ ) {
                var uid = new UIDGenerator.Builder(x).setSalt("foobar").build();
                uids1.put(Integer.valueOf(i + 1), uid);
              }
            } catch (Throwable t) {
              throw new RuntimeException(t);
            }
          }
        });
        t1.start();

        Thread t2 = new Thread(new Runnable() {
          int n = getSize();
          public void run() {
            try {
              for ( int i = 0; i < n; i++ ) {
                var uid = new UIDGenerator.Builder(x).setSalt("foobar").build();
                uids2.put(Integer.valueOf(i + 1), uid);
              }
            } catch (Throwable t) {
              throw new RuntimeException(t);
            }
          }
        });
        t2.start();

        var isNotDuplicated = false;
        var it1 = uids1.entrySet().iterator();
        var it2 = uids2.entrySet().iterator();
        while ( it1.hasNext() && it2.hasNext() ) {
          // Get each machine ID from two UIdGenerator objs
          Map.Entry uid1 = (Map.Entry) it1.next();
          int mid1 = ((UIDGenerator) uid1.getValue()).getMachineId();

          Map.Entry uid2 = (Map.Entry) it2.next();
          int mid2 = ((UIDGenerator) uid2.getValue()).getMachineId();

          // Compare two machine IDs from each map (uids1, uids2)
          isNotDuplicated = mid1 != mid2 ? true : false;
          if ( isNotDuplicated )  break;
        }

        test(isNotDuplicated, (isNotDuplicated ? "Passed: No Duplicate Found" : "Failed: A Duplicate Found"));
      `
    }
  ]
});
