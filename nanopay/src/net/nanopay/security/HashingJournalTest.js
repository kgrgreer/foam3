foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournalTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',

    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.util.UUID'
  ],

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `
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
        HashingJournal_ConstructWithDefaultValues_Initializes();
        HashingJournal_ConstructWithValidAlgorithm_Initializes();
        HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException();

        // put tests
        HashingJournal_Put_Succeeds();

        // replay tests
        HashingJournal_Replay_Succeeds();
        HashingJournal_ReplayJournalWithInvalidDigest_Exception();

      `
    },
    {
      name: 'HashingJournal_ConstructWithDefaultValues_Initializes',
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(getX()).build();
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
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(getX()).setAlgorithm("SHA-512").build();
        test("SHA-512".equals(journal.getAlgorithm()), "Algorithm is set to SHA-512");
      `
    },
    {
      name: 'HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException',
      javaCode: `
        try {
          HashingJournal journal = new HashingJournal.Builder(getX()).setAlgorithm("asdfasdf").build();
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
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          HashingJournal journal = new HashingJournal.Builder(getX())
            .setFile(file)
            .setDao(dao)
            .build();

          // put to journal
          journal.put(INPUT);

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
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          HashingJournal journal = new HashingJournal.Builder(getX())
            .setFile(file)
            .setDao(dao)
            .build();

          // put to journal
          journal.put(INPUT);

          // replay journal
          journal.replay(dao);

          // verify dao has one element
          Count count = (Count) dao.select(new Count());
          test(count.getValue() == 1L, "DAO following replay method should contain one element");

          // replaying again should not add another element to DAO
          journal.replay(dao);
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
      javaCode: `
        try {
          DAO dao = new MDAO(User.getOwnClassInfo());
          File file = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
          HashingJournal journal = new HashingJournal.Builder(getX())
            .setAlgorithm("SHA-1")
            .setFile(file)
            .setDao(dao)
            .build();

          // write entry with bad digest to journal
          try ( BufferedWriter writer = journal.getWriter() ) {
            writer.write(EXPECTED);
            writer.flush();
          }

          // replay journal
          journal.replay(dao);

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
