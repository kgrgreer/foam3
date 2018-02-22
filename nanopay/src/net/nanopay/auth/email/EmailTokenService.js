foam.CLASS({
  refines: 'foam.nanos.auth.email.EmailTokenService',
  methods: [
    {
      name: 'generateToken',
      javaCode:
`try {
DAO tokenDAO = (DAO) getX().get("tokenDAO");
DAO userDAO = (DAO) getX().get("userDAO");
AppConfig appConfig = (AppConfig) getX().get("appConfig");
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
if (!user.getInitialEmailedAmount().equals("$0.00")){
  args.put("amount", user.getInitialEmailedAmount());
}
if (user.getType().equals("Business") || user.getType().equals("Merchant")){
  args.put("link", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=/");
}
if (user.getType().equals("Personal")){
  if (user.getPortalAdminCreated()) {
    args.put("applink", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://www.apple.com/lae/ios/app-store/");
    args.put("playlink", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=https://play.google.com/store?hl=en");
  }
  args.put("link", appConfig.getUrl() + "/service/verifyEmail?userId=" + user.getId() + "&token=" + token.getData() + "&redirect=null" );
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
