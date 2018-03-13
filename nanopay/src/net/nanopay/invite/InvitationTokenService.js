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
    'foam.nanos.logger.Logger',
    'java.util.Calendar'
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

  // add app store / play store links
  if (user.getType().equals("Personal")){
    if (user.getPortalAdminCreated()) {
      args.put("applink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://www.apple.com/lae/ios/app-store/");
      args.put("playlink", url + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://play.google.com/store?hl=en");
    }
  }

  String template = (user.getWelcomeEmailSent())? "verifyEmail" : "welcome-email";
  email.sendEmailFromTemplate(user, message, template, args);
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
