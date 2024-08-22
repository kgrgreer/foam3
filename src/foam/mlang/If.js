/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'If',
  extends: 'foam.mlang.AbstractExpr',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      javaFactory: 'return foam.mlang.MLang.TRUE;'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'trueExpr'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'falseExpr'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var expr = getPredicate().f(obj) ? getTrueExpr() : getFalseExpr();
        return expr.f(obj);
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: 'return "If(predicate:" + getPredicate() + ", trueExpr:" + getTrueExpr() + ", falseExpr:" + getFalseExpr() + ")";',
      code: function() {
        return
        'If(predicate:' + (this.predicate && this.predicate.toString() || 'NA') +
          ', trueExpr:' + (this.trueExpr && this.trueExpr.toString() || 'NA') +
          ', falseExpr:' + (this.falseExpr && this.falseExpr.toString() || 'NA') +
          ')';
      }
    }
  ]
});
