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
  package: 'net.nanopay.business',
  name: 'JoinBusinessTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Token service for adding people to businesses.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.UUID',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        try {
          DAO tokenDAO = (DAO) x.get("localTokenDAO");
          User agent = ((Subject) x.get("subject")).getRealUser();
          String url = agent.findGroup(x).getAppConfig(x).getUrl();

          Token token = new Token.Builder(x)
            .setUserId(user.getId())
            .setExpiry(generateExpiryDate())
            .setData(UUID.randomUUID().toString())
            .setParameters(parameters)
            .build();

          token = (Token) tokenDAO.put(token);

          EmailMessage message = new EmailMessage();
          message.setTo(new String[]{user.getEmail()});

          User business = ((Subject) x.get("subject")).getUser();

          if ( business == null ) throw new AuthenticationException();

          if ( ! (business instanceof Business) ) {
            throw new RuntimeException("Only businesses may invite users to join them.");
          }

          HashMap<String, Object> args = new HashMap<>();
          args.put("name", user.getFirstName());
          args.put("sendTo", user.getEmail());
          args.put("inviterName", agent.getFirstName());
          args.put("business", business.toSummary());
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
        DAO tokenDAO = (DAO) x.get("localTokenDAO");
        Calendar calendar = Calendar.getInstance();

        FObject result = tokenDAO.find(AND(
          EQ(Token.USER_ID, user.getId()),
          EQ(Token.PROCESSED, false),
          GT(Token.EXPIRY, calendar.getTime()),
          EQ(Token.DATA, token)
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
        boolean isSigningOfficer = parameters.containsKey("isSigningOfficer") ? (boolean) parameters.get("isSigningOfficer") : false;

        try {
          DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
          UserUserJunction junction = new UserUserJunction.Builder(x)
            .setSourceId(user.getId())
            .setTargetId(business.getId())
            .setGroup(business.getBusinessPermissionId() + "." + (String) parameters.get("group"))
            .build();
          agentJunctionDAO.put(junction);

          DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");
          BusinessUserJunction soJunction = new BusinessUserJunction.Builder(x)
            .setSourceId(business.getId())
            .setTargetId(user.getId())
            .build();
          signingOfficerJunctionDAO.put(soJunction);
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
    },
    {
      name: 'generateExpiryDate',
      type: 'Date',
      javaCode: `
      Calendar cal = Calendar.getInstance();
      cal.add(Calendar.MONTH, 1);
      return cal.getTime();
      `
    }
  ]
});
