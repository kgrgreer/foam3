/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplateApplyEmailPropertyService',

  documentation: 'Fills unset properties on an email with values from the emailTemplate.',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: 'application of template args to emailTemplate and then onto the emailMessage',
      javaCode: `
      Logger logger = Loggers.logger(x, this);

      String templateName = (String)templateArgs.get("template");
      if ( SafetyUtil.isEmpty(templateName) ) {
        // logger.debug("Template undefined");
        return emailMessage;
      }

      String locale = (String) templateArgs.get("locale");

      // STEP 1) Find EmailTemplate
      String spid = emailMessage.getSpid();
      User user = emailMessage.findUser(x);
      if ( user != null ) {
        spid = user.getSpid();
      }
      EmailTemplate emailTemplate = EmailTemplateSupport.findTemplate(x, templateName, group, locale, spid, templateArgs);
      if ( emailTemplate == null ) {
        logger.warning("EmailTemplate not found", templateName, group);
        return emailMessage;
      }

      // STEP 2) Apply Template to emailMessage
      try {
        if ( emailTemplate.getEnabled() )
          emailMessage = emailTemplate.apply(x, group, emailMessage, templateArgs);
      } catch (Exception e) {
        logger.error("EmailTemplate apply failed", templateName, "group", group, e.getMessage(), e);
      }
      return emailMessage;
      `
    }
  ]
});
