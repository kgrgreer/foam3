/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'ApplyBaseArgumentsEmailPropertyService',

  documentation: 'set up the base arguments of theme, appConfig',

  implements: [
    'foam.nanos.notification.email.EmailPropertyService'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.SupportConfig',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailConfig',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.session.Session',
    'foam.nanos.theme.Theme',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = Loggers.logger(x, this);

        User user = (User) emailMessage.findUser(getX());
        if ( user != null ) {
          x = foam.util.Auth.sudo(x, user);
          emailMessage.setSpid(user.getSpid());
          String sendTo = (String) templateArgs.get("sendTo");
          if ( SafetyUtil.isEmpty(sendTo) )
            templateArgs.put("sendTo", user.getEmail());
          templateArgs.put("locale", user.getLanguage().getCode().toString());
        }

        // AppConfig config
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        String url = "";
        if ( appConfig != null ) {
          url = appConfig.getUrl();
          templateArgs.put("appLink", url);
          templateArgs.put("termsAndCondLink", url + appConfig.getTermsAndCondLink());
          templateArgs.put("termsAndCondLabel", appConfig.getTermsAndCondLabel());
          templateArgs.put("copyright", appConfig.getCopyright());
          templateArgs.put("privacyUrl", url + appConfig.getPrivacyUrl());
          templateArgs.put("privacyLabel", appConfig.getPrivacy());
        }

        Theme theme = (Theme) x.get("theme");
        if ( theme != null ) {
          if ( ! SafetyUtil.isEmpty(url) ) {
            templateArgs.put("logo", url + "/" + theme.getLogo());
            templateArgs.put("largeLogo", url + "/" + theme.getLargeLogo());
          }
          templateArgs.put("appName", theme.getAppName());
          // Temporary color until token support is added for email
          templateArgs.put("theme.primary1", theme.getPrimary1());
          templateArgs.put("theme.primary2", theme.getPrimary2());
          templateArgs.put("theme.primary3", theme.getPrimary3());
          templateArgs.put("theme.primary4", theme.getPrimary4());
          templateArgs.put("theme.primary5", theme.getPrimary5());
          templateArgs.put("theme.white", theme.getWhite());
          templateArgs.put("theme.black", theme.getBlack());
          
          SupportConfig supportConfig = theme.getSupportConfig();
          if ( supportConfig != null ) {
            // supportConfig.EmailConfig
            EmailConfig emailConfig = supportConfig.getEmailConfig();
            if ( emailConfig != null ) {
              // REPLY TO:
              if ( ! SafetyUtil.isEmpty(emailConfig.getReplyTo()) ) {
                emailMessage.setReplyTo(emailConfig.getReplyTo());
              }
              // DISPLAY NAME:
              if ( ! SafetyUtil.isEmpty(emailConfig.getDisplayName()) ) {
                emailMessage.setDisplayName(emailConfig.getDisplayName());
              }
              // FROM:
              if ( ! SafetyUtil.isEmpty(emailConfig.getFrom()) ) {
                emailMessage.setFrom(emailConfig.getFrom());
              }
            }

            // SupportConfig
            foam.nanos.auth.Address address = supportConfig.getSupportAddress();
            templateArgs.put("supportAddress", address == null ? "" : address.toSummary());
            templateArgs.put("supportPhone", supportConfig.getSupportPhone());
            templateArgs.put("supportEmail", supportConfig.getSupportEmail());
            templateArgs.put("supportLogo", supportConfig.getSupportLogo());

            // personal support user
            User psUser = supportConfig.findPersonalSupportUser(getX());
            templateArgs.put("personalSupportPhone", psUser == null ? "" : psUser.getPhoneNumber());
            templateArgs.put("personalSupportEmail", psUser == null ? "" : psUser.getEmail());
            templateArgs.put("personalSupportFirstName", psUser == null ? "" : psUser.getFirstName());
            templateArgs.put("personalSupportFullName", psUser == null ? "" : psUser.getLegalName());
          }
        }
        
        // system
        templateArgs.put("hostname", System.getProperty("hostname", "localhost"));
        emailMessage.setTemplateArguments(templateArgs);

        return emailMessage;
      `
    }
  ]
});
