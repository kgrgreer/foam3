foam.CLASS({
  package: 'net.nanopay.onboarding.email',
  name: 'UserCompliancePassEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for sending email notification to user
      when nanopay team has verified and passed compliance on this individual.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = (Logger) getX().get("logger");

      // Checks if User exists.
      User user = (User) obj;

      if ( user == null || user.getId() == 0 )
        return getDelegate().put_(x, obj);

      if ( user instanceof Business )
        return getDelegate().put_(x, obj);

      // Checks if User has existed which is really just a duplicate check of user.getId() == 0, or at least it should.
      User oldUser = (User) getDelegate().find(user.getId());
      if ( oldUser == null )
        return getDelegate().put_(x, obj);

      // Make sure to only send on compliance status change to PASSED.
      // compliance status.FAILED will take a different route, currently undefined requirements
      if ( (ComplianceStatus.REQUESTED != oldUser.getCompliance() && ComplianceStatus.FAILED != oldUser.getCompliance() && ComplianceStatus.NOTREQUESTED != oldUser.getCompliance()) || ComplianceStatus.PASSED != user.getCompliance() )
        return getDelegate().put_(x, obj);

      // Check user property, need email to be verified to send an email.
      if ( ! user.getEmailVerified() ) {
        logger.error(String.format("user(id=%1$d) has had Compliance status changed to %2$s but is unable to be notified due to user's email is not yet verified.", user.getId(), user.getCompliance()));
        return getDelegate().put_(x, obj);
      }

      user = (User) getDelegate().put_(x , obj);

      EmailMessage            message      = new EmailMessage();
      Map<String, Object>     args         = new HashMap<>();
      Group                   group        = (Group) user.findGroup(x);
      AppConfig               appConfig    = group.getAppConfig(x);

      String url = appConfig.getUrl().replaceAll("/$", "");

      message.setTo(new String[]{user.getEmail()});
      args.put("business", user.label());
      args.put("link",     url);

      message.setTo(new String[]{user.getEmail()});
      args.put("business",        user.label());
      args.put("link",   url + "#sme.main.dashboard");

      try {
        EmailsUtility.sendEmailFromTemplate(x, user, message, "compliance-notification-to-user", args);
      } catch (Exception e) {
        logger.error("Error sending compliance-notification-to-user email.", e);
      }

      return user;
      `
    }
  ]
});
