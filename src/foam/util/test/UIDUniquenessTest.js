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
    'foam.util.UIDGenerator',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.concurrent.atomic.AtomicBoolean'
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
        UIDUniquenessTest_No_duplicate_on_same_instance(x);
        UIDUniquenessTest_Could_generate_duplicate_on_instances_with_same_machineId(x);
        UIDUniquenessTest_No_duplicate_on_instances_with_different_machineId(x);
      `
    },
    {
      name: 'testDuplicateFound',
      args: [ 'Boolean expected', 'String message', 'UIDGenerator... uidGenerators' ],
      javaCode: `
        var uids = new ConcurrentHashMap<String, String>();
        var duplicateFound = new AtomicBoolean(false);
        var error = new AtomicBoolean(false);
        var threads = new Thread[uidGenerators.length];
        for ( var i = 0; i < uidGenerators.length; i++ ) {
          var uidgen = uidGenerators[i];
          threads[i] = new Thread(() -> {
            try {
              for ( var j = 0; j < getSize(); j++ ) {
                if ( duplicateFound.get() ) return;
                var uid = uidgen.getNextString();
                if ( ! uids.containsKey(uid) ) {
                  uids.put(uid, uid);
                } else {
                  duplicateFound.set(true);
                }
              }
            } catch ( Exception e ) {
              error.set(true);
            }
          });
          threads[i].start();
        }

        // Join threads
        for ( var t : threads ) {
          try { t.join(); } catch ( InterruptedException e ) { /* Ignored */ }
        }
        if ( error.get() ) {
          test(false, "Failed to generate UID");
        } else {
          test(duplicateFound.get() == expected, message);
        }
      `
    },
    {
      name: 'UIDUniquenessTest_No_duplicate_on_same_instance',
      args: [ 'Context x' ],
      javaCode: `
        var uidgen = new UIDGenerator.Builder(x).setMachineId(1).build();
        testDuplicateFound(false, "Should not generate duplicate uid on the same instance.", uidgen, uidgen, uidgen, uidgen);
      `
    },
    {
      name: 'UIDUniquenessTest_Could_generate_duplicate_on_instances_with_same_machineId',
      args: [ 'Context x' ],
      javaCode: `
        var uidgen1 = new UIDGenerator.Builder(x).setMachineId(1).build();
        var uidgen2 = new UIDGenerator.Builder(x).setMachineId(1).build();
        var uidgen3 = new UIDGenerator.Builder(x).setMachineId(1).build();
        var uidgen4 = new UIDGenerator.Builder(x).setMachineId(1).build();
        testDuplicateFound(true, "Could generate duplicate uid on instances with the same machine id.", uidgen1, uidgen2, uidgen3, uidgen4);
      `
    },
    {
      name: 'UIDUniquenessTest_No_duplicate_on_instances_with_different_machineId',
      args: [ 'Context x' ],
      javaCode: `
        var uidgen1 = new UIDGenerator.Builder(x).setMachineId(1).build();
        var uidgen2 = new UIDGenerator.Builder(x).setMachineId(2).build();
        var uidgen3 = new UIDGenerator.Builder(x).setMachineId(3).build();
        var uidgen4 = new UIDGenerator.Builder(x).setMachineId(4).build();
        testDuplicateFound(false, "Should not generate duplicate uid on instances with the different machine id.", uidgen1, uidgen2, uidgen3, uidgen4);
      `
    }
  ]
});
