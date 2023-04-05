/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessageValidationPropertyService',

  documentation: 'Checks if email properties such as Subject, Body, To, From are set',

  implements: [
      'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.security.InvalidParameterException'
  ],

  javaCode: `
    protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
      @Override
      protected JSONFObjectFormatter initialValue() {
        JSONFObjectFormatter formatter = new JSONFObjectFormatter();
        return formatter;
      }

      @Override
      public FObjectFormatter get() {
        FObjectFormatter formatter = super.get();
        formatter.reset();
        return formatter;
      }
    };
  `,

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        // TO:
        if ( ! emailMessage.isPropertySet("to") ||
             emailMessage.getTo().length == 0 ||
             foam.util.SafetyUtil.isEmpty(emailMessage.getTo()[0]) ) {
          FObjectFormatter formatter = formatter_.get();
          formatter.output(emailMessage);
          Loggers.logger(x, this).warning("Property not set", "to", formatter.builder().toString());
          throw new InvalidParameterException("To property is not set");
        }

        //SUBJECT:
        if ( ! emailMessage.isPropertySet("subject") ) {
          FObjectFormatter formatter = formatter_.get();
          formatter.output(emailMessage);
          String subject = (String) emailMessage.getTemplateArguments().get("subject");
          if ( ! foam.util.SafetyUtil.isEmpty(subject) ) {
            Loggers.logger(x, this).warning("Property not used", "subject", subject, formatter.builder().toString());
          } else {
            Loggers.logger(x, this).warning("Property not set", "subject", formatter.builder().toString());
          }
          throw new InvalidParameterException("Subject property is not set");
        }

        //BODY:
        if ( ! emailMessage.isPropertySet("body") ) {
          FObjectFormatter formatter = formatter_.get();
          formatter.output(emailMessage);
          Loggers.logger(x, this).warning("Property not set", "body", formatter.builder().toString());
          throw new InvalidParameterException("Body property is not set");
        }

        return emailMessage;
      `
    }
  ]
})
