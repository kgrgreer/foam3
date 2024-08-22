/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'FScript',
  extends: 'foam.mlang.AbstractExpr',

  javaImports: [
    'foam.lib.parse.PStream',
    'foam.lib.parse.ParserContext',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream',
    'foam.parse.FScriptParser',
    'foam.core.PropertyInfo'
  ],

  properties: [
    {
      class: 'String',
      name: 'query'
    },
    {
      class: 'Object',
      name: 'prop',
      javaType: 'PropertyInfo'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        var pred = foam.parse.FScriptParser.create({of: o.cls_, thisValue: this.prop}).parseString(this.query);
        return pred ? pred.partialEval().f(o) : false;
      },
      javaCode: `
      FScriptParser parser;
      if ( getProp() != null ) parser = new FScriptParser(getProp());
      else parser = new FScriptParser(((foam.core.FObject) obj).getClassInfo());
      StringPStream sps = new StringPStream();
      sps.setString(getQuery());
      PStream ps = sps;
      ParserContext x = new ParserContextImpl();
      ps = parser.parse(ps, x);
      if (ps == null)
        return null;

      if ( ps.value() instanceof foam.mlang.Expr ) {
        return ((foam.mlang.Expr) ps.value()).f(obj);
      }
      return ((foam.mlang.predicate.Predicate) ps.value()).f(obj);
      `
    }
  ]
});
