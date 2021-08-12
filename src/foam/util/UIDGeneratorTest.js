/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'UIDGeneratorTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.util.HashSet'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var uidgen = new UIDGenerator.Builder(x).setSalt("foobar").build();
        var hash   = UIDSupport.getInstance().mod("foobar");
        UIDGeneratorTest_GenerateVerifiableUniqueStringIDs(uidgen, hash);
        UIDGeneratorTest_GenerateVerifiableUniqueLongIDs(uidgen, hash);
      `
    },
    {
      name: 'UIDGeneratorTest_GenerateVerifiableUniqueStringIDs',
      args: [ 'UIDGenerator uidgen', 'int hash' ],
      javaCode: `
        var n = 1000;
        var ids = new HashSet<String>();
        for ( int i = 0; i < n; i++ ) {
          ids.add(uidgen.getNextString());
        }
        test(n == ids.size(), "Should generate " + n + " unique string ids");

        var verified = true;
        var it = ids.iterator();
        var support = UIDSupport.getInstance();
        var id = "";
        while ( verified && it.hasNext() ) {
          id = it.next();
          verified = hash == support.hash(id);
        }
        test(verified, "Should generated unique string ids be verifiable" + (verified ? "" : ", but " + id + " failed verification"));
      `
    },
    {
      name: 'UIDGeneratorTest_GenerateVerifiableUniqueLongIDs',
      args: [ 'UIDGenerator uidgen', 'int hash' ],
      javaCode: `
        var n = 1000;
        var ids = new HashSet<Long>();
        for ( int i = 0; i < n; i++ ) {
          ids.add(uidgen.getNextLong());
        }
        test(n == ids.size(), "Should generate " + n + " unique long ids");

        var verified = true;
        var it = ids.iterator();
        var support = UIDSupport.getInstance();
        var id = 0L;
        while ( verified && it.hasNext() ) {
          id = it.next();
          verified = hash == support.hash(id);
        }
        test(verified, "Should generated unique string ids be verifiable" + (verified ? "" : ", but " + id + " failed verification"));
      `
    }
  ]
});
