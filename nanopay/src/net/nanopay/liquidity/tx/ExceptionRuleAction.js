/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'ExceptionRuleAction',

  documentation: 'Rule action that always throws an exception.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.ruler.RuleAction',
  ],

  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        throw new RuntimeException(this.getMessage());
      `
    }
  ]
});
