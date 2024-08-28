/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'ChangePropertyAction',

  documentation: 'Set the value of a field of the object',

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Object',
      name: 'value'
    },
    {
      class: 'Boolean',
      name: 'useAgency'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Object value = getValue() instanceof foam.mlang.Expr ? ((foam.mlang.Expr) getValue()).f(x) : getValue();
        if ( getUseAgency() ) {
          agency.submit(x, agencyX -> {
            obj.setProperty(getPropName(), value);
          }, "ChangePropertyAction");
        } else {
          obj.setProperty(getPropName(), value);
        }
      `
    }
  ]
});
