foam.CLASS({
  package: 'net.nanopay.business',
  name: 'JoinBusinessTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Token service for adding people to businesses.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.model.Business',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.UUID',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        try {
          DAO tokenDAO = (DAO) x.get("tokenDAO");
          AppConfig appConfig = (AppConfig) x.get("appConfig");
          String url = appConfig.getUrl().replaceAll("/$", "");

          Token token = new Token.Builder(x)
            .setUserId(user.getId())
            .setExpiry(generateExpiryDate())
            .setData(UUID.randomUUID().toString())
            .setParameters(parameters)
            .build();

          token = (Token) tokenDAO.put(token);

          EmailMessage message = new EmailMessage();
          message.setTo(new String[]{user.getEmail()});

          User business = (User) x.get("user");

          if ( business == null ) throw new AuthenticationException();

          if ( ! (business instanceof Business) ) {
            throw new RuntimeException("Only businesses may invite users to join them.");
          }

          HashMap<String, Object> args = new HashMap<>();
          args.put("inviterName", user.getFirstName());
          args.put("business", business.label());
          args.put("link", url + "/service/joinBusiness?token=" + token.getData() + "&redirect=/" );
          EmailsUtility.sendEmailFromTemplate(x, user, message, "join-business-internal", args);
          return true;
        } catch(Throwable t) {
          Logger logger = (Logger) x.get("logger");
          logger.error(this.getClass().getSimpleName(), "generateTokenWithParameters",t);
          return false;
        }
      `
    },
    {
      name: 'processToken',
      javaCode: `
        DAO tokenDAO = (DAO) x.get("tokenDAO");
        Calendar calendar = Calendar.getInstance();

        FObject result = tokenDAO.find(MLang.AND(
          MLang.EQ(Token.USER_ID, user.getId()),
          MLang.EQ(Token.PROCESSED, false),
          MLang.GT(Token.EXPIRY, calendar.getTime()),
          MLang.EQ(Token.DATA, token)
        ));
        
        if ( result == null ) throw new RuntimeException("Token not found.");

        // Set token processed to true.
        Token t = (Token) result.fclone();
        t.setProcessed(true);
        tokenDAO.put(t);

        // Add the User to the Business.
        Map<String, Object> parameters = (Map) t.getParameters();
        long businessId = (long) parameters.get("businessId");
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        Business business = (Business) localBusinessDAO.inX(x).find(businessId);

        try {
          DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
          UserUserJunction junction = new UserUserJunction.Builder(x)
            .setSourceId(user.getId())
            .setTargetId(business.getId())
            .setGroup(business.getBusinessPermissionId() + "." + (String) parameters.get("group"))
            .build();
          agentJunctionDAO.put(junction);
        } catch (Throwable err) {
          Logger logger = (Logger) x.get("logger");
          logger.debug(String.format("An error occurred while trying to add user %d to business %d.", user.getId(), businessId), err);
          throw err;
        }

        // Mark the invitation as accepted.
        DAO businessInvitationDAO = (DAO) x.get("businessInvitationDAO");
        Invitation invitation = (Invitation) businessInvitationDAO
          .find(
            AND(
              EQ(Invitation.CREATED_BY, businessId),
              EQ(Invitation.EMAIL, user.getEmail())
            )
          ).fclone();
        invitation.setStatus(InvitationStatus.COMPLETED);
        businessInvitationDAO.put(invitation);

        return true;
      `
    }
  ]
});

