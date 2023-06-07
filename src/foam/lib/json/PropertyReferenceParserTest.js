/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'PropertyReferenceParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        String input = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\",\\"name\\":\\"id\\"}";
        PropertyReferenceParserTest_ValidPropertyReference(
          x, input, User.ID, "Parsed property reference successfully");

        String input2 = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\",\\"name\\":   \\"id\\"}";
        PropertyReferenceParserTest_ValidPropertyReference(
          x, input2, User.ID, "Parsed property reference (ignore spaces) successfully");

        String input3 = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\",\\"name\\":\\"Not_exist_property\\"}";
        PropertyReferenceParserTest_ValidPropertyReference(
          x, input3, null, "Should return null parsing non-existent property reference");

        String input4 = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"java.lang.String\\",\\"name\\":\\"id\\"}";
        PropertyReferenceParserTest_InvalidPropertyReference(x, input4, "Should fail parsing non foam modelled class");

        String input5 = "{\\"class\\":\\"__Property__\\",\\"forClass_\\":\\"Invalid_Class\\",\\"name\\":\\"id\\"}";
        PropertyReferenceParserTest_InvalidPropertyReference(x, input5, "Should fail parsing invalid class");
      `
    },
    {
      name: 'PropertyReferenceParserTest_ValidPropertyReference',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'data',
          type: 'String'
        },
        {
          name: 'expected',
          javaType: 'foam.core.PropertyInfo'
        },
        {
          name: 'message',
          type: 'String'
        },
      ],
      javaCode: `
        // setup parser
        Parser parser = new PropertyReferenceParser();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        ps = (StringPStream) ps.apply(parser, psx);
        test(ps != null && (
              expected == ps.value() || expected.equals(ps.value())), message);
      `
    },
    {
      name: 'PropertyReferenceParserTest_InvalidPropertyReference',
      args: 'Context x, String data, String message',
      javaCode: `
        // setup parser
        Parser parser = new PropertyReferenceParser();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        var threw = false;
        try {
          ps = (StringPStream) ps.apply(parser, psx);
        } catch ( Throwable t ) {
          threw = true;
        }
        test(threw, message);
        test(psx.get("error") instanceof Throwable, "Parser context should contain error");
      `
    }
  ]
});
