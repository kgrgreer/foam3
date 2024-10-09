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

        var output = success ? (Map) ps.value() : null;
        var target = output != null ? output.get("test") : null;

        // test output
        test ( target instanceof Map && "User".equals(((Map) target).get("class")), "Parsed data should be a raw map");

        // more test cases
        parse_array_raw_map();
      `
    },
    {
      name: 'parse_array_raw_map',
      javaCode: `
        var input = "{\\"array\\":[{\\"class\\":\\"User\\"}]}";

        // setup parser
        var parser  = RawMapParser.instance();
        var ps      = new StringPStream(new Reference<>(input));
        var psx     = new ParserContextImpl();

        ps = (StringPStream) ps.apply(parser, psx);

        var output = ps != null ? (Map) ps.value() : null;
        var array  = output != null ? (Object[]) output.get("array") : null;

        // test output
        test ( array != null && array.length == 1 && "User".equals(((Map) array[0]).get("class")), "Parse array raw map");
      `
    }
  ]
});
