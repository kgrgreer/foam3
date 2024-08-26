/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Subtract',
  extends: 'foam.mlang.Formula',
  implements: [ 'foam.core.Serializable' ],

  methods: [
    {
      name: 'reduce',
      abstract: false,
      javaCode: 'return accumulator - currentValue;',
      code: (accumulator, currentValue) => accumulator - currentValue
    }
  ]
});
