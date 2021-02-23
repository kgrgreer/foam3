/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'DAO tokenDAO?'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.session.Session',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.time.temporal.ChronoUnit',
    'java.util.Date',
    'java.util.UUID',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'LACKS_SERVICE_PERMISSION',
      value: "You don't have permission to run authenticationToken service.",
      type: 'String'
    },
    {
      name: 'LACKS_SESSION_CREATE_PERMISSION',
      value: "You don't have permission to create a session for that user.",
      type: 'String'
    }
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
          throw new AuthorizationException(LACKS_SERVICE_PERMISSION);
        }

        DAO localUserDAO = (DAO) x.get("localUserDAO");
        user = (User) localUserDAO.find(user);
        if ( user == null ) {
          throw new RuntimeException("User not found");
        }

        // Check session.create.<spid> permission to create the authentication token
        if ( ! auth.check(x, "session.create." + user.getSpid()) ) {
          throw new AuthorizationException(LACKS_SESSION_CREATE_PERMISSION);
        }

        String tokenUUID = (String) parameters.remove("data");
        if ( tokenUUID == null ) {
          tokenUUID = UUID.randomUUID().toString();
        }

        DAO tokenDAO = (DAO) getTokenDAO();
        Token token = (Token) tokenDAO.put(
          new Token.Builder(x)
            .setUserId(user.getId())
            .setExpiry(generateExpiryDate())
            .setData(tokenUUID)
            .setParameters(parameters)
            .build()
        );

        String callbackUrl = (String) parameters.get("callbackUrl");
        if ( ! SafetyUtil.isEmpty(callbackUrl) ) {
          tokenDAO.where(
            EQ(Token.ID, token.getId())
          ).select(new HTTPSink(callbackUrl, foam.nanos.http.Format.JSON));
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

        // Find user from token
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User userResult = (User) localUserDAO.find(tokenResult.getUserId());

        if ( userResult == null ) {
          throw new RuntimeException("User not found");
        }

        // Update user/agent of the current session
        DAO localSessionDAO = (DAO) x.get("localSessionDAO");
        Session session = new Session();
        session.copyFrom(x.get(Session.class));
        session.setUserId(userResult.getId());
        Long businessId = (Long) tokenResult.getParameters().get("businessId");
        if ( businessId > 0 ) {
          session.setUserId(businessId);
          session.setAgentId(userResult.getId());
        }

        try {
          session = (Session) localSessionDAO.put(session);
          session.setContext(session.applyTo(session.getContext()));

          // Mark the token as processed
          tokenResult.setProcessed(true);
          tokenDAO.put(tokenResult);
          return true;
        } catch (Exception e) {
          ((Logger) x.get("logger")).error(
            String.format(
              "Failed to process authentication token with id %d.",
              tokenResult.getId()
            ), e);
          return false;
        }
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
