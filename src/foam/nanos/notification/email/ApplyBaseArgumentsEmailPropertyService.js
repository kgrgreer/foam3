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
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.notification.email.EmailConfig',
    'foam.nanos.app.SupportConfig',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
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
        Theme theme = (Theme) x.get("theme");
        User user = ((Subject) x.get("subject")).getUser();
        String spid = null;
        AppConfig appConfig = (AppConfig) x.get("appConfig");

        if ( user != null ) {
          appConfig = user.findGroup(x).getAppConfig(x);
          spid = user.getSpid();
        }

        if ( theme == null
          || ( user != null && ! user.getSpid().equals(x.get("spid")) )
        ) {
          theme = ((Themes) x.get("themes")).findTheme(x);
        }

        if ( spid == null ) {
          spid = theme.getSpid();
        }

        if ( SafetyUtil.isEmpty(emailMessage.getSpid()) ) {
          emailMessage.setSpid(user.getSpid());
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

        String url = appConfig.getUrl().replaceAll("/$", "");
        templateArgs.put("logo", (url + "/" + theme.getLogo()));
        templateArgs.put("largeLogo", (url + "/" + theme.getLargeLogo()));
        templateArgs.put("appLink", url);
        templateArgs.put("appName", (theme.getAppName()));
        templateArgs.put("locale", user.getLanguage().getCode().toString());

        foam.nanos.auth.Address address = supportConfig.getSupportAddress();
        templateArgs.put("supportAddress", address == null ? "" : address.toSummary());
        templateArgs.put("supportPhone", (supportConfig.getSupportPhone()));
        templateArgs.put("supportEmail", (supportConfig.getSupportEmail()));

        // personal support user
        User psUser = supportConfig.findPersonalSupportUser(x);
        templateArgs.put("personalSupportPhone", psUser == null ? "" : psUser.getPhoneNumber());
        templateArgs.put("personalSupportEmail", psUser == null ? "" : psUser.getEmail());
        templateArgs.put("personalSupportFirstName", psUser == null ? "" : psUser.getFirstName());
        templateArgs.put("personalSupportFullName", psUser == null ? "" : psUser.getLegalName());
        emailMessage.setTemplateArguments(templateArgs);

        return emailMessage;
      `
    }
  ]
});
