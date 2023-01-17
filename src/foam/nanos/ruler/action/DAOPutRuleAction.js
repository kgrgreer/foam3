/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'DAOPutRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Move to the requested DAO',

  javaImports: [
    'foam.dao.DAO'
  ],

  properties: [
    {
      name: 'daoKey',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      ((DAO) ruler.getX().get(getDaoKey())).put(obj);
      `
    }
  ]
});
