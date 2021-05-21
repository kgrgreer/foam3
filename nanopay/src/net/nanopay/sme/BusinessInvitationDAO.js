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
  package: 'net.nanopay.sme',
  name: 'BusinessInvitationDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Business invitation DAO is responsible for checking if the invitation is sent
    to an external or internal user. Internal Users will receive a notification &
    email allowing them to join the business. External Users will receive an
    email which will redirect them to the sign up portal and take them through
    the necessary steps to join a business.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.token.Token',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.auth.email.EmailWhitelistEntry',
    'net.nanopay.business.JoinBusinessTokenService',
    'net.nanopay.model.Business',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',

    'java.net.URLEncoder',
    'java.util.*',

    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'ADD_PERMISSION_ERROR_MSG', message: 'You don\'t have the ability to add users to this business' },
    { name: 'DUPLICATE_INVITATION_ERROR_MSG', message: 'Invitation already exists' },
    { name: 'ENCODING_ERROR_MSG', message: 'Error encoding the email or business name' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public BusinessInvitationDAO(X x, DAO delegate) {
            super(x, delegate);
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        Business business = null;

        // Check is user is a business,
        // Requirement: there was a point where user was not a business and
        // was incorrectly stopping execution with a cast exception
        // User was system before binding to user(business)
        if ( (Business.class).isInstance(user) ) {
          business = (Business) user;
        } else {
          return super.put_(x, obj);
        }

        // AUTH CHECK
        AuthService auth = (AuthService) x.get("auth");
        String addBusinessPermission = "business.add." + business.getBusinessPermissionId() + ".*";
        if ( ! auth.check(x, addBusinessPermission) ) {
          throw new AuthorizationException(ADD_PERMISSION_ERROR_MSG);
        }

        Invitation invite = (Invitation) obj.fclone();
        invite.setEmail(invite.getEmail().toLowerCase());

        Invitation existingInvite = (Invitation) getDelegate().inX(getX()).find(
          OR(
            EQ(Invitation.ID, invite.getId()),
            AND(
              EQ(Invitation.EMAIL, invite.getEmail()),
              EQ(Invitation.CREATED_BY, invite.getCreatedBy())
            )
          )
        );

        invite.setCreatedBy(business.getId());

        if ( existingInvite != null ) {
          if ( invite.getStatus() == InvitationStatus.COMPLETED ) {
            invite.setId(existingInvite.getId());
            return super.put_(x, invite);
          }

          if ( ! invite.getIsRequiredResend() ) {
            // Log duplicate invites.
            Logger logger = (Logger) x.get("logger");
            logger.warning(String.format("Invitation with id %d already exists.", invite.getId()));
            throw new RuntimeException(DUPLICATE_INVITATION_ERROR_MSG);
          } else { // cancel the existing invite
            getDelegate().remove(existingInvite);
          }
        }

        // Associated the business into the param. Add group type (admin, employee)
        Map tokenParams = new HashMap();
        tokenParams.put("businessId", business.getId());
        tokenParams.put("group", invite.getGroup());
        tokenParams.put("inviteeEmail", invite.getEmail());
        tokenParams.put("isSigningOfficer", invite.getIsSigningOfficer());

        // Create token for user registration
        DAO tokenDAO = ((DAO) x.get("localTokenDAO")).inX(x);

        Token token = new Token();
        Date today  = new Date();
        long oneMonth = 1000l*60l*60l*24l*30l;
        token.setExpiry(new Date(today.getTime() + oneMonth));
        token.setParameters(tokenParams);
        String tokenData = UUID.randomUUID().toString();
        token.setData(tokenData);
        token = (Token) tokenDAO.put(token);

        invite.setTokenData(tokenData);

        if ( invite.getInternal() ) {
          // Inviting a user who's already on our platform to join a business.
          invite.setStatus(InvitationStatus.SENT);
          JoinBusinessTokenService joinBusiness = (JoinBusinessTokenService) x.get("joinBusinessToken");
          HashMap<String, Object> parameters = new HashMap<>();
          parameters.put("businessId", business.getId());
          parameters.put("group", invite.getGroup());
          parameters.put("inviteeEmail", invite.getEmail());
          parameters.put("isSigningOfficer", invite.getIsSigningOfficer());
          DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
          User invitee = (User) localUserDAO.find(invite.getInviteeId());
          joinBusiness.generateTokenWithParameters(x, invitee, parameters);
        } else {
          // Inviting a user who's not on our platform to join a business.
          sendInvitationEmail(x, business, invite);
        }

        invite.setIsRequiredResend(false);
        invite.setTimestamp(new Date());
        return super.put_(x, invite);
      `
    },
    {
      name: 'sendInvitationEmail',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Business', name: 'business' },
        { type: 'Invitation', name: 'invite' }
      ],
      documentation: `
        Send an email inviting the recipient to join a Business in Ablii. This only
        handles inviting users that aren't on our platform yet.
        @param x The context.
        @param business The business they will join.
        @param invite The invitation object.
      `,
      javaCode: `
        User agent = ((Subject) x.get("subject")).getRealUser();
        Logger logger = (Logger) getX().get("logger");

        Group group = agent.findGroup(x);
        AppConfig appConfig = group.getAppConfig(x);
        String url = appConfig.getUrl();

        // Create the email message
        EmailMessage message = new EmailMessage.Builder(x)
            .setTo(new String[]{invite.getEmail()})
            .build();
        HashMap<String, Object> args = new HashMap<>();
        args.put("inviterName", agent.getFirstName());
        args.put("business", business.toSummary());
        args.put("sendTo", invite.getEmail());

        // Encoding business name and email to handle special characters.
        String encodedBusinessName, encodedEmail, encodedFirstName, encodedLastName, encodedJobTitle, encodedPhoneNumber;
        try {
          encodedEmail =  URLEncoder.encode(invite.getEmail(), "UTF-8");
          encodedBusinessName = URLEncoder.encode(business.getBusinessName(), "UTF-8");
          encodedFirstName =  URLEncoder.encode(invite.getFirstName(), "UTF-8");
          encodedLastName = URLEncoder.encode(invite.getLastName(), "UTF-8");
          encodedJobTitle = URLEncoder.encode(invite.getJobTitle(), "UTF-8");
          encodedPhoneNumber = URLEncoder.encode(invite.getPhoneNumber(), "UTF-8");
        } catch(Exception e) {
          logger.error(ENCODING_ERROR_MSG, e);
          throw new RuntimeException(e);
        }

        String country = ((foam.nanos.auth.Address)business.getAddress()).getCountryId();

        url += "?token=" + invite.getTokenData();
        if ( country != null ) url += "&country=" + country;
        url += "&email=" + encodedEmail + "&companyName=" + encodedBusinessName + "&firstName=" + encodedFirstName
          + "&lastName=" + encodedLastName + "&jobTitle=" + encodedJobTitle + "&phone=" + encodedPhoneNumber
          + "&businessId=" + business.getId() + "#sign-up";
        args.put("link", url);
        EmailsUtility.sendEmailFromTemplate(x, business, message, "join-business-external", args);
      `
    }
  ]
});

