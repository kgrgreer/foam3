foam.CLASS({
  package: 'net.nanopay.auth.token',
  name: 'AbstractTokenService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'net.nanopay.auth.token.TokenService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.Calendar',
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
  t.printStackTrace();
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
  return true;
} catch (Throwable t) {
  t.printStackTrace();
  return false;
}`
    },
    {
      name: 'generateExpiryDate',
      javaReturns: 'java.util.Date',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(java.util.Calendar.DAY_OF_MONTH, 1);
return calendar.getTime();`
    }
  ]
});
