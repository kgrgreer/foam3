foam.CLASS({
  package: 'net.nanopay.auth.password',
  name: 'ResetPasswordTokenService',
  extends: 'net.nanopay.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for reset password',

  imports: [
    'email',
    'tokenDAO',
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.email.EmailService',
    'foam.util.Password',
    'net.nanopay.auth.token.Token',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();

Sink sink = new ListSink();
sink = userDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))
   .limit(1).select(sink);

List list = ((ListSink) sink).getData();
if ( list == null || list.size() == 0 ) {
  throw new RuntimeException("User not found");
}

user = (User) list.get(0);
if ( user == null ) {
  throw new RuntimeException("User not found");
}

Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailService email = (EmailService) getEmail();
EmailMessage message = new EmailMessage();
message.setFrom("info@nanopay.net");
message.setReplyTo("noreply@nanopay.net");
message.setTo(new String[] { user.getEmail() });
message.setSubject("Your password reset instructions");

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", "http://localhost:8080/static/NANOPAY/nanopay/src/net/nanopay/index.html#reset?token=" + token.getData());

email.sendEmailFromTemplate(message, "reset-password-mintchip", args);
return true;`
    },
    {
      name: 'processToken',
      javaCode:
`DAO userDAO = (DAO) getLocalUserDAO();
DAO tokenDAO = (DAO) getTokenDAO();
Calendar calendar = Calendar.getInstance();

Sink sink = new ListSink();
sink = tokenDAO.where(MLang.AND(
  MLang.EQ(Token.PROCESSED, false),
  MLang.GT(Token.EXPIRY, calendar.getTime()),
  MLang.EQ(Token.DATA, token)
)).limit(1).select(sink);

List data = ((ListSink) sink).getData();
if ( data == null || data.size() == 0 ) {
  throw new RuntimeException("Token not found");
}

// set token processed to true
Token tokenResult = (Token) data.get(0);
tokenResult.setProcessed(true);
tokenDAO.put(tokenResult);

User userResult = (User) userDAO.find(tokenResult.getUserId());
if ( userResult == null ) {
  throw new RuntimeException("User not found");
}

String newPassword = user.getPassword();
if ( ! Password.isValid(newPassword) ) {
  throw new RuntimeException("Invalid password");
}

// update user's password
userResult.setPasswordLastModified(Calendar.getInstance().getTime());
userResult.setPreviousPassword(userResult.getPassword());
userResult.setPassword(Password.hash(newPassword));
userDAO.put(userResult);
return true;`
    }
  ]
});
