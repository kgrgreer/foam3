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
  name: 'HashingOutputterTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.nanos.auth.User',
    'net.nanopay.security.HashingOutputter',
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
      name: 'INPUT_DELTA',
      documentation: 'Delta input',
      javaValue: `
        new User.Builder(EmptyX.instance())
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@mintchip.ca")
          .build();
      `
    },
    {
      type: 'String',
      name: 'EXPECTED',
      documentation: 'Expected output',
      value: '{"class":"foam.nanos.auth.User","id":1000,"firstName":"Kirk","lastName":"Eaton","email":"kirk@nanopay.net"}'
    },
    {
      type: 'String',
      name: 'EXPECTED_DELTA',
      documentation: 'Expected delta output',
      value: '{"class":"foam.nanos.auth.User","id":1000,"email":"kirk@mintchip.ca"}'
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

        // non-chained delta output tests
        HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput("MD5",
          "6139573a13f6ee7e9f92e9e1da2cfd01");
        HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput("SHA-1",  // here!!
          "7c46c39e4c46f85b217b800c6973952097e4dfc5");
        HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput("SHA-256",
          "e0dbb6fcf5a1d18e1fd03feb7b3fef729b035c84bc196d3fb722625a8d9e3d89");
        HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput("SHA-384",
          "82764fc922c0b3eb7d55a50cf5ea4cf23340c6d9cb516ac6ead6fa12b9eef8f7ee41985e962e2cc9d8854802b2fc0441");
        HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput("SHA-512",
          "e71605cf07f2d2cd1f95387a998136a048f276a05cec1be3d26de5754e8db8791ed817b3c6f26ac57a4522fc29500067f439208695180d13bc0c48129f9275fa");

        // chained non-delta output tests
        HashingOutputter_StringifyWithChaining_CorrectOutput("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711",
            "c2c60ee244b5bbcfb5e9e7c78900ebf1");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f",
            "e9a4f67cb9eb39ef73d33afe4260234dec32f2d6");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5",
            "969cae16ce6b859df7ebf1d3672825d637908b534f6c6be1b4878dc7725dead4");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d",
            "77e5c04a8458162d7819a6a2292425caeff642f28eacce188078e0095b3557b933ae7481224088890d143c81e5fd4ed6");
        HashingOutputter_StringifyWithChaining_CorrectOutput("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "0b258db95d4e6ab292c015a781489b2ff2c1e9a653f878bd9745b698ef292a37cf9d3538d875ef92601d3715c60c78cb9de7992525207c98e3fd6efd9fc7005a");

        // chained delta output tests
        HashingOutputter_StringifyDeltaWithChaining_CorrectOutput("MD5",
            "40c6f1a0484b0a37adb5e4382aa2b711",
            "748b7e3bf69ba345a8bbd6fb252942f5");
        HashingOutputter_StringifyDeltaWithChaining_CorrectOutput("SHA-1",
            "153789a503f9cb3f7c62f573e4ac6a22d4c9241f",
            "fac1d5bd41c25822ef2fc933a635cfda9c4496e8");
        HashingOutputter_StringifyDeltaWithChaining_CorrectOutput("SHA-256",
            "1f62e5366081be2b9ac3ff75bacec01bad128e64ab758438361b5e11ba90f5d5",
            "e4f70bdb3fd2516e2734f13be2afdfe821b853a83fab32a0bd3ad41243d5fee9");
        HashingOutputter_StringifyDeltaWithChaining_CorrectOutput("SHA-384",
            "be26403b1c55166a8770134a1a7b4b6ed358faebf7e3dc96c7f75a2221b687ca6da6d789d57498112ec0091eb1246f8d",
            "2e733c7f012ccabdd6f48855b767a8e54181fb55c8be2cd8656d2ce11a07c2b860086c7448ec1e6e3a8dd21167c35792");
        HashingOutputter_StringifyDeltaWithChaining_CorrectOutput("SHA-512",
            "63db4efa26eacbd290dd58102acef2b361f324069e500d51d5aefe041b21c8dcd7d1cf2ecd064af8eff518ad31c5f3c5fb4737f6b04341a0b179657aaf827977",
            "726ff364fdab723419c1881fcc03c2d9374f745f98474eb4586892db0e83b2ca21c8e88ffdb8c02cf3e58400f712d8c958a6a7d1a3f340ab80c12a8ef25a1a3c");
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
          StringBuilder builder = sb.get().append(EXPECTED).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(digest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(getX(), true, new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(false).build());
          String produced = outputter.stringify(INPUT.fclone());
          // strip out possible passwordHistory
          produced = produced.replaceAll(",\\"passwordHistory\\":.*}]", "");
          test(produced.equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct output of: " + builder.toString()+" input: "+produced);
        } catch ( Throwable t ) {
t.printStackTrace();
          test(false, "HashingOutputter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingOutputter_StringifyDeltaWithoutChaining_CorrectOutput',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'digest' }
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(EXPECTED_DELTA).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(digest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(getX(), true, new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(false).build());
          String delta = outputter.stringifyDelta(INPUT.fclone(), INPUT_DELTA.fclone());
          test(delta.equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct delta output of: " + builder.toString() + " matching with: " + delta);
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
          StringBuilder builder = sb.get().append(EXPECTED).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(chainedDigest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(getX(), true, new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(Hex.decode(previousDigest)).build());
          test(outputter.stringify(INPUT.fclone()).equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct chained output of: " + builder.toString()+" input: "+outputter.stringify(INPUT.fclone()));
        } catch ( Throwable t ) {
          test(false, "HashingOutputter should not throw an exception");
        }
      `
    },
    {
      name: 'HashingOutputter_StringifyDeltaWithChaining_CorrectOutput',
      args: [
        { class: 'String', name: 'algorithm' },
        { class: 'String', name: 'previousDigest' },
        { class: 'String', name: 'chainedDigest' }
      ],
      javaCode: `
        try {
          StringBuilder builder = sb.get().append(EXPECTED_DELTA).append(",{algorithm:\\"").append(algorithm).append("\\",provider:\\"\\",digest:\\"").append(chainedDigest).append("\\"}");
          HashingOutputter outputter = new HashingOutputter(getX(), true, new MessageDigest.Builder(getX()).setAlgorithm(algorithm).setRollDigests(true).setPreviousDigest(Hex.decode(previousDigest)).build());
          test(outputter.stringifyDelta(INPUT.fclone(), INPUT_DELTA.fclone()).equals(builder.toString()), "HashingOutputter using " + algorithm + " produces correct delta chained output of: " + builder.toString()+" input: "+outputter.stringifyDelta(INPUT.fclone(), INPUT_DELTA.fclone()));
        } catch ( Throwable t ) {
          test(false, "HashingOutputter should not throw an exception");
        }
      `
    }
  ]
});
