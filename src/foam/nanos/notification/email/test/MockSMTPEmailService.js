/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email.test',
  name: 'MockSMTPEmailService',
  extends: 'foam.nanos.notification.email.SMTPEmailService',

  javaImports: [
    'foam.core.X',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.Status',
    'javax.mail.Session', // satisfy javagen/compilation
    'javax.mail.Transport' // satisfy javagen/compilation
  ],

  properties: [
    {
      class: 'Long',
      name: 'rateLimit',
      value: 2
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      // nop
      `
    },
    {
      name: 'sendEmail',
      javaCode: `
        emailMessage = (EmailMessage) emailMessage.fclone();
        emailMessage.setStatus(Status.SENT);
        return emailMessage;
      `,
      code: function() { return; }
    }
  ]
});
