/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessageStatusRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Almost last Rule Action for setting status to UNSENT',

  javaImports: [
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.Status',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      var emailMessage = (EmailMessage) obj;
      emailMessage.setStatus(Status.UNSENT);
     `
    }
  ]
});
