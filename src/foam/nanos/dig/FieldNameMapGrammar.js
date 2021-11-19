/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'FieldNameMapGrammar',
  documentation: `replaces fieldnames in a JSON with fieldnames specified in the map provided as an argument`,

  javaImports: [
    'foam.lib.json.*',
    'foam.lib.parse.*',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Grammar',
      name: 'grammar',
      documentation: `the syntax for a JSON is "fieldname": value. The grammar finds all the occurrences of fieldnames in
        a JSON formatted string and replaces them with alternative field name provided in the map`,
      javaFactory: `
        Grammar grammar = new Grammar();
        grammar.addSymbol("START", grammar.sym("markup"));

        grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("FIELD_NAME"), grammar.sym("ANY_CHAR"))));

        // ANY_KEY symbol applies to any char that doesn't match any other pattern
        grammar.addSymbol("ANY_CHAR", AnyChar.instance());
        Action anyCharAction = new Action() {
          @Override
          public Object execute(Object val, ParserContext x) {
            ((StringBuilder) x.get("sb")).append(val);
            return val;
          }
        };
        grammar.addAction("ANY_CHAR", anyCharAction);

        // json fieldname syntax
        grammar.addSymbol("FIELD_NAME", new Seq1(1, Literal.create("\\\""), new Until(Literal.create("\\\"")), Whitespace.instance(),Literal.create(":")));
        Action fieldNameAction = new Action() {
          @Override
          public Object execute(Object val, ParserContext x) {
            Object[] valArr  = (Object[]) val;
            StringBuilder field = new StringBuilder();
            for ( int i = 0 ; i < valArr.length ; i++ ) {
              field.append(valArr[i]);
            }
            Map<String,String> mp = (Map)x.get("fields");
            ((StringBuilder) x.get("sb")).append(mp.get(field.toString()) == null ? field : mp.get(field.toString()));
            ((StringBuilder) x.get("sb")).append(":");
            return val;
          }
        };
        grammar.addAction("FIELD_NAME", fieldNameAction);

        return grammar;
      `
    }
  ],

  methods: [
    {
      name: 'replaceFields',
      args: [
        { name: 'data',     type: 'String' },
        { name: 'fields', type: 'Map' }
      ],
      type: 'String',
      javaCode: `
      StringPStream ps = new StringPStream();
      ps.setString(data);
      ParserContext parserX = new ParserContextImpl();
      StringBuilder sb = sb_.get();
      parserX.set("sb", sb);
      parserX.set("fields", fields);
      getGrammar().parse(ps, parserX, "");
      return sb.toString();
      `
    }
  ],
  javaCode:
    `protected static ThreadLocal<StringBuilder> sb_ = new ThreadLocal<StringBuilder>() {
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
     };`
});
