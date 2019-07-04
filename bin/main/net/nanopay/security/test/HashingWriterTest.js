foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'HashingWriterTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'net.nanopay.security.HashingWriter',
    'org.bouncycastle.util.encoders.Hex',
    'java.io.StringWriter',
    'java.nio.charset.StandardCharsets',
    'java.security.NoSuchAlgorithmException'
  ],

  constants: [
    {
      type: 'String',
      name: 'INPUT',
      value: 'The quick brown fox jumps over the lazy dog',
      documentation: 'Sample input to hash'
    },
    {
      type: 'String',
      name: 'EXPECTED',
      value: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
      documentation: 'Hashed value of \'The quick brown fox jumps over the lazy dog\' using SHA-256'
    },
    {
      type: 'String',
      name: 'EMPTY_SHA_256_DIGEST',
      value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      documentation: 'Hashed value of null/empty string using SHA-256'
    }
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
        HashingWriter_Append_CorrectDigest();
        HashingWriter_AppendWithNull_EmptyStringDigest();
        HashingWriter_AppendWithEmptyString_EmptyStringDigest();
        HashingWriter_Append_DelegateContainsAppendedString();

        // update tests
        HashingWriter_Update_CorrectDigest();
        HashingWriter_Update_DoesNotModifyDelegate();

        // reset tests
        HashingWriter_Reset_EmptyStringDigest();
        HashingWriter_Reset_DoesNotModifyDelegate();
      `
    },
    {
      name: 'HashingWriter_ConstructWithDefaultAlgorithm_Initializes',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());
          test(writer != null, "HashingWriter with default algorithm created successfully");
          test("SHA-256".equals(writer.getAlgorithm()), "HashingWriter returns SHA-256 as the algorithm");
        } catch ( Throwable t ) {
          test(false, "HashingWriter with default algorithm should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_ConstructWithValidAlgorithm_Initializes',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter("SHA-512", new StringWriter());
          test(writer != null, "HashingWriter with valid algorithm created successfully");
          test("SHA-512".equals(writer.getAlgorithm()), "HashingWriter returns SHA-512 as the algorithm");
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
      name: 'HashingWriter_Append_CorrectDigest',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());

          // append to hashing writer
          writer.append(INPUT);

          // verify digest
          test(EXPECTED.equals(Hex.toHexString(writer.digest())),
              "HashingWriter appended with \\"" + INPUT + "\\" produces the digest \\"" + EXPECTED + "\\"");
        } catch ( Throwable t ) {
          test(false, "Appending to HashingWriter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_AppendWithNull_EmptyStringDigest',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());
          writer.append(null);
          test(EMPTY_SHA_256_DIGEST.equals(Hex.toHexString(writer.digest())),
              "Null input produces the digest \\""+ EMPTY_SHA_256_DIGEST + "\\"");
        } catch ( Throwable t ) {
          test(false, "HashingWriter appended with null should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_AppendWithEmptyString_EmptyStringDigest',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());
          writer.append("");
          test(EMPTY_SHA_256_DIGEST.equals(Hex.toHexString(writer.digest())),
              "Empty string input produces the digest \\""+ EMPTY_SHA_256_DIGEST + "\\"");
        } catch ( Throwable t ) {
          test(false, "HashingWriter appended with empty string should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_Append_DelegateContainsAppendedString',
      javaCode: `
        try {
          StringWriter stringWriter = new StringWriter();
          HashingWriter writer = new HashingWriter(stringWriter);

          // append to hashing writer
          writer.append(INPUT);

          // verify delegate contains appended string
          test(INPUT.equals(stringWriter.toString()),
                "StringWriter delegate should equal \\"" + INPUT + "\\"");
        } catch ( Throwable t ) {
          test(false, "Appending to the HashingWriter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_Update_CorrectDigest',
      javaCode: `
        try {
          HashingWriter writer = new HashingWriter(new StringWriter());

          // update hashing writer
          writer.update(INPUT.getBytes(StandardCharsets.UTF_8));

          // verify digest
          test(EXPECTED.equals(Hex.toHexString(writer.digest())),
              "HashingWriter updated with \\"" + INPUT + "\\" produces the digest \\"" + EXPECTED + "\\"");
        } catch ( Throwable t ) {
          test(false, "Updating the HashingWriter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_Update_DoesNotModifyDelegate',
      javaCode: `
        try {
          StringWriter stringWriter = new StringWriter();
          HashingWriter writer = new HashingWriter(stringWriter);

          // update hashing writer
          writer.update(INPUT.getBytes(StandardCharsets.UTF_8));

          // verify string writer unchanged
          test("".equals(stringWriter.toString()),
              "Updating the HashingWriter does not modify the delegate");
        } catch ( Throwable t ) {
          test(false, "Updating the HashingWriter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_Reset_EmptyStringDigest',
      javaCode: `
        try {
          // append input
          HashingWriter writer = new HashingWriter(new StringWriter());
          writer.append(INPUT);

          // reset
          writer.reset();

          // verify digest equals empty string digest
          test(EMPTY_SHA_256_DIGEST.equals(Hex.toHexString(writer.digest())),
              "Resetting the HashingWriter produces the digest \\"" + EMPTY_SHA_256_DIGEST + "\\"");
        } catch ( Throwable t ) {
          test(false, "Resetting the HashingWriter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingWriter_Reset_DoesNotModifyDelegate',
      javaCode: `
        try {
          StringWriter stringWriter = new StringWriter();
          HashingWriter writer = new HashingWriter(stringWriter);

          // append data to writer
          writer.append(INPUT);

          // call reset
          writer.reset();

          // verify string writer still contains input
          test(INPUT.equals(stringWriter.toString()),
              "Resetting the HashingWriter does not modify the delegate");
        } catch ( Throwable t ) {
          test(false, "Resetting the HashingWriter should not throw an exception");
        }
      `
    }
  ]
});
