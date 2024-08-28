/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'PredicatedExpr',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression that evaluates a predicate.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return getArg1().f(obj);
      `
    }
  ]
});
