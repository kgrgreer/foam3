foam.CLASS({
  refines: 'foam.nanos.auth.email.EmailTokenService',
  methods: [
    {
      name: 'generateToken',
      javaCode:
`try {
DAO tokenDAO = (DAO) getX().get("tokenDAO");
DAO userDAO = (DAO) getX().get("localUserDAO");
AppConfig appConfig = (AppConfig) getX().get("appConfig");
String url = appConfig.getUrl()
    .replaceAll("/$", "");

System.out.println("url = " + url);

Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailService email = (EmailService) getX().get("email");
EmailMessage message = new EmailMessage();
message.setTo(new String[]{user.getEmail()});

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
} catch(Throwable t) {
  t.printStackTrace();
  return false;
}`
  }
  ]
});
