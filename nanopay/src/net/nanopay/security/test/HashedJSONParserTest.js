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
  name: 'HashedJSONParserTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Tests the various functionality of HashedJSONParser',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.security.HashedJSONParser',
    'net.nanopay.security.HashingJournal',
    'net.nanopay.security.MessageDigest',
    'org.bouncycastle.util.encoders.Hex'
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
      type: 'String',
      name: 'INPUT',
      documentation: 'Original input',
      value: '{"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"}'
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
            "c2c60ee244b5bbcfb5e9e7c78900ebf1");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f",
            "e9a4f67cb9eb39ef73d33afe4260234dec32f2d6");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5",
            "969cae16ce6b859df7ebf1d3672825d637908b534f6c6be1b4878dc7725dead4");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d",
            "77e5c04a8458162d7819a6a2292425caeff642f28eacce188078e0095b3557b933ae7481224088890d143c81e5fd4ed6");
        HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "0b258db95d4e6ab292c015a781489b2ff2c1e9a653f878bd9745b698ef292a37cf9d3538d875ef92601d3715c60c78cb9de7992525207c98e3fd6efd9fc7005a");

        // strings with invalid chained message digests
        HashedJSONParser_JSONStringWithInvalidChainedMessageDigest_Parse("SHA-256",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "712e96d25ddde037abd4b979b3234f3be70ba6e84ae6783e1080a1e616e623c81b28840054349942f715497fc409356175371d605d68c542742bc4f03cf4244b");
      `
    },
    {
      name: 'HashedJSONParser_JSONStringWithoutMessageDigestWithDigestNotRequired_Parse',
      javaCode: `
        HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest()).setDigestRequired(false).build();
        User result = (User) parser.parseString(INPUT, User.class);
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
          HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest()).setDigestRequired(true).build();
          parser.parseString(INPUT);
          test(false, "HashedJSONParser with digest required should not parse a string without a message digest");
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
        try {
          StringBuilder builder = sb.get().append(INPUT).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(digest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest.Builder(getX()).setAlgorithm(algorithm).build()).setDigestRequired(true).build();
          test(parser.parseString(builder.toString()) != null, algorithm + " message digest parsed successfully");
        } catch ( Throwable t ) {
          test(false, "HashedJSONParser with valid message digest should not throw an exception");
        }
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
          StringBuilder builder = sb.get().append(INPUT).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(digest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest.Builder(getX()).setAlgorithm(algorithm).build()).setDigestRequired(true).build();
          parser.parseString(builder.toString());
          test(false, "HashedJSONParser should not parse a string with an invalid message digest");
        } catch ( Throwable t ) {
          test("Digest verification failed.".equals(t.getMessage()), "Exception thrown for invalid digest");
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
        try {
          StringBuilder builder = sb.get().append(INPUT).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(chainedDigest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(Hex.decode(previousDigest)).build()).setDigestRequired(true).build();
          test(parser.parseString(builder.toString()) != null, algorithm + " chained message digest parsed successfully");
        } catch ( Throwable t ) {
System.err.println("HashedJSONParser_JSONStringWithValidChainedMessageDigest_Parse");
t.printStackTrace();
          test(false, "HashedJSONParser with valid chained message digest should not throw an exception");
        }
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
          StringBuilder builder = sb.get().append(INPUT).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(chainedDigest).append("\\"}");
          HashedJSONParser parser = new HashedJSONParser.Builder(getX()).setMessageDigest(new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(Hex.decode(previousDigest)).build()).setDigestRequired(true).build();
          parser.parseString(builder.toString());
          test(false, "HashedJSONParser should not parse a string with an invalid chained message digest");
        } catch ( Throwable t ) {
          test("Digest verification failed.".equals(t.getMessage()), "Exception thrown for invalid chained digest");
        }
      `
    }
  ]
});
