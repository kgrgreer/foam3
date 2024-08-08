/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.test',
  name: 'EmailNotificationTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test email created for user on notification creation',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.nanos.notification.Notification',
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
      Notification notification = new Notification();
      notification.setTemplate("761590193");
      notification.setUserId(185426801);
      notification.setBody("EmailNotificationTest");
      ((DAO) x.get("notificationDAO")).put_(x, notification);

      // test for email
      DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
      List<EmailMessage> emailMessages = (List) ((ArraySink) emailMessageDAO.select(new ArraySink())).getArray();
      EmailMessage message = null;
      for ( EmailMessage msg : emailMessages ) {
        if ( msg.getUser() == notification.getUserId() && msg.getBody().contains(notification.getBody()) && msg.getSubject().equals("DAONotificationEmailTemplateTest") ) {
          message = msg;
          break;
        }
      }
      test ( message != null, "email found");
      `
    }
  ]
});
