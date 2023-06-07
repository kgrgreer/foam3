/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessagePropertyServiceRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Rule Action for passing EmailMessage through EmailPropertyService',

  javaImports: [
    'foam.core.X',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      var emailMessage = (EmailMessage) obj;

      try {
        EmailPropertyService service = (EmailPropertyService) x.get("emailPropertyService");
        service.apply(x, null, emailMessage, null);
      } catch (Exception e) {
        Loggers.logger(x, this).warning("EmailPropertyService", e.getMessage(), e);
        throw new RuntimeException("EmailPropertyService error: "+e.getMessage());
      }

      emailMessage.setBody(emailMessage.getBody().replaceAll("\\\\.svg", ".png"));
     `
    }
  ]
});
