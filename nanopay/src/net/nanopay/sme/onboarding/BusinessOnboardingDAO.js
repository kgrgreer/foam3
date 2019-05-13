foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.Invitation',
    'net.nanopay.sme.onboarding.BusinessOnboarding',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        BusinessOnboarding businessOnboarding = (BusinessOnboarding) obj;
        // TODO: Please call the java validator of the businessOnboarding here
        // TODO: Please add the condition to handle saving the draft

        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        DAO invitationDAO = (DAO) x.get("businessInvitationDAO");
        DAO beneficialOwnerDAO = (DAO) x.get("beneficialOwnerDAO");

        Business business = businessOnboarding.findBusinessId(x);
        User user = businessOnboarding.findUserId(x);

        // * Step 4+5: Signing officer
        user.setJobTitle(businessOnboarding.getJobTitle());
        user.setPhone(businessOnboarding.getPhone());
        
        // If the user is the signing officer
        if ( businessOnboarding.getSigningOfficer() ) {
          user.setBirthday(businessOnboarding.getBirthday());
          user.setPEPHIORelated(businessOnboarding.getPEPHIORelated());
          user.setThirdParty(businessOnboarding.getThirdParty());
          user.setAddress(businessOnboarding.getAddress());
          localUserDAO.put(user);
          // Set the signing officer junction between the user and the business
          business.getSigningOfficers(x).add(user);
        } else {
          // If the user needs to invite the signing officer
          String signingOfficeEmail = businessOnboarding.getSigningOfficerEmail();

          Invitation invitation = new Invitation();
          invitation.setGroup("admin");
          invitation.setCreatedBy(user.getId());
          invitation.setEmail(signingOfficeEmail);

          // Send invitation to email to the signing officer
          invitationDAO.put(invitation);
        }

        // * Step 6: Business info        
        // Business info: business address
        business.setAddress(businessOnboarding.getBusinessAddress());
        business.setBusinessAddress(businessOnboarding.getBusinessAddress());

        // Business info: business details
        business.setBusinessTypeId(businessOnboarding.getBusinessTypeId());
        business.setBusinessSectorId(businessOnboarding.getBusinessSectorId());
        business.setSourceOfFunds(businessOnboarding.getSourceOfFunds());

        if ( businessOnboarding.getOperatingUnderDifferentName() ) {
          business.setOperatingBusinessName(businessOnboarding.getOperatingBusinessName());
        }

        // Business info: transaction details
        SuggestedUserTransactionInfo suggestedUserTransactionInfo = new SuggestedUserTransactionInfo();
        suggestedUserTransactionInfo.setAnnualTransactionAmount(businessOnboarding.getAnnualTransactionAmount());
        suggestedUserTransactionInfo.setAnnualVolume(businessOnboarding.getAnnualVolume());
        suggestedUserTransactionInfo.setTransactionPurpose(businessOnboarding.getTransactionPurpose());
        business.setSuggestedUserTransactionInfo(suggestedUserTransactionInfo);

        // * Step 7: Percent of ownership
        // If someone owns above 25% of the company
        if ( businessOnboarding.getOwnershipAbovePercent() ) {
          BeneficialOwner[] beneficialOwnersArray = businessOnboarding.getBeneficialOwners();
          for ( BeneficialOwner beneficialOwner: beneficialOwnersArray ) {
            beneficialOwner.setBusiness(business.getId());
            beneficialOwnerDAO.put(beneficialOwner);
          }
        }

        business.setOnboarded(true);
        business.setCompliance(net.nanopay.admin.model.ComplianceStatus.REQUESTED);

        localBusinessDAO.put(business);
        return getDelegate().put_(x, obj);
      `
    }
  ]
});
