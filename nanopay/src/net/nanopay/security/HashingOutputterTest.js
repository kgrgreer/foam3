foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingOutputterTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.nanos.auth.User',
    'org.bouncycastle.util.encoders.Hex',
    'static foam.lib.json.OutputterMode.STORAGE'
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

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `new User.Builder(EmptyX.instance())
        .setId(1000)
        .setFirstName(\"Kirk\")
        .setLastName(\"Eaton\")
        .setEmail(\"kirk@nanopay.net\")
        .build()`
    },
    {
      type: 'String',
      name: 'EXPECTED',
      documentation: 'Expected output',
      value: '{\"class\":\"foam.nanos.auth.User\",\"id\":1000,\"firstName\":\"Kirk\",\"lastName\":\"Eaton\",\"email\":\"kirk@nanopay.net\"}'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // non-chained non-delta output tests
        HashingOutputter_StringifyWithoutChaining_CorrectOutput("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711");
        HashingOutputter_StringifyWithoutChaining_CorrectOutput("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f");
        HashingOutputter_StringifyWithoutChaining_CorrectOutput("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5");
        HashingOutputter_StringifyWithoutChaining_CorrectOutput("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d");
        HashingOutputter_StringifyWithoutChaining_CorrectOutput("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977");

        // chained non-delta output tests
        HashingOutputter_StringifyWithChaining_CorrectOutput("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711",
            "1ef9bf751f9c0cdce937c390c941b368");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f",
            "b170abdb87a12a3bf2479a8d064a131da39ffce2");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5",
            "6c5c6317f72fa53f364e7b3286579a561d020dff0fb8d47aa6ccb4cf75d25020");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d",
            "ea90d891dd9a4aa159fac2a43dd32b5123ad035991bb986431b3e485f8bdbb29fa9c0965e6c6bb00be9721b5d58c3fe4");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "712e96d25ddde037abd4b979b3234f3be70ba6e84ae6783e1080a1e616e623c81b28840054349942f715497fc409356175371d605d68c542742bc4f03cf4244b");
      `
    },
    {
      name: 'HashingOutputter_StringifyWithoutChaining_CorrectOutput',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'digest' }
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(EXPECTED).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(digest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(new HashingJournal.Builder(getX()).setAlgorithm(algorithm).setRollDigests(false).build(), STORAGE);
          test(outputter.stringify(INPUT).equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct output of: " + builder.toString());
        } catch ( Throwable t ) {
          test(false, "HashingOutputter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingOutputter_StringifyWithChaining_CorrectOutput',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'previousDigest' },
        { class: 'String', name: 'chainedDigest' }
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(EXPECTED).append(",{\\"algorithm\\":\\"").append(algorithm).append("\\",\\"digest\\":\\"").append(chainedDigest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(new HashingJournal.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(previousDigest).build(), STORAGE);
          test(outputter.stringify(INPUT).equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct chained output of: " + builder.toString());
        } catch ( Throwable t ) {
          test(false, "HashingOutputter should not throw an exception");
        }
      `
    }
  ]
});
