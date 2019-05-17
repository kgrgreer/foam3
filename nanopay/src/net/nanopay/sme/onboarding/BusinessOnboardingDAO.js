foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    This decorator handles adding and updating business information including
    business address, signing officer and benifical officer.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.ComplianceStatus',
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

        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
        DAO businessInvitationDAO = ((DAO) x.get("businessInvitationDAO"));

        Business business = businessOnboarding.findBusinessId(x);
        User user = businessOnboarding.findUserId(x);

        // * Step 4+5: Signing officer
        user.setJobTitle(businessOnboarding.getJobTitle());
        user.setPhone(businessOnboarding.getPhone());
        
        // If the user is the signing officer
        if ( businessOnboarding.getSigningOfficer() ) {
          user.setBirthday(businessOnboarding.getBirthday());
          user.setAddress(businessOnboarding.getAddress());

          // Agreenments (tri-party, dual-party & PEP/HIO)
          user.setPEPHIORelated(businessOnboarding.getPEPHIORelated());
          user.setThirdParty(businessOnboarding.getThirdParty());
          business.setDualPartyAgreement(businessOnboarding.getDualPartyAgreement());

          localUserDAO.put(user);
          // Set the signing officer junction between the user and the business
          business.getSigningOfficers(x).add(user);
        } else {
          // If the user needs to invite the signing officer
          String signingOfficerEmail = businessOnboarding.getSigningOfficerEmail();

          Invitation invitation = new Invitation();
          /**
           * Summary: the group set in the invitation obj is not the final(real) group 
           * that the signing office will get after signing up with the invitation email.
           * It is a string saved in the token that will passed into the NewUserCreateBusinessDAO class.
           * The group of the new signing officer will generate in the NewUserCreateBusinessDAO class.
           * 
           * Details: After we set the group in the invitation obj, we put the invitation
           * into the businessInvitationDAO service.
           * 
           * In the BusinessOnboardingDAO service, it has a decorator called businessInvitationDAO.
           * In the put_ method of businessInvitationDAO.java,
           * it basically set up a token which contains the group information which is the temp string: 'admin'
           * 
           * When the user signs up with the signing officer invitation email,
           * the app will call the smeBusinessRegistrationDAO service.
           * In the smeBusinessRegistrationDAO service, it has a decorator called NewUserCreateBusinessDAO.
           * 
           * In NewUserCreateBusinessDAO.java, it generates the business specific group
           * in the format of: businessName+businessId.admin. (such as: nanopay8010.admin).
           */
          invitation.setGroup("admin");
          invitation.setCreatedBy(business.getId());
          invitation.setEmail(signingOfficerEmail);

          // Send invitation to email to the signing officer
          businessInvitationDAO.put(invitation);
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
        suggestedUserTransactionInfo.setBaseCurrency("CAD");
        suggestedUserTransactionInfo.setAnnualRevenue(businessOnboarding.getAnnualRevenue());
        suggestedUserTransactionInfo.setAnnualDomesticVolume(businessOnboarding.getAnnualDomesticVolume());
        suggestedUserTransactionInfo.setTransactionPurpose(businessOnboarding.getTransactionPurpose());
        suggestedUserTransactionInfo.setAnnualDomesticTransactionAmount("N/A");

        // If user enters the other transaction purpose
        if ( businessOnboarding.getOtherTransactionPurpose().equals("Others") &&
          ! SafetyUtil.isEmpty(businessOnboarding.getOtherTransactionPurpose()) ) {
          suggestedUserTransactionInfo.setOtherTransactionPurpose(businessOnboarding.getOtherTransactionPurpose());
        }

        business.setTargetCustomers(businessOnboarding.getTargetCustomers());
        business.setSuggestedUserTransactionInfo(suggestedUserTransactionInfo);

        // * Step 7: Percent of ownership
        BeneficialOwner[] beneficialOwnersArray = businessOnboarding.getBeneficialOwners();
        for ( BeneficialOwner beneficialOwner: beneficialOwnersArray ) {
          business.getBeneficialOwners(x).put(beneficialOwner);
        }

        business.setOnboarded(true);

        if ( business.getCompliance().equals(ComplianceStatus.NOTREQUESTED) ) {
          business.setCompliance(ComplianceStatus.REQUESTED);
        }

        localBusinessDAO.put(business);
        return getDelegate().put_(x, obj);
      `
    }
  ]
});
