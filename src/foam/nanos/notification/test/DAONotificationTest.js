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
      DAO countryDAO = (DAO) x.get("countryDAO");
      Country country = (Country) countryDAO.find("CA");
      country = (Country) country.fclone();
      country.setName("Canada Eh!");
      country = (Country) countryDAO.put_(x, country);

      // test for email
      DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
      List<EmailMessage> emailMessages = (List) ((ArraySink) emailMessageDAO.select(new ArraySink())).getArray();
      EmailMessage message = null;
      for ( EmailMessage msg : emailMessages ) {
        if ( msg.getSubject().contains("DAONotificationEmailTemplateTest") ) {
          message = msg;
          break;
        }
      }
      test( message != null, "email subject has expected text: DAONotifcationEmailTemplateTest ["+message.getSubject()+"] body: ["+message.getBody()+"] message: "+message.toString());
      `
    }
  ]
});
