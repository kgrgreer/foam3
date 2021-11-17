/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'FieldNameMapGrammar',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.lib.json.*',
    'foam.lib.parse.*',
    'foam.lib.parse.Action',
    'foam.lib.parse.Grammar',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.notification.email.DAOResourceLoader',
    'java.lang.StringBuilder',
    'java.util.HashMap',
    'java.util.Map',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Grammar',
      name: 'grammar',
      documentation: ``,
      javaFactory: `
        Grammar grammar = new Grammar();
        grammar.addSymbol("START", grammar.sym("markup"));

        // markup symbol defines the pattern for the whole string
        grammar.addSymbol("markup", new Repeat0(new Alt(grammar.sym("FIELD_NAME"), grammar.sym("ANY_CHAR"))));
        Action markup = new Action() {
          @Override
          public Object execute(Object value, ParserContext x) {
            return (StringBuilder) x.get("sb");
          }
        };
        grammar.addAction("markup", markup);

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

        // simple value syntax: "qwerty {{ simple_value }} qwerty"
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

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<StringBuilder> sb_ = new ThreadLocal<StringBuilder>() {
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
  ]
});
