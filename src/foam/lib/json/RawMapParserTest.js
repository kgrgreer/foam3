/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'RawMapParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var input = "{\\"class\\":\\"User\\"}";

        // setup parser
        var parser  = RawMapParser.instance();
        var ps      = new StringPStream(new Reference<>(input));
        var psx     = new ParserContextImpl();

        // parse
        ps = (StringPStream) ps.apply(parser, psx);
        test ( ps != null && ps.value() != null, "RawMapParser parsed successfully" );

        // test output
        var output = (java.util.Map) ps.value();
        test ( "User".equals(output.get("class")) , "Parsed data should be a map");
      `
    }
  ]
});
