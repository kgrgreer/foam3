/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.ruler',
  name: 'PreventDuplicateUsernameAfterAction',

  documentation: `Release lock acquired in PreventDuplicateUsernameAction.`,

  implements: [ 'foam.nanos.ruler.RuleAction' ],

/*
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X'
  ],
  */

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        PreventDuplicateUsernameAction.LOCK.release();
      `
    }
  ]
});
