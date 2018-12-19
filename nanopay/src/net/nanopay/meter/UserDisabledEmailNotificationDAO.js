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
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        if (
          oldUser != null
          && oldUser.getEnabled()
          && !newUser.getEnabled()
        ) {
          EmailService email = (EmailService) x.get("email");
          EmailMessage message = new EmailMessage();
          Map<String, Object> args = new HashMap<>();

          message.setTo(new String[] { newUser.getEmail() });
          args.put("name", newUser.getFirstName());

          try{
            email.sendEmailFromTemplate(x, newUser, message, "user-is-disabled", args);
          } catch (Throwable t) {
            (x.get(Logger.class)).error("Error sending user is disabled email.", t);
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
