/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.json',
  name: 'StringToStringArrayParserTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.lib.parse.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        var input = "\\"str\\"";

        // setup parser
        var parser  = StringToStringArrayParser.instance();
        var ps      = new StringPStream(new Reference<>(input));
        var psx     = new ParserContextImpl();

        // parse
        ps = (StringPStream) ps.apply(parser, psx);
        test ( ps != null && ps.value() != null, "Parsed string successfully" );

        // test output
        var output = ps.value();
        test ( output instanceof String[]
          && ((String[]) output).length == 1
          && "str".equals(((String[]) output)[0])
        , "Parsed string data to string array successfully");
      `
    }
  ]
});
