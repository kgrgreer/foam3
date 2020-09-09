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
  package: 'net.nanopay.flinks.external',
  name: 'FlinksLoginIdDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for processing FlinksLoginId requests.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AgentAuthService',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyDirectorsListed',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.DualPartyAgreementCAD',
    'net.nanopay.crunch.onboardingModels.BusinessDirectorsData',
    'net.nanopay.crunch.onboardingModels.BusinessInformationData',
    'net.nanopay.crunch.onboardingModels.BusinessOwnershipData',
    'net.nanopay.crunch.onboardingModels.CertifyDataReviewed',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
    'net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData',
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion',
    'net.nanopay.crunch.onboardingModels.TransactionDetailsData',
    'net.nanopay.crunch.registration.UserRegistrationData',
    'net.nanopay.crunch.registration.UserDetailData',
    'net.nanopay.flinks.FlinksAuth',
    'net.nanopay.flinks.FlinksResponseService',
    'net.nanopay.flinks.model.AddressModel',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
    'net.nanopay.flinks.model.FlinksResponse',
    'net.nanopay.flinks.model.LoginModel',
    'net.nanopay.flinks.model.HolderModel',
    'net.nanopay.model.Business',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Subject subject = (Subject) x.get("subject");

        FlinksAuth flinksAuth = (FlinksAuth) x.get("flinksAuth");
        FlinksResponseService flinksResponseService = (FlinksResponseService) x.get("flinksResponseService");

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;

        List oldRecords = ((ArraySink) getDelegate().where(AND(
            EQ(FlinksLoginId.LOGIN_ID, flinksLoginId.getLoginId()),
            NEQ(FlinksLoginId.USER, 0)
          ))
          .limit(1)
          .select(new foam.dao.ArraySink())).getArray();
        if ( oldRecords.size() == 1 ) {
          FlinksLoginId previousFlinksLoginId = (FlinksLoginId) oldRecords.get(0);
          flinksLoginId.setUser(previousFlinksLoginId.getUser());
          flinksLoginId.setBusiness(previousFlinksLoginId.getBusiness());
        }
        
        FlinksResponse flinksResponse = (FlinksResponse) flinksResponseService.getFlinksResponse(x, flinksLoginId);
        if ( flinksResponse == null ) {
          throw new RuntimeException("Flinks failed to provide a valid response when provided with login ID: " + flinksLoginId.getLoginId());
        }
        
        
        FlinksResponse flinksAuthResponse = flinksAuth.getAccountSummary(x, flinksResponse.getRequestId(), subject.getUser());
        while ( flinksAuthResponse.getHttpStatusCode() == 202 ) {
          flinksAuthResponse = flinksAuth.pollAsync(x, flinksAuthResponse.getRequestId(), subject.getUser());
        }
        if ( flinksAuthResponse.getHttpStatusCode() != 200 ) {
          throw new RuntimeException("Flinks failed to provide valid account detials " + flinksAuthResponse);
        }
        FlinksAccountsDetailResponse flinksDetailResponse = (FlinksAccountsDetailResponse) flinksAuthResponse;
        flinksLoginId.setFlinksAccountsDetails(flinksDetailResponse.getId());

        AccountWithDetailModel accountDetail = selectBankAccount(x, flinksLoginId, flinksDetailResponse);
        if ( accountDetail == null ) {
          throw new RuntimeException("Bank account not found.");
        }

        // Find the user and business if they already exist
        User user = flinksLoginId.findUser(x);
        Business business = flinksLoginId.findBusiness(x);

        // Create the user if this is an onboarding request
        if ( user == null )
        {
          if ( flinksLoginId instanceof FlinksLoginIdOnboarding ) {
            FlinksLoginIdOnboarding flinksLoginIdOnboarding = (FlinksLoginIdOnboarding)flinksLoginId;
            onboarding(x, flinksLoginIdOnboarding, accountDetail);
            user = flinksLoginIdOnboarding.findUser(x);
            business = flinksLoginIdOnboarding.findBusiness(x);
          } else if ( subject.getUser() instanceof Business ) {
            user = subject.getRealUser();
            business = (Business) subject.getUser();
          } else {
            user = subject.getUser();
          }
        }

        User owner = (business != null) ? business : user;
        BankAccount bankAccount = findBankAccount(x, owner, flinksLoginId, accountDetail);
        if ( bankAccount == null ) {
          // Create the bank account owned by the business if it exists, otherwise by the user
          bankAccount = createBankAccount(x, owner, flinksLoginId, accountDetail);
        }
        flinksLoginId.setAccount(bankAccount.getId());

        return super.put_(x, flinksLoginId);
      `
    },
    {
      name: 'selectBankAccount',
      type: 'AccountWithDetailModel',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'flinksDetailResponse', type: 'FlinksAccountsDetailResponse' }
      ],
      javaCode: `
        AccountWithDetailModel accountDetail = null;
        AccountWithDetailModel firstCADAccountDetail = null;

        // Get the account details for the given accountId
        AccountWithDetailModel[] accounts = flinksDetailResponse.getAccounts();
        for ( int i = 0; i < accounts.length; i++ ) {
          AccountWithDetailModel account = accounts[i];
          if ( account.getCurrency().equals("CAD") && firstCADAccountDetail == null ) {
            firstCADAccountDetail = account;
          }
          if ( !SafetyUtil.isEmpty(request.getAccountId()) && SafetyUtil.equals(request.getAccountId(), account.getId()) ) {
            accountDetail = account;
          }

          // Break out of loop early if we've found the right accounts already
          if ( accountDetail != null && firstCADAccountDetail != null ) break;
        }

        // Use first Canadian bank account if accountId cannot be found
        if ( accountDetail == null ) {
          accountDetail = firstCADAccountDetail;
        }

        return accountDetail;
        `
      },
      {
        name: 'createBankAccount',
        type: 'BankAccount',
        args: [
          { name: 'x', type: 'Context' },
          { name: 'owner', type: 'User' },
          { name: 'request', type: 'FlinksLoginId' },
          { name: 'accountDetail', type: 'AccountWithDetailModel' }
        ],
        javaCode: `
        AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
        DAO accountDAO = (DAO) x.get("accountDAO");
        
        // Act as the owner to create the bank account
        agentAuth.actAs(x, owner);

        // Do not allow a bank account in an other currency
        if ( !accountDetail.getCurrency().equals("CAD") ) {
          throw new RuntimeException("Only Canadian dollar bank accounts are supported. Currency of account selected: " + accountDetail.getCurrency());
        }

        CABankAccount bankAccount = new CABankAccount.Builder(x)
          .setOwner(owner.getId())
          .setAccountNumber(accountDetail.getAccountNumber())
          .setBranchId(accountDetail.getTransitNumber())
          .setDenomination(accountDetail.getCurrency())
          .setInstitutionNumber(accountDetail.getInstitutionNumber())
          .setName(accountDetail.getTitle())
          .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
          .setVerifiedBy("FLINKS")
          .build();

        return (BankAccount) accountDAO.put(bankAccount);
      `
    },
    {
      name: 'findBankAccount',
      type: 'BankAccount',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'owner', type: 'User' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' }
      ],
      javaCode: `
      DAO accountDAO = (DAO) x.get("accountDAO");
      
      return (BankAccount) accountDAO.find(AND(
        INSTANCE_OF(CABankAccount.class),
        EQ(BankAccount.ACCOUNT_NUMBER, accountDetail.getAccountNumber()),
        EQ(BankAccount.BRANCH_ID, accountDetail.getTransitNumber()),
        EQ(BankAccount.INSTITUTION_NUMBER, accountDetail.getInstitutionNumber()),
        EQ(BankAccount.OWNER, owner.getId()),
        EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE)
      ));
    `
  },
  {
      name: 'onboarding',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' }
      ],
      javaCode: `
        // Check if the user already exists by cross referencing the loginId
        User user = request.findUser(x);
        Business business = request.findBusiness(x);

        if ( request.getType() == OnboardingType.PERSONAL ) {
          onboardUser(x, request, accountDetail);
        }
        else if ( request.getType() == OnboardingType.BUSINESS ) {
          // Create the user
          if ( user == null ) {
            onboardUserForBusiness(x, request, accountDetail);
          }

          // Create the business
          if ( business == null ) {
            onboardBusiness(x, request, accountDetail);
          }
        }
        else {
          throw new RuntimeException("Expected onboarding type: " + request.getType());
        }
      `
    },
    {
      name: 'onboardUser',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' }
      ],
      javaCode: `
        Subject subject = (Subject) x.get("subject");
        DAO userDAO = (DAO) x.get("localUserDAO");
        HolderModel holder = accountDetail.getHolder();
        User newUser = new User.Builder(x)
          .setEmail(holder.getEmail())
          .setUserName(holder.getEmail())
          .setDesiredPassword(java.util.UUID.randomUUID().toString())
          .setEmailVerified(true)
          .setGroup("personal")
          .setSpid(subject.getRealUser().getSpid())
          .build();
        newUser = (User) userDAO.put(newUser);
        
        // Save the UserId on the request
        request.setUser(newUser.getId());

        // Switch contexts to the newly created user
        Subject newSubject = new Subject.Builder(x).setUser(newUser).build();
        X subjectX = getX().put("subject", newSubject);

        AddressModel holderAddress = holder.getAddress();        
        Address address = new Address.Builder(subjectX)
          .setAddress1(holderAddress.getCivicAddress())
          .setRegionId(holderAddress.getProvince())
          .setCountryId(holderAddress.getCountry())
          .setCity(holderAddress.getCity())
          .setPostalCode(holderAddress.getPostalCode())
          .build();

        String fullName = holder.getName();
        String nameSplit[] = fullName.split(" ", 2);
        String firstName = nameSplit[0];
        String lastName = nameSplit[1];
        String phoneNumber = holder.getPhoneNumber().replaceAll("[^0-9]", "");

        // Add capabilities for the new user
        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        Map<String,FObject> userCapabilityDataObjects = new HashMap<>();
        AbliiPrivacyPolicy privacyPolicy = new AbliiPrivacyPolicy.Builder(subjectX)
          .setAgreement(false)
          .build();
        AbliiTermsAndConditions termsAndConditions = new AbliiTermsAndConditions.Builder(subjectX)
          .setAgreement(false)
          .build();
        UserDetailData userData = new UserDetailData.Builder(subjectX)
          .setFirstName(firstName)
          .setLastName(lastName)
          .setPhoneNumber(phoneNumber)
          .setAddress(address)
          .build();

        userCapabilityDataObjects.put("AbliiPrivacyPolicy", privacyPolicy);
        userCapabilityDataObjects.put("AbliiTermsAndConditions", termsAndConditions);
        userCapabilityDataObjects.put("User Details", userData);
        userCapabilityDataObjects.put("Simple User Onboarding", null);
        userCapabilityDataObjects.put("API CAD User Payments Under 1000CAD", null);

        // API CAD User Payments Under 1000CAD Capability ID
        String capabilityId = "F3DCAF53-D48B-4FA5-9667-6A6EC58C54FD";
        CapabilityPayload userCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId(capabilityId)
          .setCapabilityDataObjects(userCapabilityDataObjects)
          .build();
        userCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(userCapPayload);

        // Query the capabilityPayloadDAO to see what capabilities are still required
        CapabilityPayload missingPayloads = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId);

        // set the remain capabilities to be satisfied
        request.setMissingUserCapabilityDataObjects(missingPayloads.getCapabilityDataObjects());
      `
    },
    {
      name: 'onboardUserForBusiness',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' }
      ],
      javaCode: `
        AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
        DAO capabilityPayloadDAO = (DAO) x.get("capabilityPayloadDAO");
        DAO smeUserRegistrationDAO = (DAO) x.get("smeUserRegistrationDAO");
          
        HolderModel holder = accountDetail.getHolder();
        AddressModel holderAddress = holder.getAddress();

        Address address = new Address.Builder(x)
          .setAddress1(holderAddress.getCivicAddress())
          .setRegionId(holderAddress.getProvince())
          .setCountryId(holderAddress.getCountry())
          .setCity(holderAddress.getCity())
          .setPostalCode(holderAddress.getPostalCode())
          .build();

        String fullName = holder.getName();
        String nameSplit[] = fullName.split(" ", 2);
        String firstName = nameSplit[0];
        String lastName = nameSplit[1];
        String phoneNumber = holder.getPhoneNumber().replaceAll("[^0-9]", "");

        User newUser = new User.Builder(x)
          .setFirstName(firstName)
          .setLastName(lastName)
          .setLegalName(fullName)
          .setEmail(holder.getEmail())
          .setUserName(holder.getEmail())
          .setAddress(address)
          .setPhoneNumber(phoneNumber)
          .setDesiredPassword(java.util.UUID.randomUUID().toString())
          .setEmailVerified(true)
          .build();
        newUser = (User) smeUserRegistrationDAO.put(newUser);
        
        // Save the UserId on the request
        request.setUser(newUser.getId());

        // Switch contexts to the newly created user
        agentAuth.actAs(x, newUser);

        // Add capabilities for the new user
        Map<String,FObject> userCapabilityDataObjects = new HashMap<>();
        AbliiPrivacyPolicy privacyPolicy = new AbliiPrivacyPolicy.Builder(x)
          .setAgreement(true)
          .build();
        AbliiTermsAndConditions termsAndConditions = new AbliiTermsAndConditions.Builder(x)
          .setAgreement(true)
          .build();
        UserRegistrationData registrationData = new UserRegistrationData.Builder(x)
          .setFirstName(newUser.getFirstName())
          .setLastName(newUser.getLastName())
          .setPhone(newUser.getPhoneNumber())
          .build();

        // userCapabilityDataObjects.put("AbliiPrivacyPolicy", privacyPolicy);
        // userCapabilityDataObjects.put("AbliiTermsAndConditions", termsAndConditions);
        userCapabilityDataObjects.put("User Registration", registrationData);
        userCapabilityDataObjects.put("Nanopay Admission", null);
        userCapabilityDataObjects.put("API Onboarding User and Business", null);

        CapabilityPayload userCapPayload = new CapabilityPayload.Builder(x)
          .setId("B98D97EE-4A43-4B03-84C1-9DE2C0109E87")
          .setCapabilityDataObjects(new HashMap<String,FObject>(userCapabilityDataObjects))
          .build();
        userCapPayload = (CapabilityPayload) capabilityPayloadDAO.put(userCapPayload);

        // Query the capabilityPayloadDAO to see what capabilities are still required
        CapabilityPayload missingPayloads = (CapabilityPayload) capabilityPayloadDAO.find("B98D97EE-4A43-4B03-84C1-9DE2C0109E87");

        // set the remain capabilities to be satisfied
        request.setMissingUserCapabilityDataObjects(missingPayloads.getCapabilityDataObjects());
      `
    },
    {
      name: 'onboardBusiness',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' }
      ],
      javaCode: `
        AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
        DAO accountDAO = (DAO) x.get("accountDAO");
        DAO businessDAO = (DAO) x.get("businessDAO");
        DAO capabilityPayloadDAO = (DAO) x.get("capabilityPayloadDAO");

        Map<String,FObject> businessCapabilityDataObjects = new HashMap<>();

        User user = request.findUser(x);
        if ( user == null ) {
          throw new RuntimeException("User not found for business setup");
        }

        HolderModel holder = accountDetail.getHolder();
        AddressModel holderAddress = holder.getAddress();

        InitialBusinessData initialBusinessData = new InitialBusinessData.Builder(x)
          .setCompanyPhone(user.getPhoneNumber())
          .setEmail(holder.getEmail())
          .setSignInAsBusiness(false)
          .setAddress(user.getAddress())
          .setMailingAddress(user.getAddress())
          .build();

        // TODO: send this capability in as the user to create the business
        // Query for the business that was created
        Business business = (Business) businessDAO.find(0);
        if ( business != null ) {
          request.setBusiness(business.getId());
        }

        // TODO: actAs the business for the rest of the code in this method

        SigningOfficerQuestion officerQuestion = new SigningOfficerQuestion.Builder(x)
          .setIsSigningOfficer(true)
          .setSigningOfficerEmail(holder.getEmail())
          .setAdminFirstName(user.getFirstName())
          .setAdminLastName(user.getLastName())
          .setAdminPhone(user.getPhoneNumber())
          .build();
        Phone phone = new Phone.Builder(x)
          .setNumber(user.getPhoneNumber())
          .setVerified(true)
          .build();
        SigningOfficerPersonalData soPersonalData = new SigningOfficerPersonalData.Builder(x)
          .setCountryId(holderAddress.getCountry())
          .setAddress(user.getAddress())
          .setPhone(phone)
          .build();

        // TODO: set this with SecureFact LEV API call
        BusinessOwnershipData businessOwnershipData = new BusinessOwnershipData.Builder(x)
          .setAmountOfOwners(1)
          .setPubliclyTraded(false)
          .setOwnerSelectionsValidated(true)
          .build();
        BusinessInformationData businessInfoData = new BusinessInformationData.Builder(x)
          .setBusinessTypeId(1)
          .setBusinessSectorId(1)
          .setOperatingUnderDifferentName(false)
          .build();
        SuggestedUserTransactionInfo txnInfo = new SuggestedUserTransactionInfo.Builder(x)
          .setBaseCurrency(accountDetail.getCurrency())
          .build();
        TransactionDetailsData txnDetailsData = new TransactionDetailsData.Builder(x)
          .setSuggestedUserTransactionInfo(txnInfo)
          .build();
        BusinessDirectorsData businessDirectorsData = new BusinessDirectorsData.Builder(x)
          .setBusinessTypeId(1)
          .build();
        CertifyDirectorsListed certifyDirectorsListed = new CertifyDirectorsListed.Builder(x)
          .setAgreement(true)
          .build();
        CertifyOwnersPercent certifyPercent = new CertifyOwnersPercent.Builder(x)
          .setAgreement(true)
          .build();
        CertifyDataReviewed certifyData = new CertifyDataReviewed.Builder(x)
          .setReviewed(true)
          .build();
        DualPartyAgreementCAD dualPartyAgreement = new DualPartyAgreementCAD.Builder(x)
          .setAgreement(true)
          .build();
        
        // Create the capabilities data map
        businessCapabilityDataObjects.put("Business Registration", initialBusinessData);
        businessCapabilityDataObjects.put("Signing Officer", officerQuestion);
        businessCapabilityDataObjects.put("Business Owner Information", businessOwnershipData);
        businessCapabilityDataObjects.put("CertifyDirectorsListed", certifyDirectorsListed);
        businessCapabilityDataObjects.put("Business Details", businessInfoData);
        businessCapabilityDataObjects.put("Signing Officer Privileges", soPersonalData);
        businessCapabilityDataObjects.put("Signing Officer Date of Birth", null);
        businessCapabilityDataObjects.put("Unlock Domestic Payments and Invoicing", null);
        businessCapabilityDataObjects.put("Transaction Details", txnInfo);
        businessCapabilityDataObjects.put("Business Directors Data", businessDirectorsData);
        businessCapabilityDataObjects.put("CertifyOwnersPercent", certifyPercent);
        businessCapabilityDataObjects.put("DualPartyAgreementCAD", dualPartyAgreement);
        businessCapabilityDataObjects.put("Certify Data Reviewed", certifyData);
        businessCapabilityDataObjects.put("API Onboarding Business Payments (CAD to CAD)", null);

        CapabilityPayload businessCapPayload = new CapabilityPayload.Builder(x)
          .setId("CD499238-7854-4125-A04D-7CE7EE15BC74")
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        capabilityPayloadDAO.put(businessCapPayload);
      `
    }
  ]
});
