/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'HashingJournalTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.security.HashedJSONParser',
    'net.nanopay.security.HashingJournal',
    'net.nanopay.security.HashingOutputter',
    'net.nanopay.security.MessageDigest',
    'foam.core.X',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.util.UUID'
  ],

  constants: [
    {
      type: 'foam.nanos.auth.User',
      name: 'INPUT',
      documentation: 'Original input',
      javaValue: `
        new User.Builder(EmptyX.instance())
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build()
      `
    },
    {
      type: 'foam.nanos.auth.User',
      name: 'INPUT2',
      documentation: 'Original input',
      javaValue: `
        new User.Builder(EmptyX.instance())
          .setId(1001)
          .setFirstName("tom")
          .setLastName("keen")
          .setEmail("tom@nanopay.net")
          .build()
      `
    },
    {
      type: 'foam.nanos.auth.User',
      name: 'INPUT3',
      documentation: 'Original input',
      javaValue: `
        new User.Builder(EmptyX.instance())
          .setId(1002)
          .setFirstName("raymond")
          .setLastName("reddington")
          .setEmail("raymond@nanopay.net")
          .build()
      `
    },
    {
      type: 'String',
      name: 'EXPECTED',
      documentation: 'Expected journal output',
      value: 'p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"},{algorithm:"SHA-256",provider:"",digest:"1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5"})'
    },
    {
      type: 'String',
      name: 'INVALID',
      documentation: 'Expected journal output',
      value: 'p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"},{algorithm:"SHA-256",provider:"",digest:"1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11barandom"})'
    }
  ],

  properties: [
    {
      name: 'quoteKeys',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // construct tests
        HashingJournal_ConstructWithDefaultValues_Initializes(x);
        HashingJournal_ConstructWithValidAlgorithm_Initializes(x);
        HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException(x);

        // put tests
        HashingJournal_Put_Succeeds(x);

        // replay tests
        HashingJournal_Replay_Succeeds(x);
        HashingJournal_ReplayWithChaining_Succeeds(x);
        HashingJournal_ReplayJournalWithInvalidDigest_Exception(x);

      `
    },
    {
      name: 'HashingJournal_ConstructWithDefaultValues_Initializes',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(x).setQuoteKeys(getQuoteKeys()).build();
        MessageDigest digest = new MessageDigest.Builder(x).build();
        test("SHA-256".equals(digest.getAlgorithm()), "Algorithm is set to SHA-256 by default");
        test(journal.getDigestRequired(), "Digest required is set to true by default");
        test(digest.getRollDigests(), "Roll digests is set to false by true");
        test(digest.getPreviousDigest() == null, "Previous digest is empty by default");
      `
    },
    {
      name: 'HashingJournal_ConstructWithValidAlgorithm_Initializes',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        MessageDigest md = new MessageDigest.Builder(x).setAlgorithm("SHA-512").build();
        test("SHA-512".equals(md.getAlgorithm()), "Algorithm is set to SHA-512");
      `
    },
    {
      name: 'HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          MessageDigest md = new MessageDigest.Builder(x).setAlgorithm("asdfasdf").build();
          test(false, "Constructor should throw an exception given invalid algorithm");
        } catch ( Throwable t ) {
          test(true, "Constructor throws exception given invalid algorithm");
        }
      `
    },
    {
      name: 'HashingJournal_Put_Succeeds',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          X storageX = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));
          HashingJournal journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setDao(dao)
            .setQuoteKeys(getQuoteKeys())
            .build();

          // put to journal
          journal.put(x, null, dao, INPUT);

          // read the line just put
          boolean succeeds = false;
          try ( BufferedReader reader = journal.getReader() ) {
            for ( String line ; ( line = reader.readLine() ) != null ; ) {
              if ( EXPECTED.equals(line.trim()) ) {
                succeeds = true;
                break;
              }
            }
          }

          test(succeeds, "HashingJournal put method produces correct output");
        } catch ( Throwable t ) {
          test(false, "HashingJournal put method should not throw an exception");
        }
      `
    },
    {
      name: 'HashingJournal_Replay_Succeeds',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          X storageX = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));
          HashingJournal journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setQuoteKeys(getQuoteKeys())
            .setDao(dao)
            .build();

          // put to journal
          journal.put(x, null, dao, INPUT);

          // replay journal
          journal.reset();
          journal.replay(x, dao);

          // verify dao has one element
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 1L, "DAO following replay method should contain one element");

          // verify object stored in DAO matches input
          User result = (User) dao.find(1000l);
          test(1000 == result.getId(), "Stored user id matches 1000");
          test("Kirk".equals(result.getFirstName()), "Stored user first name matches \\"Kirk\\"");
          test("Eaton".equals(result.getLastName()), "Stored user last name matches \\"Eaton\\"");
          test("kirk@nanopay.net".equals(result.getEmail()), "Stored user email matches \\"kirk@nanopay.net\\"");
        } catch ( Throwable t ) {
          System.err.println("HashingJournal replay should not throw an exception.");
          t.printStackTrace();
          test(false, "HashingJournal replay should not throw an exception. "+t.getMessage());
        }
      `
    },
    {
      name: 'HashingJournal_ReplayWithChaining_Succeeds',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          X storageX = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));
          HashingJournal journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setQuoteKeys(getQuoteKeys())
            .setDao(dao)
            .build();

          // put to journal
          journal.put(x, null, dao, INPUT);
          journal.put(x, null, dao, INPUT2);
          journal.put(x, null, dao, INPUT3);

          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 3L, "DAO following put method should contain three element");

          dao = new MDAO(User.getOwnClassInfo());
          journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setQuoteKeys(getQuoteKeys())
            .setDao(dao)
            .build();

          // replay journal
          journal.replay(x, dao);

          count = (Count) dao.select(new Count());
          test(count.getValue() == 3L, "DAO following replay method should contain three element");

          // verify object stored in DAO matches input
          User result = (User) dao.find(1000l);
          test(1000 == result.getId(), "Stored user id matches 1000");
          test("Kirk".equals(result.getFirstName()), "Stored user first name matches \\"Kirk\\"");
          test("Eaton".equals(result.getLastName()), "Stored user last name matches \\"Eaton\\"");
          test("kirk@nanopay.net".equals(result.getEmail()), "Stored user email matches \\"kirk@nanopay.net\\"");
          result = (User) dao.find(1001l);
          test(1001 == result.getId(), "Stored user id matches 1001");
        } catch ( Throwable t ) {
          System.err.println("HashingJournal replay with chaining method should not throw an exception");
          t.printStackTrace();
          test(false, "HashingJournal replay with chaining method should not throw an exception. "+t.getMessage());
        }
      `
    },
    {
      name: 'HashingJournal_ReplayJournalWithInvalidDigest_Exception',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          X storageX = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));
          HashingJournal journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setQuoteKeys(getQuoteKeys())
            .setDao(dao)
            .build();

          // write entry with bad digest to journal
          try ( BufferedWriter writer = journal.getWriter() ) {
            writer.write(INVALID);
            writer.flush();
          }

          // replay journal
          journal.reset();
          journal.replay(x, dao);

          // dao should not contain invalid entry
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 0L, "Replaying a journal with an invalid entry should not add an element to the DAO");
        } catch ( Throwable t ) {
          test(true, "HashingJournal replay with invalid digest should throw an exception");
        }
      `
    },
    {
      name: 'HashingJournal_ReplayJournalWithInvalidDigestAndDigestNotRequired_Exception',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          X storageX = x.put(foam.nanos.fs.Storage.class, new foam.nanos.fs.FileSystemStorage(file.getParent()));
          HashingJournal journal = new HashingJournal.Builder(storageX)
            .setFilename(file.getName())
            .setQuoteKeys(getQuoteKeys())
            .setDigestRequired(false)
            .setDao(dao)
            .build();

          // write entry with bad digest to journal
          try ( BufferedWriter writer = journal.getWriter() ) {
            writer.write(INVALID);
            writer.flush();
          }

          // replay journal
          journal.reset();
          journal.replay(x, dao);

          // dao should not contain invalid entry
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 0L, "Replaying a journal with an invalid entry should not add an element to the DAO");
        } catch ( Throwable t ) {
          test(false, "HashingJournal replay with invalid digest and digest not required should not throw an exception. "+t.getMessage());
          t.printStackTrace();
        }
      `
    }
  ]
});
