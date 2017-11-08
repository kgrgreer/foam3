foam.CLASS({
  package: 'net.nanopay.auth.password',
  name: 'ResetPasswordTokenService',
  extends: 'net.nanopay.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for reset password',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'net.nanopay.auth.token.Token',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`try {
  DAO userDAO = (DAO) getX().get("userDAO");
  DAO tokenDAO = (DAO) getX().get("tokenDAO");

  Sink sink = new ListSink();
  sink = userDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))
     .limit(1).select(sink);

  List list = ((ListSink) sink).getData();
  if ( list == null || list.size() == 0 ) {
    throw new Exception("User not found");
  }

  user = (User) list.get(0);
  if ( user == null ) {
    throw new Exception("User not found");
  }

  Token token = new Token();
  token.setUserId(user.getId());
  token.setExpiry(generateExpiryDate());
  token.setData(UUID.randomUUID().toString());
  token = (Token) tokenDAO.put(token);

  EmailService email = (EmailService) getX().get("email");
  EmailMessage message = new EmailMessage();
  message.setFrom("info@nanopay.net");
  message.setReplyTo("noreply@nanopay.net");
  message.setTo(new String[] { user.getEmail() });
  message.setSubject("Your password reset instructions");

  HashMap<String, Object> args = new HashMap<>();
  args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
  args.put("link", "http://localhost:8080/resetPassword?token=" + token.getData());

  email.sendEmailFromTemplate(message, "reset-password-mintchip", args);
  return true;
} catch (Throwable t) {
  t.printStackTrace();
  return false;
}`
    },
    {
      name: 'processToken',
      javaCode: 'return true;'
    }
  ]
});
