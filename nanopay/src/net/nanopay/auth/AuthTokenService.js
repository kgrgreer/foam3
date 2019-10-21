foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'AuthTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for authentication',

  imports: [
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.HTTPSink',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.io.IOException',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.time.temporal.ChronoUnit',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',
    'java.util.UUID',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Int',
      name: 'expiryMs',
      value: 15 * 1000 // 15 seconds
    }
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "service.run.authToken") ) {
          throw new AuthorizationException();
        }
        
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        user = (User) localUserDAO.find(user);
        if ( user == null ) {
          throw new RuntimeException("User not found");
        }

        // TODO: check permission to create authToken for other user

        DAO tokenDAO = (DAO) getTokenDAO();
        Token token = (Token) tokenDAO.put(
          new Token.Builder(x)
            .setUserId(user.getId())
            .setExpiry(generateExpiryDate())
            .setData(UUID.randomUUID().toString())
            .setParameters(parameters)
            .build()
        );

        String callbackUrl = (String) parameters.get("callbackUrl");
        if ( ! SafetyUtil.isEmpty(callbackUrl) ) {
          try {
            tokenDAO.where(
              EQ(Token.ID, token.getId())
            ).select(new HTTPSink(callbackUrl, foam.nanos.http.Format.JSON));
          } catch (IOException e) { }
        }
        return true;
      `
    },
    {
      name: 'processToken',
      javaCode: `
        DAO tokenDAO = (DAO) getTokenDAO();
        Calendar calendar = Calendar.getInstance();

        List data = ((ArraySink) tokenDAO.where(AND(
          EQ(Token.PROCESSED, false),
          GT(Token.EXPIRY, calendar.getTime()),
          EQ(Token.DATA, token))
        ).limit(1).select(new ArraySink())).getArray();

        if ( data.size() == 0 ) {
          throw new RuntimeException("Token not found");
        }

        // find user from token
        Token tokenResult = (Token) data.get(0);
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        User userResult = (User) localUserDAO.find(tokenResult.getUserId());

        if ( userResult == null ) {
          throw new RuntimeException("User not found");
        }

        // update the current session
        DAO localSessionDAO = (DAO) x.get("localSessionDAO");
        Session session = x.get(Session.class);
        session.setUserId(userResult.getId());
        Long businessId = (Long) tokenResult.getParameters().get("businessId");
        if ( businessId != null ) {
          session.setUserId(businessId);
          session.setAgentId(userResult.getId());
        }
        localSessionDAO.put(session);
        session.setContext(session.applyTo(session.getContext()));

        // set token processed to true
        tokenResult.setProcessed(true);
        tokenDAO.put(tokenResult);
        return true;
      `
    },
    {
      name: 'generateExpiryDate',
      javaCode: `
        LocalDateTime expiry = LocalDateTime.now().plus(getExpiryMs(), ChronoUnit.MILLIS);
        return Date.from(expiry.atZone(ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});
