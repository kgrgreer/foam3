/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'ClassReferenceParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        String input = "{\\"class\\":\\"__Class__\\",\\"forClass_\\":\\"foam.nanos.auth.User\\"}";
        ClassReferenceParserTest_StringWithValidClassReference(
          x, input, User.getOwnClassInfo(), "Parsed long form modelled Class reference parser successfully");

        String input2 = "\\"foam.nanos.auth.User\\"";
        ClassReferenceParserTest_StringWithValidClassReference(
          x, input2, User.getOwnClassInfo(), "Parsed short form modelled Class reference parser successfully");

        String input3 = "{\\"class\\":\\"__Class__\\",\\"forClass_\\":\\"java.lang.String\\"}";
        ClassReferenceParserTest_StringWithInvalidClassReference(x, input3, "Should fail parsing non foam class");

        String input4 = "{\\"class\\":\\"__Class__\\",\\"forClass_\\":\\"Invalid_Class\\"}";
        ClassReferenceParserTest_StringWithInvalidClassReference(x, input4, "Should fail parsing invalid class");
      `
    },
    {
      name: 'ClassReferenceParserTest_StringWithValidClassReference',
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
          // NOTE: ClassReferenceParser returns classInfo of the modelled class instead of the actual Java class.
          type: 'Class'
        },
        {
          name: 'message',
          type: 'String'
        },
      ],
      javaCode: `
        // setup parser
        Parser classReferenceParser = ClassReferenceParser.instance();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        ps = (StringPStream) ps.apply(classReferenceParser, psx);
        test(ps != null && expected.equals(ps.value()), message);
      `
    },
    {
      name: 'ClassReferenceParserTest_StringWithInvalidClassReference',
      args: 'Context x, String data, String message',
      javaCode: `
        // setup parser
        Parser classReferenceParser = ClassReferenceParser.instance();
        StringPStream ps = new StringPStream(new Reference<>(data));
        ParserContext psx = new ParserContextImpl();
        psx.set("X", x);

        // attempt parsing
        var threw = false;
        try {
          ps = (StringPStream) ps.apply(classReferenceParser, psx);
        } catch ( Throwable t ) {
          threw = true;
        }
        test(threw, message);
        test(psx.get("error") instanceof Throwable, "Parser context should contain error");
      `
    }
  ]
});
