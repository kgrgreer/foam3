foam.CLASS({
  package: 'net.nanopay.invite',
  name: 'InvitationTokenService',
  extends: 'foam.nanos.auth.email.EmailTokenService',

  imports: [
    'appConfig',
    'email',
    'localUserDAO',
    'logger',
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',

    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.UUID',
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DAY_OF_MONTH, 14);
return calendar.getTime();`
    },
    {
      name: 'generateToken',
      javaCode:
`try {
  AppConfig config = (AppConfig) getAppConfig();
  EmailService email = (EmailService) getEmail();
  DAO tokenDAO = (DAO) getTokenDAO();
  DAO userDAO = (DAO) getLocalUserDAO();
  String url = config.getUrl()
      .replaceAll("/$", "");

  Token token = new Token();
  token.setUserId(user.getId());
  token.setExpiry(generateExpiryDate());
  token.setData(UUID.randomUUID().toString());
  token = (Token) tokenDAO.put(token);

  EmailMessage message = new EmailMessage.Builder(x)
    .setTo(new String[] { user.getEmail() })
    .build();

  HashMap<String, Object> args = new HashMap<>();
  args.put("name", user.getFirstName());
  args.put("email", user.getEmail());
  args.put("link", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");

  email.sendEmailFromTemplate(user, message, "welcome-email", args);
  user.setPortalAdminCreated(false);
  user.setWelcomeEmailSent(true);
  userDAO.put(user);
  return true;
} catch (Throwable t) {
  ((Logger) getLogger()).error(t);
  return false;
}`
    }
  ]
});
