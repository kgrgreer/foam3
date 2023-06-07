/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email.test',
  name: 'MockSMTPAgent',
  extends: 'foam.nanos.notification.email.SMTPAgent',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailServiceConfig',
    'foam.nanos.notification.email.Status',
    'javax.mail.Session', // satisfy javagen/compilation
    'javax.mail.Transport' // satisfy javagen/compilation
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      // nop
      `
    },
    {
      name: 'sleep',
      args: 'Long interval',
      javaCode: `
      // don't let test continue after first rate limit
      EmailServiceConfig config = (EmailServiceConfig) findId(getX()).fclone();
      config.setEnabled(false);
      ((DAO) getX().get("emailServiceConfigDAO")).put(config);
      `
    },
    {
      name: 'send',
      javaCode: `
        emailMessage = (EmailMessage) emailMessage.fclone();
        emailMessage.setStatus(Status.SENT);
        return emailMessage;
      `,
      code: function() { return; }
    }
  ]
});
