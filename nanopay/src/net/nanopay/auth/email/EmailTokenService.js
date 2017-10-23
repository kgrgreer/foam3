foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

  implements: [
    'net.nanopay.auth.token.TokenService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ListSink',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'net.nanopay.auth.token.Token',
    'java.util.Calendar',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`try {
  DAO tokenDAO = (DAO) getX().get("tokenDAO");
  Token token = new Token();
  token.setUserId(user.getId());
  token.setExpiry(generateExpiryDate());
  token.setData(UUID.randomUUID().toString());
  return ((Token) tokenDAO.put(token)).getData();
} catch (Throwable t) {
  return null;
}`
    },
    {
      name: 'processToken',
      javaCode:
`try {
  DAO userDAO = (DAO) getX().get("userDAO");
  DAO tokenDAO = (DAO) getX().get("tokenDAO");
  Calendar calendar = Calendar.getInstance();

  Sink sink = new ListSink();
  sink = tokenDAO.where(MLang.AND(
    MLang.EQ(Token.USER_ID, user.getId()),
    MLang.EQ(Token.PROCESSED, false),
    MLang.GT(Token.EXPIRY, calendar.getTime()),
    MLang.EQ(Token.DATA, token)
  )).limit(1).select(sink);

  List data = ((ListSink) sink).getData();
  if (data == null || data.size() == 0) {
    // token not found
    throw new Exception("Token not found");
  }

  // set token processed to true
  Token result = (Token) data.get(0);
  result.setProcessed(true);
  tokenDAO.put(result);

  // set user email verified to true
  user.setEmailVerified(true);
  userDAO.put(user);

  return true;
} catch (Throwable t) {
  return false;
}`
    },
    {
      name: 'generateExpiryDate',
      javaReturns: 'java.util.Date',
      javaCode:
`java.util.Calendar calendar = java.util.Calendar.getInstance();
calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
return calendar.getTime();`
    }
  ]
});
