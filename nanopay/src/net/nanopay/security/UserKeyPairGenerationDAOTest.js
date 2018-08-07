foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserKeyPairGenerationDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    // 'nanopay.security.UserKeyPairGenerationDAO',
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
    // {
    //   type: 'String',
    //   name: 'EXPECTED',
    //   documentation: 'Expected journal output',
    //   value: 'p({"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"},{"algorithm":"SHA-256","digest":"1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5"})'
    // }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // construct tests
        UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm();
        // UserKeyPairGenerationDAO_KeysUseProvidedKeySize();
        // UserKeyPairGenerationDAO_PrivateKeyEncrypted();
        // UserKeyPairGenerationDAO_PublicKeyBase64Encrypted();

        // put tests
        // UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair();
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm',
      javaCode: `
      DAO UserKeyPairDAO = new net.nanopay.security.UserKeyPairGenerationDAO.Builder(getX()).build();
      System.err.print(UserKeyPairDAO);
      UserKeyPairDAO.put_(getX(), INPUT);
      // foam.core.FObject resp = UserKeyPairDAO.put_(getX(), INPUT);
      test( false, "DJs First test Message!" );


      /*
      So we want to test that the key uses the algorithm we provided.

      So we will first have to construct the DAO,
          How do we construct the DAO? It doesn't exist in the context, because
          it is not being made. So maybe we gotta construct a whole instance in here.
          Okay, lets do that..
      then put to it,
      then get the key generated, 
      then examine the algorithm used to generate that key.

      */



      // DAO UserKeyPairDAO = new net.nanopay.security.UserKeyPairGenerationDAO.Builder(getX()).build();
      // test( UserK)
        // HashingJournal journal = new HashingJournal.Builder(getX()).build();
        // test("SHA-256".equals(journal.getAlgorithm()), "Algorithm is set to SHA-256 by default");
        // test(! journal.getDigestRequired(), "Digest required is set to false by default");
        // test(! journal.getRollDigests(), "Roll digests is set to false by default");
        // test(journal.getPreviousDigest() == null, "Previous digest is empty by default");
        // test(journal.getOutputter() instanceof HashingOutputter, "Outputter is an instance of HashingOutputter");
        // test(journal.getParser() instanceof HashedJSONParser, "Parser is an instance of HashedJSONParser");
      `
    },

  ]
});
