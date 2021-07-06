/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRuleActingUserRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.dig.DUGRule'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      final var dugrule = (DUGRule) obj;
      dugrule.setActingUser(dugrule.getCreatedBy());
      `
    }
  ]
});

