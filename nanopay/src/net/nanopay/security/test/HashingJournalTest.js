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
      type: 'String',
      name: 'EXPECTED',
      documentation: 'Expected journal output',
      value: 'p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"},{"algorithm":"SHA-256","digest":"1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5"})'
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
        HashingJournal_ReplayJournalWithInvalidDigest_Exception(x);

      `
    },
    {
      name: 'HashingJournal_ConstructWithDefaultValues_Initializes',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(x).build();
        test("SHA-256".equals(journal.getAlgorithm()), "Algorithm is set to SHA-256 by default");
        test(! journal.getDigestRequired(), "Digest required is set to false by default");
        test(! journal.getRollDigests(), "Roll digests is set to false by default");
        test(journal.getPreviousDigest() == null, "Previous digest is empty by default");
        test(journal.getOutputter() instanceof HashingOutputter, "Outputter is an instance of HashingOutputter");
        test(journal.getParser() instanceof HashedJSONParser, "Parser is an instance of HashedJSONParser");
      `
    },
    {
      name: 'HashingJournal_ConstructWithValidAlgorithm_Initializes',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(x).setAlgorithm("SHA-512").build();
        test("SHA-512".equals(journal.getAlgorithm()), "Algorithm is set to SHA-512");
      `
    },
    {
      name: 'HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        try {
          HashingJournal journal = new HashingJournal.Builder(x).setAlgorithm("asdfasdf").build();
          test("asdfasdf".equals(journal.getAlgorithm()), "Algorithm is set to asdfasdf");
          journal.getOutputter();
          test(false, "Outputter factory should throw an exception given invalid algorithm");
        } catch ( Throwable t ) {
          test(true, "Outputter factory throws exception given invalid algorithm");
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
            .build();

          // put to journal
          journal.put(x, INPUT);

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
            .setDao(dao)
            .build();

          // put to journal
          journal.put(x, INPUT);

          // replay journal
          journal.replay(x, dao);

          // verify dao has one element
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 1L, "DAO following replay method should contain one element");

          // replaying again should not add another element to DAO
          journal.replay(x, dao);
          count = (Count) dao.select(new Count());
          test(count.getValue() == 1L, "Replaying journal again should not add another element to DAO");

          // verify object stored in DAO matches input
          User result = (User) dao.find(1000);
          test(1000 == result.getId(), "Stored user id matches 1000");
          test("Kirk".equals(result.getFirstName()), "Stored user first name matches \\"Kirk\\"");
          test("Eaton".equals(result.getLastName()), "Stored user last name matches \\"Eaton\\"");
          test("kirk@nanopay.net".equals(result.getEmail()), "Stored user email matches \\"kirk@nanopay.net\\"");
        } catch ( Throwable t ) {
          test(false, "HashingJournal replay method should not throw an exception");
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
            .setDao(dao)
            .build();

          // write entry with bad digest to journal
          try ( BufferedWriter writer = journal.getWriter() ) {
            writer.write(EXPECTED);
            writer.flush();
          }

          // replay journal
          journal.replay(x, dao);

          // dao should not contain invalid entry
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 0L, "Replaying a journal with an invalid entry should not add an element to the DAO");
        } catch ( Throwable t ) {
          test(false, "HashingJournal replay method should not throw an exception");
        }
      `
    }
  ]
});
