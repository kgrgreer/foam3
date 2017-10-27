foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenService',
  extends: 'net.nanopay.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'java.util.HashMap'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`String token = super.generateToken(user);
if ( token == null ) {
  return null;
}

EmailService email = (EmailService) getX().get("email");
EmailMessage message = new EmailMessage();
message.setFrom("info@nanopay.net");
message.setReplyTo("noreply@nanopay.net");
message.setTo(new String[] { user.getEmail() });
message.setSubject("MintChip email verification");

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", "http://localhost:8080/verifyEmail?userId=" + user.getId() + "&token=" + token);

email.sendEmailFromTemplate(message, "welcome-mintchip", args);
return token;`
    },
    {
      name: 'processToken',
      javaCode:
`if ( ! super.processToken(user, token) ) {
  return false;
}

try {
  // set user email verified to true
  DAO userDAO = (DAO) getX().get("userDAO");
  user.setEmailVerified(true);
  userDAO.put(user);
  return true;
} catch (Throwable t) {
  t.printStackTrace();
  return false;
}`
    }
  ]
});
