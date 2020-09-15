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
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.nanos.logger.Logger',
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
    'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
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
        Logger logger = (Logger) x.get("logger");
        Subject subject = (Subject) x.get("subject");

        FlinksAuth flinksAuth = (FlinksAuth) x.get("flinksAuth");
        FlinksResponseService flinksResponseService = (FlinksResponseService) x.get("flinksResponseService");

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;

        // When a user has not been explicitly set
        if ( flinksLoginId.getUser() == 0 ) {

          // Check if we have seen the Flinks LoginId before, using the user and business previously provisioned
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
          throw new RuntimeException("Flinks bank account not found.");
        }
        LoginModel loginDetail = flinksDetailResponse.getLogin();
        if ( loginDetail == null ) {
          logger.warning("Unexpected behaviour - No login section found in FlinksResponse for loginId: " + flinksLoginId.getLoginId());
        }

        // Find the user and business if they already exist
        User user = flinksLoginId.findUser(x);
        if ( user == null && flinksLoginId.getUser() != 0 ) {
          throw new RuntimeException("User not found: " + flinksLoginId.getUser());
        }
        Business business = flinksLoginId.findBusiness(x);
        if ( business == null && flinksLoginId.getBusiness() != 0 ) {
          throw new RuntimeException("Business not found: " + flinksLoginId.getBusiness());
        }

        // Create the user if this is an onboarding request
        if ( user == null && flinksLoginId instanceof FlinksLoginIdOnboarding )
        {
          onboarding(x, (FlinksLoginIdOnboarding) flinksLoginId, accountDetail, loginDetail);
          
          // Retrieve the user
          user = flinksLoginId.findUser(x);
          if ( user == null ) {
            throw new RuntimeException("User not provisioned: " + flinksLoginId.getUser());
          }
          business = flinksLoginId.findBusiness(x);
        } else if ( user == null ) {
          throw new RuntimeException("User is required to add a bank account");
        }

        // Set bank account owner to business, if it exists
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
        { name: 'accountDetail', type: 'AccountWithDetailModel' },
        { name: 'loginDetail', type: 'LoginModel' }
      ],
      javaCode: `
        // Determine onboarding type
        OnboardingType onboardingType = request.getType();
        if ( onboardingType == OnboardingType.DEFAULT ) {
          if ( loginDetail == null ) {
            throw new RuntimeException("Flinks login information not found. Cannot determine onboarding type automatically.");
          }

          // Determine onboarding type
          if ( SafetyUtil.equals(loginDetail.getType(), "Personal") ) {
            onboardingType = OnboardingType.PERSONAL;
          }
          else if ( SafetyUtil.equals(loginDetail.getType(), "Business") ) {
            onboardingType = OnboardingType.BUSINESS;
          }

          if ( onboardingType == OnboardingType.DEFAULT ) {
            throw new RuntimeException("Cannot determine onboarding type with login type: " + loginDetail.getType());
          }
        }

        if ( onboardingType == OnboardingType.PERSONAL ) {
          onboardUser(x, request, accountDetail, loginDetail);
        }
        else if ( onboardingType == OnboardingType.BUSINESS ) {
          onboardUser(x, request, accountDetail, loginDetail);
          onboardBusiness(x, request, accountDetail);
        }
        else {
          throw new RuntimeException("Unexpected onboarding type: " + request.getType());
        }
      `
    },
    {
      name: 'onboardUser',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' },
        { name: 'loginDetail', type: 'LoginModel' }
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
        PersonalOnboardingTypeData onboardingTypeData = new PersonalOnboardingTypeData.Builder(subjectX)
          .setUser(newUser.getId())
          .setFlinksLoginType(loginDetail.getType())
          .build();

        userCapabilityDataObjects.put("AbliiPrivacyPolicy", privacyPolicy);
        userCapabilityDataObjects.put("AbliiTermsAndConditions", termsAndConditions);
        userCapabilityDataObjects.put("User Details", userData);
        userCapabilityDataObjects.put("Simple User Onboarding", null);
        userCapabilityDataObjects.put("Personal Onboarding Type", onboardingTypeData);
        userCapabilityDataObjects.put("API CAD Personal Payments Under 1000CAD", null);

        // API CAD Personal Payments Under 1000CAD Capability ID
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

        User user = request.findUser(x);
        if ( user == null ) {
          throw new RuntimeException("User not found for business setup");
        }

        // Switch contexts to the newly created user
        Subject newSubject = new Subject.Builder(x).setUser(newUser).build();
        X subjectX = getX().put("subject", newSubject);

        HolderModel holder = accountDetail.getHolder();
        AddressModel holderAddress = holder.getAddress();

        BusinessDetailData businessDetailData = new BusinessDetailData.Builder(subjectX)
          .setBusinessName(holder.getName())
          .setPhoneNumber(user.getPhoneNumber())
          .setAddress(user.getAddress())
          .setMailingAddress(user.getAddress())
          .setEmail(holder.getEmail())
          .build();
        
        // Create the capabilities data map
        Map<String,FObject> businessCapabilityDataObjects = new HashMap<>();
        businessCapabilityDataObjects.put("Business Onboarding Details", businessDetailData);

        CapabilityPayload businessCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId("EC535109-E9C0-4B5D-8D24-31282EF72F8F")
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        capabilityPayloadDAO.inX(subjectX).put(businessCapPayload);

        // TODO: Query LEV
        // TODO: Get business type (sole, corp, etc.)
        // TODO: Get signing officers
        // TODO: Get directors
        // TODO: Get owners
      `
    }
  ]
});
