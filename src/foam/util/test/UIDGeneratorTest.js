/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.test',
  name: 'UIDGeneratorTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.util.UIDGenerator',
    'foam.util.AUIDGenerator',
    'foam.util.NUIDGenerator',
    'foam.util.UIDSupport',
    'java.util.HashSet',
    'static foam.util.UIDSupport.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // AUID tests
        var auidgen = new AUIDGenerator.Builder(x).setSalt("foobar").build();
        var hash    = mod("foobar");
        UIDGeneratorTest_GenerateVerifiableUniqueStringIDs(auidgen, hash);

        // NUID tests
        x = x.put("nuidDAO", new MDAO(DummyNuid.getOwnClassInfo()));
        var nuidgen = new NUIDGenerator(x, "nuidDAO", (DAO) x.get("nuidDAO"), DummyNuid.ID);
        var hash2   = mod("nuidDAO");
        UIDGeneratorTest_GenerateVerifiableUniqueLongIDs(x, nuidgen, hash2);

        // UIDs similarity tests
        UIDGeneratorTest_CheckGeneratedUIDsSimilarity(auidgen, 0, 32);
        UIDGeneratorTest_CheckGeneratedUIDsSimilarity(auidgen, 0x100, 32);
        UIDGeneratorTest_CheckGeneratedUIDsSimilarity(auidgen, 0x1000, 32);
        UIDGeneratorTest_CheckGeneratedUIDsSimilarity(auidgen, 0x10000, 32);
        UIDGeneratorTest_CheckGeneratedUIDsSimilarity(auidgen, 0x100000, 32);

        // AUID set minLength test
        UIDGeneratorTest_SetMinLength(auidgen, 18);
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
        var id = "";
        while ( verified && it.hasNext() ) {
          id = it.next();
          verified = hash == UIDSupport.hash(id);
        }
        test(verified, "Should generated unique string ids be verifiable" + (verified ? "" : ", but " + id + " failed verification"));
      `
    },
    {
      name: 'UIDGeneratorTest_GenerateVerifiableUniqueLongIDs',
      args: [ 'Context x', 'UIDGenerator uidgen', 'int hash' ],
      javaCode: `
        var n = 1000;
        var ids = new HashSet<Long>();
        var nuidDAO = (DAO) x.get("nuidDAO");
        for ( int i = 0; i < n; i++ ) {
          var dummy = new DummyNuid();
          dummy.setId(uidgen.getNextLong());
          if ( ! ids.add(dummy.getId()) ) {
            break;
          }
          nuidDAO.put(dummy);
        }
        test(n == ids.size(), "Should generate " + n + " unique long ids" + (n == ids.size() ? "" : ", but " + ids.size() + " were generated"));

        var verified = true;
        var it = ids.iterator();
        var id = 0L;
        while ( verified && it.hasNext() ) {
          id = it.next();
          verified = hash == UIDSupport.hash(id);
        }
        test(verified, "Should generated unique long ids be verifiable" + (verified ? "" : ", but " + id + " failed verification"));
      `
    },
    {
      name: 'calcSimilarityScore',
      type: 'Integer',
      args: [ 'String id1', 'String id2' ],
      javaCode: `
        var score = 0;
        var id1Arr = id1.toCharArray();
        var id2Arr = id2.toCharArray();
        var l = Math.min(id1Arr.length, id2Arr.length);
        var diff = 0;
        for ( var i = 0; i < l; i++ ) {
          if ( id1Arr[i] == id2Arr[i] ) {
            diff++;
          } else {
            if ( diff > 0 ) score += Math.pow(2, diff - 1);
            diff = 0;
          }
        }
        if ( diff > 0 ) {
          score += Math.pow(2, diff - 1);
        }
        return score;
      `
    },
    {
      name: 'UIDGeneratorTest_CheckGeneratedUIDsSimilarity',
      args: [ 'AUIDGenerator uidgen', 'int startSeqNo', 'int threshold' ],
      javaCode: `
        uidgen.setSeqNo(startSeqNo);
        uidgen.setLastSecondCalled(
          (System.currentTimeMillis() - AUIDGenerator.EPOCH) / 1000);

        var id1 = uidgen.getNextString();
        var id2 = uidgen.getNextString();
        var score = calcSimilarityScore(id1, id2);
        test(score <= threshold, "[startSeqNo: " + startSeqNo + "] Should not generated very similar unique ids [" + id1 + ", " + id2 + "].");
      `
    },
    {
      name: 'UIDGeneratorTest_SetMinLength',
      args: 'AUIDGenerator uidgen, Integer minLength',
      javaCode: `
        uidgen.setMinLength(minLength);
        var id = String.valueOf(uidgen.getNextString());
        test(id.length() >= minLength, "AUIDGenerator should generate id longer than minLength: " + minLength);
      `
    }
  ]
});
