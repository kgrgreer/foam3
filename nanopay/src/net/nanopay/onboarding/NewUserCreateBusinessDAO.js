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
  name: 'NewUserCreateBusinessDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    When a new user is signing up and wants to create a business, this decorator
    will create the business for them. Since the user is signing up, they don't
    have a User in the system yet which could create the business. Therefore,
    this decorator creates the business as the system, but makes sure that the
    business is owned by the user, not the system.
  `,

  javaImports: [
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    
    'java.util.List',
    'java.util.Map',
    
    'javax.servlet.http.HttpServletRequest',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.auth.token.Token',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  messages: [
    { name: 'NULL_USER_ERROR_MSG', message: 'Cannot put null' },
    { name: 'ORGANIZATION_REQ_ERROR_MSG', message: 'Organization is required' },
    { name: 'UNABLE_TO_PROCESS_USER_REGISTRATION_ERROR_MSG', message: 'Unable to process user registration' },
    { name: 'NO_BUSINESS_ERROR_MSG', message: 'Business doesn\'t exist' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'localBusinessDAO',
      javaFactory: 'return (DAO) getX().get("localBusinessDAO");'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'agentJunctionDAO',
      javaFactory: 'return (DAO) getX().get("agentJunctionDAO");'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'signingOfficerJunctionDAO',
      javaFactory: 'return (DAO) getX().get("signingOfficerJunctionDAO");'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'tokenDAO',
      javaFactory: 'return (DAO) getX().get("tokenDAO");'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'invitationDAO',
      javaFactory: 'return (DAO) getX().get("invitationDAO");'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public NewUserCreateBusinessDAO(X x, DAO delegate) {
            super(x, delegate);
            setLocalBusinessDAO((DAO) x.get("localBusinessDAO"));
            setAgentJunctionDAO((DAO) x.get("agentJunctionDAO"));
            setSigningOfficerJunctionDAO((DAO) x.get("signingOfficerJunctionDAO"));
            setTokenDAO((DAO) x.get("localTokenDAO"));
            setInvitationDAO((DAO) x.get("businessInvitationDAO"));
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

        if ( user == null ) {
          throw new RuntimeException(NULL_USER_ERROR_MSG);
        }

        if ( SafetyUtil.isEmpty(user.getOrganization()) ) {
          throw new RuntimeException(ORGANIZATION_REQ_ERROR_MSG);
        }

        // We want the system user to be putting the User we're trying to create. If
        // we didn't do this, the user in the context's id would be 0 and many
        // decorators down the line would fail because of authentication checks.

        // If we want use the system user, then we need to copy the http request/appconfig to system context
        X sysContext = getX()
          .put(HttpServletRequest.class, x.get(HttpServletRequest.class))
          .put("appConfig", x.get("appConfig"));

        // Set the user's status to Active so that they can be found in publicUserDAO.
        user.setStatus(AccountStatus.ACTIVE);

        if ( ! SafetyUtil.isEmpty(user.getSignUpToken()) ) {
          // Check if Token exists
          Token token = (Token) getTokenDAO().find(EQ(Token.DATA, user.getSignUpToken()));
          user.setEmailVerified(token != null);

          if ( token == null ) {
            throw new RuntimeException(UNABLE_TO_PROCESS_USER_REGISTRATION_ERROR_MSG);
          }

          Map<String, Object> params = (Map) token.getParameters();

          try {
            // Process token
            Token clone = (Token) token.fclone();
            clone.setProcessed(true);
            getTokenDAO().inX(sysContext).put(clone);
          } catch (Exception ignored) { }

          // There can be different tokens with different parameters used.
          // When adding a user to a business, we'll have the group
          // and businessId parameters set, so check for those here.
          if ( params.containsKey("group") && params.containsKey("businessId") ) {
            String group = (String) params.get("group");
            long businessId = (long) params.get("businessId");
            boolean isSigningOfficer = params.containsKey("isSigningOfficer") ? (boolean) params.get("isSigningOfficer") : false;
            UserUserJunction junction;

            if ( businessId != 0 ) {
              Business business = (Business) getLocalBusinessDAO().inX(sysContext).find(businessId);
              if ( business == null ) {
                throw new RuntimeException(NO_BUSINESS_ERROR_MSG);
              }

              user = (User) super.put_(sysContext, user);

              // Set up new connection between user and business
              junction = new UserUserJunction.Builder(x)
                .setSourceId(user.getId())
                .setTargetId(business.getId())
                .setGroup(business.getBusinessPermissionId() + "." + group)
                .build();

              getAgentJunctionDAO().inX(sysContext).put(junction);

              if ( isSigningOfficer ) {
                getSigningOfficerJunctionDAO().inX(sysContext).put(
                  new BusinessUserJunction.Builder(x)
                    .setSourceId(business.getId())
                    .setTargetId(user.getId())
                    .build());
              }

              // Get a context with the Business in it so we can update the invitation.
              X businessContext = Auth.sudo(sysContext, business);

              // Update the invitation to mark that they joined.
              Invitation invitation = (Invitation) getInvitationDAO()
                .inX(businessContext)
                .find(
                  AND(
                    EQ(Invitation.CREATED_BY, businessId),
                    EQ(Invitation.EMAIL, user.getEmail())
                  )
                ).fclone();
              invitation.setStatus(InvitationStatus.COMPLETED);
              getInvitationDAO().inX(businessContext).put(invitation);

              CreateOnboardingCloneService createOnboardingCloneService = new CreateOnboardingCloneService(sysContext);
              List<Object> onboardings = createOnboardingCloneService.getSourceOnboarding(businessId);

              if ( onboardings.size() > 0 )
                createOnboardingCloneService.putOnboardingClone(sysContext, onboardings, user.getId());

              // Return here because we don't want to create a duplicate business
              // with the same name. Instead, we just want to create(external)/update(internal) the user and
              // add them to an existing business.
              return user;
            }
          }
        }

        // Put the user so that it gets an id.
        // Remove business address collected from signup form.
        Address businessAddress = user.getAddress();
        user.clearAddress();
        user = (User) super.put_(sysContext, obj).fclone();

        assert user.getId() != 0;

        X userContext = Auth.sudo(x, user);

        Business business = new Business.Builder(userContext)
          .setBusinessName(user.getOrganization())
          .setOrganization(user.getOrganization())
          .setAddress(businessAddress)
          .setSpid(user.getSpid())
          .setEmailVerified(true)
          .build();

        getLocalBusinessDAO().inX(userContext).put(business);

        return user;
      `
    }
  ]
});
