/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'DynamicCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `Dynamically adds a currency record based on the given string.
    The format is: SYMBOL_Precision. The new currency is the copy of SYMBOL currency with updated precision`,

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.parse.*',
    'foam.lib.parse.Action',
    'foam.lib.parse.Grammar',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Grammar',
      name: 'currencyGrammar',
      javaFactory: `
      Grammar grammar = new Grammar();
      grammar.addSymbol("markup", new Seq(new Until(Literal.create("_")),
        new Until(EOF.instance())));
      grammar.addAction("markup", new Action() {
        @Override
        public Object execute(Object value, ParserContext x) {

          String iso = compactToString(((Object[])value)[0]);
          DAO curDAO = (DAO) x.get("currencyDAO");
          Currency foundCur = (Currency) curDAO.find(iso);

          if ( foundCur == null ) throw new FOAMException("Currency not found. " + iso);

          int precision;
          try {
            precision = Integer.parseInt(compactToString(((Object[])value)[1]));
          } catch (java.lang.Exception e) {
            throw new FOAMException("Invalid currency format");
          }

          Currency cur = (Currency) foundCur.fclone();
          cur.setPrecision(precision);
          cur.setId((String) x.get("currency"));
          curDAO.put(cur);
          return value;
        }
      });
      return grammar;
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      var ret = getDelegate().find_(x, id);
      if ( ret != null ) return  ret;
      Logger logger = (Logger) x.get("logger");
      logger.info("Creating currency for: " + id);
      ParserContext parserX = new ParserContextImpl();
      parserX.set("currencyDAO", getDelegate());
      parserX.set("currency", id);
      StringPStream ps = new StringPStream();
      ps.setString((String) id);
      getCurrencyGrammar().parse(ps, parserX, "markup");
      return getDelegate().find(id);
      `
    },
    {
      name: 'compactToString',
      type: 'String',
      args: [
        {
          name: 'val',
          type: 'Object'
        }
      ],
      javaCode: `
      Object[] values = (Object[]) val;
      StringBuilder sb = new StringBuilder();
      for ( Object num: values ) {
        sb.append(num);
      }
      return sb.toString();
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public DynamicCurrencyDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
            }
          `
        );
      }
    }
  ]
});
