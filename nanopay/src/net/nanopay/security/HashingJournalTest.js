foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournalTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.util.SafetyUtil',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        HashingJournal_ConstructWithDefaultValues_Initializes();
        HashingJournal_ConstructWithValidAlgorithm_Initializes();
        HashingJournal_ConstructWithInvalidAlgorithm_RuntimeException();
      `
    },
    {
      name: 'HashingJournal_ConstructWithDefaultValues_Initializes',
      javaCode: `
        HashingJournal journal = new HashingJournal.Builder(getX()).build();
        test("SHA-256".equals(journal.getAlgorithm()), "Algorithm is set to SHA-256 by default");
        test(! journal.getDigestRequired(), "Digest required is set to false by default");
        test(! journal.getRollDigests(), "Roll digests is set to false by default");
        test(SafetyUtil.isEmpty(journal.getPreviousDigest()), "Previous digest is empty by default");
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
    }
  ]
});
