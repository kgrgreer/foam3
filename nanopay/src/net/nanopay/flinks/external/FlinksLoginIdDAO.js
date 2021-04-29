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
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'foam.nanos.dig.exception.ExternalAPIException',
    'foam.nanos.dig.exception.GeneralException',
    'foam.nanos.dig.exception.UnknownIdException',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.NotificationSetting',
    'foam.nanos.notification.EmailSetting',
    'foam.nanos.notification.sms.SMSSetting',
    'foam.nanos.pm.PM',
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
    'net.nanopay.crunch.registration.LimitedAmountCapability',
    'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
    'net.nanopay.crunch.registration.SigningOfficerList',
    'net.nanopay.crunch.registration.BusinessDirectorList',
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
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessDirector',
    'net.nanopay.model.SigningOfficer',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    {
      name: 'BUSINESS_RECEIVING_CAPABILITY_ID',
      type: 'String',
      value: 'crunch.onboarding.api.ca-business-receive-payments'
    },
    {
      name: 'BUSINESS_SENDING_CAPABILITY_ID',
      type: 'String',
      value: 'crunch.onboarding.api.ca-business-send-payments'
    },
    {
      name: 'PERSONAL_SENDING_CAPABILITY_ID',
      type: 'String',
      value: 'crunch.onboarding.api.unlock-ca-payments'
    },
    {
      name: 'PERSONAL_SENDING_UNDER_1000_CAPABILITY_ID',
      type: 'String',
      value: 'crunch.onboarding.api.unlock-ca-payments-under-1000'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      var pm = new PM(FlinksLoginIdDAO.getOwnClassInfo().getId(), "put");

      try {

        Logger logger = (Logger) x.get("logger");
        Subject subject = (Subject) x.get("subject");

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;

        // Resolve Request Properties
        resolveLoginId(x, flinksLoginId);
        resolveUserEmailOverride(x, flinksLoginId);

        // Lookup User and Business and Account
        User user = flinksLoginId.findUser(x);
        if ( user == null && flinksLoginId.getUser() != 0 ) {
          throw new UnknownIdException("User not found: " + flinksLoginId.getUser());
        }
        Business business = flinksLoginId.findBusiness(x);
        if ( business == null && flinksLoginId.getBusiness() != 0 ) {
          throw new UnknownIdException("Business not found: " + flinksLoginId.getBusiness());
        }
        Account account = flinksLoginId.findAccount(x);
        if ( account == null && !SafetyUtil.isEmpty(flinksLoginId.getAccount()) ) {
          throw new UnknownIdException("Account not found: " + flinksLoginId.getAccount());
        }

        // Perform Flinks Operations
        if ( !SafetyUtil.isEmpty(flinksLoginId.getLoginId()) ) {
          FlinksResponse flinksResponse = (FlinksResponse) ((FlinksResponseService) x.get("flinksResponseService")).getFlinksResponse(x, flinksLoginId);
          if ( flinksResponse == null ) {
            throw new ExternalAPIException("Flinks failed to provide a valid response when provided with login ID: " + flinksLoginId.getLoginId());
          }

          FlinksAuth flinksAuth = (FlinksAuth) x.get("flinksAuth");
          FlinksResponse flinksAuthResponse = flinksAuth.getAccountSummary(x, flinksResponse.getRequestId(), subject.getUser(), false);
          while ( flinksAuthResponse.getHttpStatusCode() == 202 ) {
            flinksAuthResponse = flinksAuth.pollAsync(x, flinksAuthResponse.getRequestId(), subject.getUser());
          }
          if ( flinksAuthResponse.getHttpStatusCode() != 200 ) {
            throw new ExternalAPIException("Flinks failed to provide valid account detials " + flinksAuthResponse);
          }
          FlinksAccountsDetailResponse flinksDetailResponse = (FlinksAccountsDetailResponse) flinksAuthResponse;
          flinksLoginId.setFlinksAccountsDetails(flinksDetailResponse.getId());

          AccountWithDetailModel accountDetail = selectBankAccount(x, flinksLoginId, flinksDetailResponse);
          if ( accountDetail == null ) {
            throw new UnknownIdException("No matching Flinks bank account found. AccountId: " + flinksLoginId.getAccountId());
          }

          LoginModel loginDetail = flinksDetailResponse.getLogin();
          if ( loginDetail == null ) {
            logger.warning("Unexpected behaviour - No login section found in FlinksResponse for loginId: " + flinksLoginId.getLoginId());
          }

          // Override the Flink login details type
          if ( !isProduction(x) &&
               flinksLoginId.getFlinksOverrides() != null && 
               !SafetyUtil.isEmpty(flinksLoginId.getFlinksOverrides().getType()))
          {
            loginDetail.setType(flinksLoginId.getFlinksOverrides().getType()); 
          }

          // Onboarding
          if ( user == null ) {
            // Create the user when they do not exist
            onboarding(x, flinksLoginId, accountDetail, loginDetail);

            // Retrieve the user and the business
            user = flinksLoginId.findUser(x);
            business = flinksLoginId.findBusiness(x);

            // User must exist
            if ( user == null ) {
              throw new GeneralException("User not provisioned: " + flinksLoginId.getUser());
            }
          }

          // Account Creation
          if ( account == null ) {
            User owner = (business != null) ? business : user;
            account = findBankAccount(x, owner, flinksLoginId, accountDetail);
            if ( account == null ) {
              // Create the bank account owned by the business if it exists, otherwise by the user
              account = createBankAccount(x, owner, flinksLoginId, accountDetail, loginDetail);
            }
            flinksLoginId.setAccount(account.getId());
          }
        }
        
        // Ensure user exists
        if ( user == null ) {
          throw new UnknownIdException("User is required to add a bank account");
        }

        // Lookup Missing Capabilities
        lookupMissingCapabilities(x, flinksLoginId, user, business);

        // Find Account if necessary
        if ( account == null ) {
          User owner = ( business != null ) ? business : user;
          DAO accountDAO = (DAO) x.get("localAccountDAO");
          ArraySink accounts = (ArraySink) accountDAO.where(EQ(Account.OWNER, owner.getId())).orderBy(Account.CREATED).limit(1).select(new ArraySink());
          if ( accounts.getArray().size() > 0 ) {
            account = (Account) accounts.getArray().get(0);
            flinksLoginId.setAccount(account.getId());
          }
        }

        return super.put_(x, flinksLoginId);
      } catch (Throwable t) {
        pm.error(x, t.getMessage());
        throw t;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'resolveLoginId',      
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' }
      ],
      javaCode: `
        // Whether to skip lookup of previous requests altogether
        if ( request.getSkipLoginIdResolution() ) return;

        // Do not resolve Flink LoginId when in Guest Mode
        if ( request.getGuestMode() ) return;

        // Only lookup previous requests if no user is defined
        if ( request.getUser() != 0 ) return;

        // Lookup most recent FlinksLoginId with the given LoginId
        List oldRecords = ((ArraySink) getDelegate().where(AND(
            EQ(FlinksLoginId.LOGIN_ID, request.getLoginId()),
            NEQ(FlinksLoginId.USER, 0)
          ))
          .orderBy(net.nanopay.flinks.external.FlinksLoginId.CREATED)
          .limit(1)
          .select(new foam.dao.ArraySink())).getArray();

        // Use the previously assigned user and business
        if ( oldRecords.size() == 1 ) {
          FlinksLoginId previousFlinksLoginId = (FlinksLoginId) oldRecords.get(0);
          request.setUser(previousFlinksLoginId.getUser());
          request.setBusiness(previousFlinksLoginId.getBusiness());
        }
      `
    },
    {
      name: 'isProduction',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        AppConfig config = (AppConfig) x.get("appConfig");
        return ( config != null && config.getMode() == Mode.PRODUCTION );
      `
    },
    {
      name: 'resolveUserEmailOverride',      
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' }
      ],
      javaCode: `
        if ( isProduction(x) ) {
          // Skipping user email lookup in PRODUCTION
          return;
        }

        // Only resolve email when skip login ID resolution is true
        if ( ! request.getSkipLoginIdResolution() ) return;

        // Only lookup previous requests if no user is defined
        if ( request.getUser() != 0 ) return;

        // Do not resolve email when in guest mode
        if ( request.getGuestMode() ) return;

        // Check whether an email was provided
        if ( 
          request.getFlinksOverrides() == null ||
          request.getFlinksOverrides().getUserOverrides() == null || 
          SafetyUtil.isEmpty(request.getFlinksOverrides().getUserOverrides().getEmail()) ) {
            return;
        }

        DAO dao = (DAO) x.get("localUserDAO");
        User user = (User) dao.find(EQ(User.EMAIL, request.getFlinksOverrides().getUserOverrides().getEmail()));

        // Return if no user was found
        if ( user == null ) return;

        request.setUser(user.getId());
      `
    },
    {
      name: 'lookupMissingCapabilities',      
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'user', type: 'User' },
        { name: 'business', type: 'Business' }
      ],
      javaCode: `
        // Retrieve any missing capabilities
            
        // Select one of the API CAD Personal Payments Capabilities
        String capabilityId = getUserCapabilityId(x, request);
        
        // Switch contexts to the newly created user
        Subject subject = new Subject.Builder(x).setUser(user).build();
        if ( request.getType() != OnboardingType.PERSONAL && business != null ) {
          subject.setUser(business);

          // Business CAD payments capability
          capabilityId = getBusinessCapabilityId(x, request);

          // TODO: should be looking up either this or the payor cap
        }
        X subjectX = x.put("subject", subject);

        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        addCapabilityPayload(x, request, (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId));
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

          // When no account ID is specific, take the first CAD account
          if ( SafetyUtil.isEmpty(request.getAccountId()) && account.getCurrency().equals("CAD") && firstCADAccountDetail == null ) {
            firstCADAccountDetail = account;
          }

          // Find the account specified in the request when it is provided
          if ( !SafetyUtil.isEmpty(request.getAccountId()) && SafetyUtil.equals(request.getAccountId(), account.getId()) ) {
            accountDetail = account;
          }

          // Break out of loop early if we've found the right accounts already
          if ( accountDetail != null && firstCADAccountDetail != null ) break;
        }

        // Use first Canadian bank account if accountId cannot be found
        if ( accountDetail == null && firstCADAccountDetail != null ) {
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
          { name: 'accountDetail', type: 'AccountWithDetailModel' },
          { name: 'loginDetail', type: 'LoginModel' }
        ],
        javaCode: `
        DAO accountDAO = (DAO) x.get("accountDAO");

        // Do not allow a bank account in an other currency
        if ( !accountDetail.getCurrency().equals("CAD") &&
             !accountDetail.getCurrency().equals("USD") ) {
          throw new GeneralException("Only USD or Canadian dollar bank accounts are supported. Currency of account selected: " + accountDetail.getCurrency());
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

        // Save the login type for future reference
        bankAccount.getExternalData().put("FlinksLoginUsername", loginDetail.getUsername());
        bankAccount.getExternalData().put("FlinksLoginType", loginDetail.getType());

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
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' },
        { name: 'loginDetail', type: 'LoginModel' }
      ],
      javaCode: `
        // Determine onboarding type
        OnboardingType onboardingType = request.getType();
        if ( onboardingType == OnboardingType.DEFAULT ) {
          if ( loginDetail == null ) {
            throw new ExternalAPIException("Flinks login information not found. Cannot determine onboarding type automatically.");
          }

          // Determine onboarding type
          if ( SafetyUtil.equals(loginDetail.getType(), "Personal") ) {
            onboardingType = OnboardingType.PERSONAL;
          }
          else if ( SafetyUtil.equals(loginDetail.getType(), "Business") ) {
            onboardingType = OnboardingType.BUSINESS;
          }

          if ( onboardingType == OnboardingType.DEFAULT ) {
            throw new ExternalAPIException("Cannot determine onboarding type with login type: " + loginDetail.getType());
          }
        }

        if ( onboardingType != OnboardingType.PERSONAL && onboardingType != OnboardingType.BUSINESS ) {
          throw new GeneralException("Unexpected onboarding type: " + request.getType() + ", and login type: " + loginDetail.getType());
        }

        onboardUser(x, request, accountDetail, loginDetail, onboardingType);
        if ( onboardingType == OnboardingType.BUSINESS ) {
          onboardBusiness(x, request, accountDetail, loginDetail);
        }
      `
    },
    {
      name: 'onboardUser',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' },
        { name: 'loginDetail', type: 'LoginModel' },
        { name: 'onboardingType', type: 'OnboardingType' }
      ],
      javaCode: `
        HolderModel holder = accountDetail.getHolder();
        UserOverrideData overrides = null;
        if ( request.getFlinksOverrides() != null ) overrides = request.getFlinksOverrides().getUserOverrides();
        String userEmail = overrides != null && !SafetyUtil.isEmpty(overrides.getEmail()) ?
          overrides.getEmail() : holder.getEmail();

        // Retrieve the External ID if it exists
        BusinessOverrideData businessOverrides = null;
        if ( request.getFlinksOverrides() != null ) businessOverrides = request.getFlinksOverrides().getBusinessOverrides();
        String externalId = businessOverrides != null && !SafetyUtil.isEmpty(businessOverrides.getExternalId()) ?
          businessOverrides.getExternalId() : "";

        Subject subject = (Subject) x.get("subject");

        String groupId = determineGroupId(x, request, subject);

        DAO userDAO = (DAO) x.get("localUserDAO");
        User user = new User.Builder(x)
          .setEmail(userEmail)
          .setUserName(request.getGuestMode() ? java.util.UUID.randomUUID().toString() : userEmail)
          .setDesiredPassword(java.util.UUID.randomUUID().toString())
          .setEmailVerified(true)
          .setGroup(groupId)
          .setSpid(subject.getRealUser().getSpid())
          .setStatus(net.nanopay.admin.model.AccountStatus.ACTIVE)
          .setExternalId(externalId)
          .build();
        user = (User) userDAO.put(user);

        // Update or create notification settings and disable them
        ArraySink notificationSettings = (ArraySink) user.getNotificationSettings(x).where(CLASS_OF(NotificationSetting.class)).select(new ArraySink());
        ArraySink emailSettings = (ArraySink) user.getNotificationSettings(x).where(CLASS_OF(EmailSetting.class)).select(new ArraySink());
        ArraySink smsSettings = (ArraySink) user.getNotificationSettings(x).where(CLASS_OF(SMSSetting.class)).select(new ArraySink());

        if (notificationSettings.getArray().size() == 0) {
          NotificationSetting notificationSetting = new NotificationSetting();
          notificationSetting.setOwner(user.getId());
          notificationSetting.setEnabled(false);
          user.getNotificationSettings(x).put(notificationSetting);
        } else {
          NotificationSetting notificationSetting = (NotificationSetting) notificationSettings.getArray().get(0);
          notificationSetting = (NotificationSetting) notificationSetting.fclone();
          notificationSetting.setEnabled(false);
          user.getNotificationSettings(x).put(notificationSetting);
        }

        if (emailSettings.getArray().size() == 0) {
          EmailSetting emailSetting = new EmailSetting();
          emailSetting.setOwner(user.getId());
          emailSetting.setEnabled(false);
          user.getNotificationSettings(x).put(emailSetting);
        } else {
          EmailSetting emailSetting = (EmailSetting) emailSettings.getArray().get(0);
          emailSetting = (EmailSetting) emailSetting.fclone();
          emailSetting.setEnabled(false);
          user.getNotificationSettings(x).put(emailSetting);
        }

        if (smsSettings.getArray().size() == 0) {
          SMSSetting smsSetting = new SMSSetting();
          smsSetting.setOwner(user.getId());
          smsSetting.setEnabled(false);
          user.getNotificationSettings(x).put(smsSetting);
        } else {
          SMSSetting smsSetting = (SMSSetting) smsSettings.getArray().get(0);
          smsSetting = (SMSSetting)  smsSetting.fclone();
          smsSetting.setEnabled(false);
          user.getNotificationSettings(x).put(smsSetting);
        }

        // Save the UserId on the request
        request.setUser(user.getId());

        // Switch contexts to the newly created user
        Subject newSubject = new Subject.Builder(x).setUser(user).build();
        X subjectX = getX().put("subject", newSubject);
        subjectX = subjectX.put("group", null);

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

        Boolean isBusinessBankAccount = SafetyUtil.equals(loginDetail.getType(), "Business");
        String fullName = isBusinessBankAccount ? "" : holder.getName();
        String nameSplit[] = fullName.split(" ", 2);
        String first = nameSplit.length > 0 ? nameSplit[0] : fullName;
        String last  = nameSplit.length > 1 ? nameSplit[1] : "";
        String firstName = overrides != null && !SafetyUtil.isEmpty(overrides.getFirstName()) ? overrides.getFirstName() : first;
        String lastName = overrides != null && !SafetyUtil.isEmpty(overrides.getLastName()) ? overrides.getLastName() : last;
        String phoneNumber = overrides != null && !SafetyUtil.isEmpty(overrides.getPhoneNumber()) ? overrides.getPhoneNumber() : holder.getPhoneNumber().replaceAll("[^0-9]", "");

        // Select one of the API CAD Personal Payments Capabilities
        final String capabilityId = getUserCapabilityId(x, request);

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
      `
    },
    {
      name: 'determineGroupId',
      type: 'String',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'subject', type: 'Subject' }
      ],
      javaCode: `
        String groupId = "external-sme";
        DAO groupDAO = (DAO) x.get("localGroupDAO");
        Group group = null;
        if ( request.getType() == OnboardingType.BUSINESS ) {
          group = (Group) groupDAO.find(subject.getRealUser().getSpid() + "-business-sme");
        }
        if ( group == null ) {
          group = (Group) groupDAO.find(subject.getRealUser().getSpid() + "-sme");
        }
        if ( group != null ) {
          groupId = group.getId();
        }
        return groupId;
      `
    },
    {
      name: 'onboardBusiness',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
        { name: 'accountDetail', type: 'AccountWithDetailModel' },
        { name: 'loginDetail', type: 'LoginModel' }
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

        // Business name
        Boolean isBusinessBankAccount = SafetyUtil.equals(loginDetail.getType(), "Business");
        String name = isBusinessBankAccount ? "" : holder.getName();

        // Check for overrides
        BusinessOverrideData overrides = null;
        if ( request.getFlinksOverrides() != null ) overrides = request.getFlinksOverrides().getBusinessOverrides();
        String businessName = overrides != null && !SafetyUtil.isEmpty(overrides.getBusinessName()) ?
          overrides.getBusinessName() : name;
        String businessEmail = overrides != null && !SafetyUtil.isEmpty(overrides.getEmail()) ?
          overrides.getEmail() : holder.getEmail();
        Address businessAddress = overrides != null && overrides.getAddress() != null ?
          overrides.getAddress() : address;
        Address mailingAddress = overrides != null && overrides.getMailingAddress() != null ?
          overrides.getMailingAddress() : businessAddress;
        String phoneNumber = overrides != null && !SafetyUtil.isEmpty(overrides.getPhoneNumber()) ?
          overrides.getPhoneNumber() : user.getPhoneNumber();
        String externalId = overrides != null && !SafetyUtil.isEmpty(overrides.getExternalId()) ?
          overrides.getExternalId() : "";

        // Create business with minimal information
        Business business = new Business.Builder(x)
          .setBusinessName(businessName)
          .setOrganization(businessName)
          .setPhoneNumber(phoneNumber)
          .setAddress(businessAddress)
          .setExternalId(externalId)
          .setSpid(user.getSpid())
          .setStatus(net.nanopay.admin.model.AccountStatus.ACTIVE)
          .build();

        if ( SafetyUtil.isEmpty(businessName) ) {
          business.setBusinessName(holder.getName());
          business.getExternalData().put("FlinksName", holder.getName());
        }

        DAO localUserDAO = (DAO) subjectX.get("localUserDAO");
        business = (Business) localUserDAO.inX(subjectX).put(business);

        // Update or create notification settings and disable them
        ArraySink notificationSettings = (ArraySink) business.getNotificationSettings(x).where(CLASS_OF(NotificationSetting.class)).select(new ArraySink());

        if (notificationSettings.getArray().size() == 0) {
          NotificationSetting notificationSetting = new NotificationSetting();
          notificationSetting.setOwner(business.getId());
          notificationSetting.setEnabled(false);
          business.getNotificationSettings(x).put(notificationSetting);
        } else {
          NotificationSetting notificationSetting = (NotificationSetting) notificationSettings.getArray().get(0);
          notificationSetting = (NotificationSetting) notificationSetting.fclone();
          notificationSetting.setEnabled(false);
          business.getNotificationSettings(x).put(notificationSetting);
        }

        // Switch to business context
        Subject currentSubject = (Subject) subjectX.get("subject");
        currentSubject.setUser(business);
        subjectX = subjectX.put("subject", currentSubject);
        subjectX = subjectX.put("group", null);

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
          .setId("crunch.onboarding.api.business-details")
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        DAO capabilityPayloadDAO = (DAO) subjectX.get("capabilityPayloadDAO");
        businessCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(businessCapPayload);

        // Retrieve the updated business
        business = (Business) localUserDAO.inX(subjectX).find(business);
        if ( business == null ) {
          throw new ExternalAPIException("Failed to create business during onboarding with Flinks");
        }

        // Business CAD payments capability
        String capabilityId = getBusinessCapabilityId(x, request);
        CapabilityPayload missingPayloads = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).find(capabilityId);
        businessCapabilityDataObjects = missingPayloads.getCapabilityDataObjects();

        SecurefactOnboardingService securefactOnboardingService = (SecurefactOnboardingService) subjectX.get("securefactOnboardingService");
        if ( securefactOnboardingService == null ) {
          throw new GeneralException("Cannot find securefactOnboardingService");
        }

        // Fill the capability data objects from SecureFact LEV
        securefactOnboardingService.retrieveLEVCapabilityPayloads(subjectX, business, businessCapabilityDataObjects);

        // Add current user as signing officer and directors
        SigningOfficerList signingOfficerList = (SigningOfficerList) businessCapabilityDataObjects.get("Signing Officers");
        if ( signingOfficerList == null) {
          signingOfficerList = new SigningOfficerList.Builder(subjectX).setBusiness(business.getId()).build();
          businessCapabilityDataObjects.put("Signing Officers", signingOfficerList);
        }
        addSigningOfficerToList(subjectX, user, business, signingOfficerList);
        BusinessDirectorList businessDirectorList = (BusinessDirectorList) businessCapabilityDataObjects.get("Business Directors");
        if ( businessDirectorList == null ) {
          businessDirectorList = new BusinessDirectorList.Builder(x).setBusiness(business.getId()).build();
          businessCapabilityDataObjects.put("Business Directors", businessDirectorList);
        }
        addBusinessDirectorToList(subjectX, user, business, businessDirectorList);

        businessCapPayload = new CapabilityPayload.Builder(subjectX)
          .setId(capabilityId)
          .setCapabilityDataObjects(new HashMap<String,FObject>(businessCapabilityDataObjects))
          .build();
        businessCapPayload = (CapabilityPayload) capabilityPayloadDAO.inX(subjectX).put(businessCapPayload);
      `
    },
    {
      name: 'addCapabilityPayload',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' },
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
      name: 'getUserCapabilityId',
      type: 'String',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' }
      ],
      javaCode: `
        var amount = request != null ? request.getAmount() : 0;

        DAO dao = (DAO) x.get("localCapabilityDAO");
        Capability fullUserCapability = (Capability) dao.find(PERSONAL_SENDING_CAPABILITY_ID);
        LimitedAmountCapability minimalUserCapability = (LimitedAmountCapability) dao.find(PERSONAL_SENDING_UNDER_1000_CAPABILITY_ID);

        // Return the capability ID
        return amount <= minimalUserCapability.getMaximumAmount() ?
          minimalUserCapability.getId() :
          fullUserCapability.getId();
      `
    },
    {
      name: 'getBusinessCapabilityId',
      type: 'String',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'request', type: 'FlinksLoginId' }
      ],
      javaCode: `
        String capabilityId = BUSINESS_RECEIVING_CAPABILITY_ID;

        if ( request.getType() != OnboardingType.BUSINESS ) {
          capabilityId = BUSINESS_SENDING_CAPABILITY_ID;
        }

        return capabilityId;
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

        // Set the business
        signingOfficerList.setBusiness(business.getId());
      `
    },
    {
      name: 'addBusinessDirectorToList',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'User' },
        { name: 'business', type: 'Business' },
        { name: 'businessDirectorList', type: 'BusinessDirectorList' }
      ],
      javaCode: `
        // Set the business
        if ( business != null )
          businessDirectorList.setBusiness(business.getId());

        if ( businessDirectorList.getBusinessDirectors() != null && 
             businessDirectorList.getBusinessDirectors().length > 0) {
               return;
             }
        
        BusinessDirector businessDirector = new BusinessDirector.Builder(x)
             .setFirstName(user.getFirstName())
             .setLastName(user.getLastName())
             .build();
        businessDirectorList.setBusinessDirectors(new BusinessDirector[] { businessDirector });
      `
    }
  ]
});
