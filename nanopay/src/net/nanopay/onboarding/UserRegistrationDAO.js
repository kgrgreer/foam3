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
  package: 'net.nanopay.onboarding',
  name: 'UserRegistrationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.ServiceProviderAwareDAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.token.Token',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'net.nanopay.contacts.Contact',
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion',
    'net.nanopay.model.Business',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus',
    
    'javax.servlet.http.HttpServletRequest',
    'java.util.Date',
    'java.util.Map',
    
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'EMAIL_REQUIRED_ERROR_MSG', message: 'Email required' },
    { name: 'UNKNOWN_TOKEN_ERROR_MSG', message: 'Unknown token' },
    { name: 'INVITATION_EXPIRED_ERROR_MSG', message: 'Invitation expired. Please request a new one' },
    { name: 'EMAIL_NOT_MATCH_INVITED_EMAIL_ERROR_MSG', message: 'Email does not match invited email' },
    { name: 'CANNOT_PROCESS_WO_INVITED_EMAIL_ERROR_MSG', message: 'Cannot process without an invited email' },
    { name: 'BUSINESS_NOT_EXIST_ERROR_MSG', message: 'Business doesn\'t exist' },
    { name: 'BUSINESS_INVITATION_PROCESSED_WHEN_NOT_IN_SENT_STATUS_ERROR_MSG', message: 'Business invitation is not in SENT status but is trying to get processed' },
    { name: 'CAD_US_SUPPORTED_ONLY_ERROR_MSG', message: 'Only Canadian and US businesses supported at this time' },
    { name: 'USER_ALREADY_EXISTS_ERROR_MSG', message: 'User with same email address already exists: ' }
  ],

  properties: [
    {
      class: 'String',
      name: 'group'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'agentJunctionDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'invitationDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'tokenDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'localBusinessDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public UserRegistrationDAO(X x, String group, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setGroup(group);
            setTokenDAO((DAO) x.get("localTokenDAO"));
            setLocalBusinessDAO((DAO) x.get("localBusinessDAO"));
            setInvitationDAO((DAO) x.get("businessInvitationDAO"));
            setAgentJunctionDAO((DAO) x.get("agentJunctionDAO"));
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
        User user = (User) obj;
        Boolean isInternal = false;

        if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
          throw new RuntimeException(EMAIL_REQUIRED_ERROR_MSG);
        }
        String spid = null;
        if ( user != null && SafetyUtil.isEmpty(user.getSpid()) ) {
          Theme theme = ((Themes) x.get("themes")).findTheme(x);
          if ( theme != null &&
                ! SafetyUtil.isEmpty(theme.getSpid()) ) {
            spid = theme.getSpid();
          } else {
            ((foam.dao.DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
            .setName("Theme not found.")
            .setSeverity(foam.log.LogLevel.ERROR)
            .setNote(" Theme not found for user registration when looking for appropriate service provider.")
            .build());
            throw new RuntimeException("Configuration error: Theme not found on user registration");
          }
        }
        user.setGroup(spid + "-" + getGroup());

        // We want the system user to be putting the User we're trying to create. If
        // we didn't do this, the user in the context's id would be 0 and many
        // decorators down the line would fail because of authentication checks.

        // If we want use the system user, then we need to copy the http request/appconfig to system context
        X sysContext = getX()
          .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
          .put("appConfig", x.get("appConfig"));

        // Check the parameters in the signup token
        if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
          Token token = (Token) getTokenDAO().find(EQ(Token.DATA, user.getSignUpToken()));
          user.setEmailVerified(token != null);

          if ( token == null ) {
            throw new RuntimeException(UNKNOWN_TOKEN_ERROR_MSG);
          }

          Date currentDate = new Date();

          // Compare current date with the expiry date
          if ( token.getExpiry() != null && token.getExpiry().before(currentDate) ) {
            throw new RuntimeException(INVITATION_EXPIRED_ERROR_MSG);
          }

          Map<String, Object> params = (Map) token.getParameters();

          // TODO: Why are we doing this here instead of letting PreventDuplicateEmailAction catch this down the line?
          // Check if user is internal ( already a registered user ), which will happen if adding a user to
          // a business.
          isInternal = params.containsKey("internal") && ((Boolean) params.get("internal"));
          if ( ! isInternal ) {
            checkUserDuplication(x, user);
          }

          // Make sure the email which the user is signing up with matches the email the invite was sent to
          if ( params.containsKey("inviteeEmail") ) {
            if ( ! ((String) params.get("inviteeEmail")).equalsIgnoreCase(user.getEmail()) ) {
              Logger logger = (Logger) x.get("logger");
              String warningString = String.format(
                "A user was signing up via an email invitation. The email address we expected them to use was '%s' but the email address of the user in the context was actually '%s'. The user in the context's id was %d.",
                params.get("inviteeEmail"),
                user.getEmail(),
                user.getId()
              );
              logger.warning(warningString);
              throw new RuntimeException(EMAIL_NOT_MATCH_INVITED_EMAIL_ERROR_MSG);
            }
          } else {
            throw new RuntimeException(CANNOT_PROCESS_WO_INVITED_EMAIL_ERROR_MSG);
          }

          if ( params.containsKey("group") && params.containsKey("businessId") ) {
            String group = (String) params.get("group");
            boolean isSigningOfficer = params.containsKey("isSigningOfficer") ? (boolean) params.get("isSigningOfficer") : false;
            long businessId = (long) params.get("businessId");
            UserUserJunction junction;

            if ( businessId != 0 ) {
              Business business = (Business) getLocalBusinessDAO().inX(sysContext).find(businessId);
              if ( business == null ) {
                throw new RuntimeException(BUSINESS_NOT_EXIST_ERROR_MSG);
              }

              // Add AgentJunction
              user = (User) super.put_(sysContext, user);

              // Set up new connection between user and business
              junction = new UserUserJunction.Builder(x)
                .setSourceId(user.getId())
                .setTargetId(business.getId())
                .setGroup(business.getBusinessPermissionId() + "." + group)
                .build();

              getAgentJunctionDAO().inX(sysContext).put(junction);

              // Get a context with the Business in it
              X businessContext = Auth.sudo(sysContext, business);
              if ( isSigningOfficer ) {
                SigningOfficerQuestion soq = new SigningOfficerQuestion.Builder(x)
                  .setIsSigningOfficer(true)
                  .build();
                CrunchService crunchService = (CrunchService) x.get("crunchService");
                Subject subject = new Subject(user);
                subject.setUser(business);
                crunchService.updateUserJunction(sysContext, subject, "554af38a-8225-87c8-dfdf-eeb15f71215f-0", soq, CapabilityJunctionStatus.GRANTED);
              }

              Invitation invitation = (Invitation) getInvitationDAO()
                .inX(businessContext)
                .find(
                  AND(
                    EQ(Invitation.CREATED_BY, businessId),
                    EQ(Invitation.EMAIL, user.getEmail())
                  )
                );
              if ( invitation.getStatus() != InvitationStatus.SENT ) {
                Logger logger = (Logger) x.get("logger");
                logger.warning(BUSINESS_INVITATION_PROCESSED_WHEN_NOT_IN_SENT_STATUS_ERROR_MSG);
              }
              invitation = (Invitation) invitation.fclone();
              invitation.setStatus(InvitationStatus.COMPLETED);
              getInvitationDAO().put(invitation);
            }
            
            // Invalidate Token
            try {
              // Process token
              Token clone = (Token) token.fclone();
              clone.setProcessed(true);
              getTokenDAO().inX(sysContext).put(clone);
            } catch (Exception ignored) { }
          }
        }

        return super.put_(sysContext, user);
      `
    },
    {
      name: 'find_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        // Return an empty sink instead of null to avoid breaking calling code that
        // expects this method to return a sink.
        return new ArraySink();
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'checkUserDuplication',
      type: 'void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'User', name: 'user' }
      ],
      javaCode: `
        User userWithSameEmail = (User) getDelegate()
          .inX(x)
          .find(
            AND(
              EQ(User.EMAIL, user.getEmail()),
              NOT(INSTANCE_OF(Business.getOwnClassInfo())),
              NOT(INSTANCE_OF(Contact.getOwnClassInfo()))
            )
          );
        if ( userWithSameEmail != null ) {
          throw new RuntimeException(USER_ALREADY_EXISTS_ERROR_MSG + user.getEmail());
        }
      `
    }
  ]
});
