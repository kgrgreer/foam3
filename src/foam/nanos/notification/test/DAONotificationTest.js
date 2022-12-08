/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.test',
  name: 'DAONotificationTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test DAONotificationRuleAction generates an email',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.nanos.auth.Country',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'setUp',
      args: 'X x',
      javaCode: `
      // see deployment/test for 
      // groups, users, 
      // emailTemplate, notificationTemplate
      // notificationSettings, ... 
      `
    },
    {
      name: 'runTest',
      javaCode: `
      setUp(x);
      DAO emailMessageDAO = new MDAO(EmailMessage.getOwnClassInfo());
      x = x.put("emailMessageDAO", emailMessageDAO);
      DAO countryDAO = (DAO) x.get("countryDAO");
      Country country = (Country) countryDAO.find("CA");
      country = (Country) country.fclone();
      country.setName("Canada Eh!");
      country = (Country) countryDAO.put_(x, country);

      // test for email
      List<EmailMessage> emailMessages = (List) ((ArraySink) emailMessageDAO.select(new ArraySink())).getArray();
      test( emailMessages != null && emailMessages.size() > 0, "email generated");
      // NOTE: can't test message subject and such as emailMessageDAO decorators are not applied.
      // EmailMessage message = emailMessages.get(0);
      // test( message.getSubject().contains("DAONotificationEmailTemplateTest"), "email has expected subject: ["+message.getSubject()+"] body: ["+message.getBody()+"] message: "+message.toString());
      `
    }
  ]
});
