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
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions',
    'net.nanopay.crunch.registration.BusinessDetailData',
    'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
    'net.nanopay.crunch.registration.SigningOfficerList',
    'net.nanopay.crunch.registration.UserRegistrationData',
    'net.nanopay.crunch.registration.UserDetailData',
    'net.nanopay.crunch.registration.UserDetailExpandedData',
    'net.nanopay.flinks.FlinksAuth',
    'net.nanopay.flinks.FlinksResponseService',
    'net.nanopay.flinks.model.AddressModel',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
    'net.nanopay.flinks.model.FlinksResponse',
    'net.nanopay.flinks.model.LoginModel',
    'net.nanopay.flinks.model.HolderModel',
    'net.nanopay.meter.compliance.secureFact.SecurefactOnboardingService',
    'net.nanopay.model.SigningOfficer',
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

        // When a user has not been explicitly set, attempt to resolve the loginId against previous calls
        if ( ! flinksLoginId.getSkipLoginIdResolution() && flinksLoginId.getUser() == 0 ) {

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
        if ( flinksLoginId instanceof FlinksLoginIdOnboarding )
        {
          FlinksLoginIdOnboarding flinksLoginIdOnboarding = (FlinksLoginIdOnboarding) flinksLoginId;
          
          if ( user == null ) {
            // Create the user when they do not exist

            onboarding(x, flinksLoginIdOnboarding, accountDetail, loginDetail);
            
            // Retrieve the user and the business
            user = flinksLoginId.findUser(x);
            business = flinksLoginId.findBusiness(x);
            
            // User must exist
            if ( user == null ) {
              throw new RuntimeException("User not provisioned: " + flinksLoginId.getUser());
            }
          
          } else {
            // Retrieve any missing capabilities from previous calls with this Flinks LoginId

            // API CAD Personal Payments Under 1000CAD Capability ID
            String capabilityId = "F3DCAF53-D48B-4FA5-9667-6A6EC58C54FD";
                
            // Switch contexts to the newly created user
            Subject newSubject = new Subject.Builder(x).setUser(user).build();
            if ( flinksLoginIdOnboarding.getType() != OnboardingType.PERSONAL && business != null ) {
              newSubject.setUser(business);

              // Business CAD payments capability
              capabilityId = "18DD6F03-998F-4A21-8938-358183151F96";
            } 
            X subjectX = x.put("subject", newSubject);

            DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
            addCapabilityPayload(x, flinksLoginIdOnboarding, (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId));
          }
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
        DAO accountDAO = (DAO) x.get("accountDAO");

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
        HolderModel holder = accountDetail.getHolder();  
        UserOverrideData overrides = null;
        if ( request.getFlinksOverrides() != null ) overrides = request.getFlinksOverrides().getUserOverrides();
        String userEmail = overrides != null && !SafetyUtil.isEmpty(overrides.getEmail()) ?
          overrides.getEmail() : holder.getEmail();

        Subject subject = (Subject) x.get("subject");
        DAO userDAO = (DAO) x.get("localUserDAO");
        User user = new User.Builder(x)
          .setEmail(userEmail)
          .setUserName(userEmail)
          .setDesiredPassword(java.util.UUID.randomUUID().toString())
          .setEmailVerified(true)
          .setGroup("sme")
          .setSpid(subject.getRealUser().getSpid())
          .build();
        user = (User) userDAO.put(user);
        
        // Save the UserId on the request
        request.setUser(user.getId());

        // Switch contexts to the newly created user
        Subject newSubject = new Subject.Builder(x).setUser(user).build();
        X subjectX = getX().put("subject", newSubject);

        AddressModel holderAddress = holder.getAddress();        
        Address address = overrides != null && overrides.getAddress() != null ?
          overrides.getAddress() : 
          new Address.Builder(subjectX)
            .setStructured(false)
            .setAddress1(holderAddress.getCivicAddress())
            .setRegionId(holderAddress.getProvince())
            .setCountryId(holderAddress.getCountry())
            .setCity(holderAddress.getCity())
            .setPostalCode(holderAddress.getPostalCode())
            .build();

        String fullName = holder.getName();
        String nameSplit[] = fullName.split(" ", 2);
        String first = nameSplit.length > 0 ? nameSplit[0] : fullName;
        String last  = nameSplit.length > 1 ? nameSplit[1] : null;
        String firstName = overrides != null && !SafetyUtil.isEmpty(overrides.getFirstName()) ? overrides.getFirstName() : first;
        String lastName = overrides != null && !SafetyUtil.isEmpty(overrides.getLastName()) ? overrides.getLastName() : last;
        String phoneNumber = overrides != null && !SafetyUtil.isEmpty(overrides.getPhoneNumber()) ? overrides.getPhoneNumber() : holder.getPhoneNumber().replaceAll("[^0-9]", "");

        // API CAD Personal Payments Under 1000CAD Capability ID
        final String capabilityId = "F3DCAF53-D48B-4FA5-9667-6A6EC58C54FD";
        
        // Add capabilities for the new user
        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        CapabilityPayload missingPayloads = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId);

        Map<String,FObject> userCapabilityDataObjects = missingPayloads.getCapabilityDataObjects();
        UserDetailData userData = new UserDetailData.Builder(subjectX)
          .setFirstName(firstName)
          .setLastName(lastName)
          .setPhoneNumber(phoneNumber)
          .setAddress(address)
          .build();
        PersonalOnboardingTypeData onboardingTypeData = new PersonalOnboardingTypeData.Builder(subjectX)
          .setUser(user.getId())
          .setFlinksLoginType(loginDetail.getType())
          .setRequestedOnboardingType(request.getType())
          .build();

        // Update properties in the map
        userCapabilityDataObjects.put("User Details", userData);
        userCapabilityDataObjects.put("Personal Onboarding Type", onboardingTypeData);
        
        // Resubmit the capability payload
        CapabilityPayload userCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId(capabilityId)
          .setCapabilityDataObjects(userCapabilityDataObjects)
          .build();
        userCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(userCapPayload);

        // Query the capabilityPayloadDAO to see what capabilities are still required
        addCapabilityPayload(x, request, (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId));
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
        User user = request.findUser(x);
        if ( user == null ) {
          throw new RuntimeException("User not found for business setup");
        }

        // Switch contexts to the newly created user
        Subject newSubject = new Subject.Builder(x).setUser(user).build();
        X subjectX = getX().put("subject", newSubject);

        HolderModel holder = accountDetail.getHolder();
        AddressModel holderAddress = holder.getAddress();        
        Address address = new Address.Builder(subjectX)
          .setStructured(false)
          .setAddress1(holderAddress.getCivicAddress())
          .setRegionId(holderAddress.getProvince())
          .setCountryId(holderAddress.getCountry())
          .setCity(holderAddress.getCity())
          .setPostalCode(holderAddress.getPostalCode())
          .build();

        // Check for overrides
        BusinessOverrideData overrides = null;
        if ( request.getFlinksOverrides() != null ) overrides = request.getFlinksOverrides().getBusinessOverrides();
        String businessName = overrides != null && !SafetyUtil.isEmpty(overrides.getBusinessName()) ?
          overrides.getBusinessName() : holder.getName();
        String businessEmail = overrides != null && !SafetyUtil.isEmpty(overrides.getEmail()) ?
          overrides.getEmail() : holder.getEmail();
        Address businessAddress = overrides != null && overrides.getAddress() != null ?
          overrides.getAddress() : address;
        Address mailingAddress = overrides != null && overrides.getMailingAddress() != null ?
          overrides.getMailingAddress() : businessAddress;
        String phoneNumber = overrides != null && !SafetyUtil.isEmpty(overrides.getPhoneNumber()) ? 
          overrides.getPhoneNumber() : user.getPhoneNumber();

        // Create business with minimal information
        Business business = new Business.Builder(x)
          .setBusinessName(businessName)
          .setOrganization(businessName)
          .setSpid(user.getSpid())
          .build();
        DAO localUserDAO = (DAO) subjectX.get("localUserDAO");
        business = (Business) localUserDAO.inX(subjectX).put(business);

        // Switch to business context
        Subject currentSubject = (Subject) subjectX.get("subject");
        currentSubject.setUser(business);
        subjectX = subjectX.put("subject", currentSubject);

        // Set the business on the request
        request.setBusiness(business.getId());

        BusinessDetailData businessDetailData = new BusinessDetailData.Builder(subjectX)
          .setBusinessName(businessName)
          .setPhoneNumber(phoneNumber)
          .setAddress(businessAddress)
          .setMailingAddress(mailingAddress)
          .setEmail(businessEmail)
          .build();
        
        // Create the capabilities data map
        Map<String,FObject> businessCapabilityDataObjects = new HashMap<>();
        businessCapabilityDataObjects.put("Business Onboarding Details", businessDetailData);

        // Business creation capability
        CapabilityPayload businessCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId("EC535109-E9C0-4B5D-8D24-31282EF72F8F")
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        businessCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(businessCapPayload);

        // Retrieve the updated business
        business = (Business) localUserDAO.inX(subjectX).find(business);
        if ( business == null ) {
          throw new RuntimeException("Failed to create business during onboarding with Flinks");
        }
        
        // Business CAD payments capability
        String capabilityId = "18DD6F03-998F-4A21-8938-358183151F96";
        CapabilityPayload missingPayloads = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId);
        businessCapabilityDataObjects = missingPayloads.getCapabilityDataObjects();

        SecurefactOnboardingService securefactOnboardingService = (SecurefactOnboardingService) subjectX.get("securefactOnboardingService");
        if ( securefactOnboardingService == null ) {
          throw new RuntimeException("Cannot find securefactOnboardingService");
        }
      
        // Fill the capability data objects from SecureFact LEV
        securefactOnboardingService.retrieveLEVCapabilityPayloads(subjectX, business, businessCapabilityDataObjects);

        // Add current user as signing officer
        SigningOfficerList signingOfficerList = (SigningOfficerList) businessCapabilityDataObjects.get("Signing Officers");
        if ( signingOfficerList == null) {
          signingOfficerList = new SigningOfficerList.Builder(subjectX).setBusiness(business.getId()).build();
          businessCapabilityDataObjects.put("Signing Officers", signingOfficerList);
        }
        addSigningOfficerToList(subjectX, user, business, signingOfficerList);

        businessCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId(capabilityId)
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        businessCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(businessCapPayload);

        // Query the capabilityPayloadDAO to see what capabilities are still required
        addCapabilityPayload(x, request, (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId));
      `
    },
    {
      name: 'addCapabilityPayload',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginIdOnboarding' },
        { name: 'capabilityPayload', type: 'CapabilityPayload' }
      ],
      javaCode: `
        // Skip adding if the capability payload is empty
        if ( capabilityPayload == null ) {
          return;
        }

        // Copy the array and add the new entry
        int size = request.getCapabilityPayloads() == null ? 0 : request.getCapabilityPayloads().length;
        CapabilityPayload[] capabilityPayloadArray = new CapabilityPayload[size + 1];
        if ( size > 0 ) {
          System.arraycopy(request.getCapabilityPayloads(), 0, capabilityPayloadArray, 0, size);
        }
        capabilityPayloadArray[capabilityPayloadArray.length - 1] = capabilityPayload;
        request.setCapabilityPayloads(capabilityPayloadArray);
      `
    },
    {
      name: 'addSigningOfficerToList',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'User' },
        { name: 'business', type: 'Business' },
        { name: 'signingOfficerList', type: 'SigningOfficerList' }
      ],
      javaCode: `
        SigningOfficer match = null;
        for ( SigningOfficer signingOfficer : signingOfficerList.getSigningOfficers() ) {
          // Check if the signing officer has already been added
          if ( signingOfficer.getUser() == user.getId() ) {
            return;
          }
          
          if ( match == null &&
               SafetyUtil.equals(user.getFirstName(), signingOfficer.getFirstName()) &&
               SafetyUtil.equals(user.getLastName(), signingOfficer.getLastName()) )
          {
            match = signingOfficer;
          }
        }

        if ( match != null ) {
          match.setUser(user.getId());
        } else {
          SigningOfficer signingOfficer = new SigningOfficer.Builder(x)
            .setFirstName(user.getFirstName())
            .setLastName(user.getLastName())
            .setPosition(user.getJobTitle())
            .setSource("FLINKS")
            .setUser(user.getId())
            .build();
          
          // Add the signing officer to current list of signing officers
          int size = signingOfficerList.getSigningOfficers() == null ? 0 : signingOfficerList.getSigningOfficers().length;
          SigningOfficer[] signingOfficersArray = new SigningOfficer[size + 1];
          if ( size > 0 ) {
            System.arraycopy(signingOfficerList.getSigningOfficers(), 0, signingOfficersArray, 0, size);
          }
          signingOfficersArray[signingOfficersArray.length - 1] = signingOfficer;
          signingOfficerList.setSigningOfficers(signingOfficersArray);
        }
      `
    }
  ]
});
