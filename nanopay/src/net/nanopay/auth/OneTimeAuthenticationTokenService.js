foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'OneTimeAuthenticationTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: `Implementation of Token Service used for creating a
    short-lived, single-use (aka. one-time) tokens that allow clients to
    authenticate as a given user.

    One use case is to generate a single-use token that can be included in a
    link's URL. The token will allow the user to authenticate when following the
    link.

    The key feature is that the token is single-use, so if the token is
    exposed in the URL in cleartext, an attacker can't re-use it to impersonate
    the user it was meant for.`,

  imports: [
    'tokenDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
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
        if ( ! auth.check(x, "service.run.authenticationToken") ) {
          throw new AuthorizationException();
        }

        DAO localUserDAO = (DAO) x.get("localUserDAO");
        user = (User) localUserDAO.find(user);
        if ( user == null ) {
          throw new RuntimeException("User not found");
        }

        // Check spid.create.<spid> permission to create an authentication token
        if ( ! auth.check(x, "spid.create." + user.getSpid()) ) {
          throw new AuthorizationException();
        }

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
        Token tokenResult = (Token) tokenDAO.find(EQ(Token.DATA, token));

        if ( tokenResult == null ) {
          throw new RuntimeException("Token not found");
        }

        if ( tokenResult.getProcessed() ) {
          throw new RuntimeException("Token has already been used");
        }

        LocalDateTime expiry = tokenResult.getExpiry().toInstant()
          .atZone(ZoneId.systemDefault()).toLocalDateTime();
        if ( expiry.isBefore(LocalDateTime.now()) ) {
          throw new RuntimeException("Token has expired");
        }

        // find user from token
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
        session = (Session) localSessionDAO.put(session);
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
