foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashedJSONParserTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Tests the various functionality of HashedJSONParser',

  javaImports: [
    'foam.nanos.auth.User'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'message',
      documentation: 'Original input message',
      value: '{\\"class\\":\\"foam.nanos.auth.User\\",\\"id\\":1000,\\"firstName\\":\\"Kirk\\",\\"lastName\\":\\"Eaton\\",\\"email\\":\\"kirk@nanopay.net\\"}'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // strings without message digest tests
        HashedJSONParser_JSONStringWithoutMessageDigestWithDigestNotRequired_Parse();
        HashedJSONParser_JSONStringWithoutMessageDigestWithDigestRequired_Exception();

        // strings with valid message digests
        HashedJSONParser_JSONStringWithValidMessageDigest_Parse("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711");
        HashedJSONParser_JSONStringWithValidMessageDigest_Parse("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f");
        HashedJSONParser_JSONStringWithValidMessageDigest_Parse("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5");
        HashedJSONParser_JSONStringWithValidMessageDigest_Parse("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d");
        HashedJSONParser_JSONStringWithValidMessageDigest_Parse("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977");

        // strings with invalid message digests
        HashedJSONParser_JSONStringWithInvalidMessageDigest_Exception("SHA-256",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977");

        // strings with valid chained message digests
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711",
            "1ef9bf751f9c0cdce937c390c941b368");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f",
            "b170abdb87a12a3bf2479a8d064a131da39ffce2");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5",
            "6c5c6317f72fa53f364e7b3286579a561d020dff0fb8d47aa6ccb4cf75d25020");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d",
            "ea90d891dd9a4aa159fac2a43dd32b5123ad035991bb986431b3e485f8bdbb29fa9c0965e6c6bb00be9721b5d58c3fe4");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "712e96d25ddde037abd4b979b3234f3be70ba6e84ae6783e1080a1e616e623c81b28840054349942f715497fc409356175371d605d68c542742bc4f03cf4244b");

        // strings with invalid chained message digests
        HashedJSONParser_JSONStringWithInvalidChainedMessageDigest_Parse("SHA-256",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "712e96d25ddde037abd4b979b3234f3be70ba6e84ae6783e1080a1e616e623c81b28840054349942f715497fc409356175371d605d68c542742bc4f03cf4244b");
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithoutMessageDigestWithDigestNotRequired_Parse',
      javaCode: `
        HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setDigestRequired(false).build());
        User result = (User) parser.parseString(getMessage(), User.class);
        test(result != null, "User parsed successfully");
        test(1000 == result.getId(), "User id \\"1000\\" parsed successfully");
        test("kirk@nanopay.net".equals(result.getEmail()), "User email \\"kirk@nanopay.net\\" parsed successfully");
        test("Kirk".equals(result.getFirstName()), "User first name \\"Kirk\\" parsed successfully");
        test("Eaton".equals(result.getLastName()), "User last name \\"Eaton\\" parsed successfully");
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithoutMessageDigestWithDigestRequired_Exception',
      javaCode: `
        try {
          HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setDigestRequired(true).build());
          parser.parseString(getMessage());
        } catch ( Throwable t ) {
          test("Digest not found".equals(t.getMessage()), "Exception with message \\"Digest not found\\" thrown");
        }
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithValidMessageDigest_Parse',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'digest'     }
      ],
      javaCode: `
        StringBuilder builder = sb.get().append(getMessage()).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(digest).append("\\"}");
        HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setAlgorithm(algorithm).build());
        test(parser.parseString(builder.toString()) != null, "User with " + algorithm + " message digest parsed successfully");
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithInvalidMessageDigest_Exception',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'digest' },
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(getMessage()).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(digest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setAlgorithm(algorithm).build());
          parser.parseString(builder.toString());
        } catch ( Throwable t ) {
          test("Digest verification failed".equals(t.getMessage()), "Exception with message \\"Digest verification failed\\" thrown");
        }
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'previousDigest' },
        { class: 'String', name: 'chainedDigest' }
      ],
      javaCode: `
        StringBuilder builder = sb.get().append(getMessage()).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(chainedDigest).append("\\"}");
        HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(previousDigest).build());
        test(parser.parseString(builder.toString()) != null, "User with " + algorithm + " chained message digest parsed successfully");
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithInvalidChainedMessageDigest_Parse',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'previousDigest' },
        { class: 'String', name: 'chainedDigest' }
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(getMessage()).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(chainedDigest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser(getX(), new HashingJournal.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(previousDigest).build());
          parser.parseString(builder.toString());
        } catch ( Throwable t ) {
          test("Digest verification failed".equals(t.getMessage()), "Exception with message \\"Digest verification failed\\" thrown");
        }
      `
    }
  ]
});
