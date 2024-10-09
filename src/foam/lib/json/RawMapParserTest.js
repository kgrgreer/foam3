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
    'foam.lib.parse.*',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var input = "{\\"test\\":{\\"class\\":\\"User\\"}}";

        // setup parser
        var parser  = RawMapParser.instance();
        var ps      = new StringPStream(new Reference<>(input));
        var psx     = new ParserContextImpl();

        // parse
        ps = (StringPStream) ps.apply(parser, psx);
        var success = ps != null && ps.value() != null;
        test ( success, "RawMapParser parsed successfully" );

        if ( success ) {
          // test output
          var output = (Map) ps.value();
          test ( output.get("test") instanceof Map
            && "User".equals(((Map) output.get("test")).get("class"))
          , "Parsed data should be a raw map");
        }
      `
    }
  ]
});
