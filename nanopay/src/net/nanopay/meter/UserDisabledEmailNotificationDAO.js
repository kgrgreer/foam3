foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'UserDisabledEmailNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for sending email notification
      when user is disabled.`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.admin.model.AccountStatus'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && ! SafetyUtil.equals(oldUser.getStatus(), AccountStatus.DISABLED)
          && SafetyUtil.equals(newUser.getStatus(), AccountStatus.DISABLED)
        ) {
          EmailService email = (EmailService) x.get("email");
          EmailMessage message = new EmailMessage();
          Map<String, Object> args = new HashMap<>();

          message.setTo(new String[] { newUser.getEmail() });
          args.put("name", newUser.getFirstName());

          try {
            email.sendEmailFromTemplate(x, newUser, message, "user-is-disabled", args);
          } catch (Throwable t) {
            ((Logger) x.get("logger")).error("Error sending user is disabled email.", t);
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
