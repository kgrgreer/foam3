/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'NanopayResetPasswordTokenService',
  extends: 'foam.nanos.auth.resetPassword.ResetPasswordTokenService',

  documentation: 'Implementation of Token Service used for reset password for nanopay Users',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Email',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode:
`
Logger logger = (Logger) x.get("logger");
AppConfig appConfig = (AppConfig) x.get("appConfig");

// The context passed to us won't have a user in it because obviously the user
// isn't logged in if they're resetting their password. However, decorators on
// DAOs we access down the line from here will want to use the user from the
// context. Therefore we put the system user in the context here so that
// decorators down the line won't throw NPEs when trying to access the user in
// the context.
User systemUser = (User) getX().get("user");
x = x.put("user", systemUser);

DAO userDAO = (DAO) getX().get("localUserUserDAO");
DAO tokenDAO = (DAO) getTokenDAO();
String url = appConfig.getUrl()
    .replaceAll("/$", "");

// check if email invalid
if ( user == null || ! Email.isValid(user.getEmail()) ) {
  throw new RuntimeException("Invalid Email");
}

Sink sink = new ArraySink();
sink = userDAO.where(
  MLang.AND(
    MLang.EQ(User.EMAIL, user.getEmail()),
    MLang.EQ(User.LOGIN_ENABLED, true)
  )).select(sink);

List list = ((ArraySink) sink).getArray();
if ( list == null || list.size() == 0 ) {
  throw new RuntimeException("User not found");
}

// Take first user, but report that other's matched.
user = null;
for ( Object u : list ) {
  if ( user == null ) {
    user = (User) u;
  } else {
    logger.warning(this.getClass().getSimpleName(), "generateTokenWithParameters", "multiple valid users found for", user.getEmail(), (User) u);
    // TODO: generate NOC message.
  }
}
if ( user == null ) {
  throw new RuntimeException("User not found");
}

Token token = new Token();
token.setUserId(user.getId());
token.setExpiry(generateExpiryDate());
token.setData(UUID.randomUUID().toString());
token = (Token) tokenDAO.put(token);

EmailMessage message = new EmailMessage();
message.setTo(new String[] { user.getEmail() });

HashMap<String, Object> args = new HashMap<>();
args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
args.put("link", url +"?token=" + token.getData() + "#reset");

EmailsUtility.sendEmailFromTemplate(x, user, message, "reset-password", args);
return true;`
    },
  ]
});
