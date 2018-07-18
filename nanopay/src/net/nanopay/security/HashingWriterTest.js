foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingWriterTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.io.StringWriter',
    'java.security.NoSuchAlgorithmException'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // constructor tests
        HashingWriter_ConstructWithDefaultAlgorithm_Initializes();
        HashingWriter_ConstructWithValidAlgorithm_Initializes();
        HashingWriter_ConstructWithInvalidAlgorithm_NoSuchAlgorithmException();

        // append tests
        HashingWriter_AppendWithNull_NullPointerException();
        HashingWriter_AppendWithEmptyString_Appends();

      `
    },
    {
      name: 'HashingWriter_ConstructWithDefaultAlgorithm_Initializes',
      javaCode: `
        try {
          test(new HashingWriter(new StringWriter()) != null, "HashingWriter with default algorithm created succesfully");
        } catch ( Throwable t ) {
          test(false, "HashingWriter with default algorithm should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_ConstructWithValidAlgorithm_Initializes',
      javaCode: `
        try {
          test(new HashingWriter("SHA-512", new StringWriter()) != null, "HashingWriter with valid algorithm created successfully");
        } catch ( Throwable t ) {
          test(false, "HashingWriter with a valid algorithm should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_ConstructWithInvalidAlgorithm_NoSuchAlgorithmException',
      javaCode: `
        try {
          new HashingWriter("ihwdifqnwdf", new StringWriter());
          test(false, "HashingWriter with an invalid algorithm should throw a NoSuchAlgorithmException");
        } catch ( Throwable t ) {
          test(t instanceof NoSuchAlgorithmException, "HashingWriter with invalid algorithm throws NoSuchAlgorithmException");
        }

      `
    },
    {
      name: 'HashingWriter_AppendWithNull_NullPointerException',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());
          writer.append(null);
          test(false, "HashingWriter appended with null should throw a NullPointerException");
        } catch ( Throwable t ) {
          test(t instanceof NullPointerException, "HashingWriter appended with null throws NullPointerException");
        }
      `
    },
    {
      name: 'HashingWriter_AppendWithEmptyString_Appends',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());
          writer.append("");
          test(true, "HashingWriter appended with an empty string does not throw an exception");
        } catch ( Throwable t ) {
          test(false, "HashingWriter appended with empty string should not throw an exception");
        }
      `
    }
  ]
});
