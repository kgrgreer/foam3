/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'StringLength',
  extends: 'foam.mlang.AbstractExpr',
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(o) { return this.arg1.f(o).length; },
      javaCode: 'return ((String) getArg1().f(obj)).length();'
    }
  ]
});
