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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailConfig',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.session.Session',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        X userX = x;
        User user = ((Subject) x.get("subject")).getUser();
        if ( user != null ) {
          userX = new Session.Builder(x).setUserId(user.getId()).build().applyTo(x);
        }
        AppConfig appConfig = (AppConfig) userX.get("appConfig");
        Theme theme = (Theme) userX.get("theme");
        String spid = (String) userX.get("spid");
        if ( spid == null ) {
          spid = theme.getSpid();
        }

        if ( SafetyUtil.isEmpty(emailMessage.getSpid()) ) {
          emailMessage.setSpid(spid);
        }

        SupportConfig supportConfig = theme.getSupportConfig();
        EmailConfig emailConfig = supportConfig.getEmailConfig();

        // Set ReplyTo, From, DisplayName from support email config
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

        // template name check
        String templateName = (String)templateArgs.get("template");
        if ( SafetyUtil.isEmpty(templateName) ) {
          logger.info("No email template name");
          return emailMessage;
        }

        String url = appConfig.getUrl();
        templateArgs.put("logo", url + "/" + theme.getLogo());
        templateArgs.put("largeLogo", url + "/" + theme.getLargeLogo());
        if ( ! templateArgs.containsKey("link") ) {
          templateArgs.put("link", url);
        }
        templateArgs.put("appLink", url);
        templateArgs.put("appName", theme.getAppName());
        templateArgs.put("locale", user.getLanguage().getCode().toString());
        foam.nanos.auth.Address address = supportConfig.getSupportAddress();
        templateArgs.put("supportAddress", address == null ? "" : address.toSummary());
        templateArgs.put("supportPhone", supportConfig.getSupportPhone());
        templateArgs.put("supportEmail", supportConfig.getSupportEmail());

        // personal support user
        User psUser = supportConfig.findPersonalSupportUser(getX());
        templateArgs.put("personalSupportPhone", psUser == null ? "" : psUser.getPhoneNumber());
        templateArgs.put("personalSupportEmail", psUser == null ? "" : psUser.getEmail());
        templateArgs.put("personalSupportFirstName", psUser == null ? "" : psUser.getFirstName());
        templateArgs.put("personalSupportFullName", psUser == null ? "" : psUser.getLegalName());

        // system
        templateArgs.put("hostname", System.getProperty("hostname", "localhost"));
        emailMessage.setTemplateArguments(templateArgs);

        return emailMessage;
      `
    }
  ]
});
