/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailConfigEmailPropertyService',

  documentation: 'Fills unset properties on an email with values from the system emailConfig service.',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailConfig'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = Loggers.logger(x, this);
        EmailConfig emailConfig = (EmailConfig) ((DAO) x.get("emailConfigDAO")).find(emailMessage.getSpid());

        // Service property check
        if ( emailConfig == null ) {
          logger.error("EmailConfig not found", "spid", emailMessage.getSpid());
          return emailMessage;
        }

        // REPLY TO:
        if ( ! emailMessage.isPropertySet("replyTo") ) {
          emailMessage.setReplyTo(emailConfig.getReplyTo());
        }

        // DISPLAY NAME:
        if ( ! emailMessage.isPropertySet("displayName") ) {
          emailMessage.setDisplayName(emailConfig.getDisplayName());
        }

        // FROM:
        if ( ! emailMessage.isPropertySet("from") ) {
          emailMessage.setFrom(emailConfig.getFrom());
        }

        // TO:
        if ( ! emailMessage.isPropertySet("to") ) {
          User user = ((Subject) x.get("subject")).getRealUser();
          emailMessage.setTo(new String[] { user.getEmail() });
        }

        // SPID:
        if ( ! emailMessage.isPropertySet("spid") ) {
          User user = ((Subject) x.get("subject")).getRealUser();
          emailMessage.setSpid(user.getSpid());
        }

        return emailMessage;
      `
    }
  ]
});
