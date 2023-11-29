/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.formatter.test',
  name: 'JSONFObjectFormatterParserTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test formatting and parsing json',

  javaImports: [
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `

      JSONFObjectFormatter formatter = null;
      JSONParser parser = null;
      String json = null;
      String testId = null;

      // Test output and parsing of fobject with predicate TRUE/FALSE.
      // The TRUE/FALSE predicate only outputs it's default class name

      // This combination should produce invalid json.
      // Setting OutputDefaultClassNames(false) will set OutputDefaultValues(false)
      // but this test case explicitly setOutputDefaultValues(true)
      testId = "OutputDefaultClassNames:false-OutputDefaultValues:true";
      formatter = new JSONFObjectFormatter();
      formatter.setOutputDefaultClassNames(false);
      formatter.setOutputDefaultValues(true);
      var rg = new foam.nanos.ruler.RuleGroup();
      rg.setId(this.getClass().getSimpleName());
      // predicate defaults to TRUE
      formatter.output(rg);
      json = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(json) && json.contains(":,"), testId+" INVALID json generated "+json.toString());
      parser = new JSONParser();
      try {
        Object o = parser.parseString(json);
        test ( o == null, testId+" json NOT parsed");
      } catch ( Throwable t ) {
        // Should fail parsing, but not through exception
        test ( false, testId+" Error parsing: "+t.getMessage());
      }

      testId = "OutputDefaultClassNames:true-OutputDefaultValues:true";
      formatter = new JSONFObjectFormatter();
      // formatter.setOutputDefaultClassNames(true); - default
      formatter.setOutputDefaultValues(true);
      rg = new foam.nanos.ruler.RuleGroup();
      rg.setId(this.getClass().getSimpleName());
      // predicate defaults to TRUE
      formatter.output(rg);
      json = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(json) && ! json.contains(":,"), testId+" valid json generated: "+json.toString());
      parser = new JSONParser();
      try {
        Object o = parser.parseString(json);
        test ( o != null, testId+" json parsed");
      } catch ( Throwable t ) {
        test ( false, testId+" Error parsing: "+t.getMessage());
      }

      testId = "OutputDefaultClassNames:true-OutputDefaultValues:false";
      formatter = new JSONFObjectFormatter();
      // formatter.setOutputDefaultClassNames(true); - default
      // formatter.setOutputDefaultValues(false); - default
      rg = new foam.nanos.ruler.RuleGroup();
      rg.setId(this.getClass().getSimpleName());
      // predicate defaults to TRUE
      formatter.output(rg);
      json = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(json) && ! json.contains(":,"), testId+" valid json generated: "+json.toString());
      parser = new JSONParser();
      try {
        Object o = parser.parseString(json);
        test ( o != null, testId+" json parsed");
      } catch ( Throwable t ) {
        test ( false, testId+" Error parsing: "+t.getMessage());
      }

      testId = "OutputDefaultClassNames:false-OutputDefaultValues:false";
      formatter = new JSONFObjectFormatter();
      formatter.setOutputDefaultClassNames(false);
      // formatter.setOutputDefaultValues(false); - default
      rg = new foam.nanos.ruler.RuleGroup();
      rg.setId(this.getClass().getSimpleName());
      // predicate defaults to TRUE
      formatter.output(rg);
      json = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(json) && ! json.contains(":,"), testId+" valid json generated: "+json.toString());
      parser = new JSONParser();
      try {
        Object o = parser.parseString(json);
        test ( o != null, testId+" json parsed");
      } catch ( Throwable t ) {
        test ( false, testId+" Error parsing: "+t.getMessage());
      }
      `
    }
  ]
})
