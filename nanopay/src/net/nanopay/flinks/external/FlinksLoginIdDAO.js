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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.AgentAuthService',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'java.util.HashMap',
    'java.util.Map',
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
    'net.nanopay.flinks.FlinksAuth',
    'net.nanopay.flinks.FlinksResponseService',
    'net.nanopay.flinks.model.AccountType',
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
        AgentAuthService agentAuth = (AgentAuthService) x.get("agentAuth");
        DAO accountDAO = (DAO) x.get("accountDAO");
        DAO businessDAO = (DAO) x.get("businessDAO");
        DAO capabilityPayloadDAO = (DAO) x.get("capabilityPayloadDAO");
        DAO smeUserRegistrationDAO = (DAO) x.get("smeUserRegistrationDAO");
        FlinksAuth flinksAuth = (FlinksAuth) x.get("flinksAuth");
        FlinksResponseService flinksResponseService = (FlinksResponseService) x.get("flinksResponseService");
        User user = ((Subject) x.get("subject")).getUser();

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;
        FlinksResponse flinksResponse = (FlinksResponse) flinksResponseService.getFlinksResponse(x, flinksLoginId);
        if ( flinksResponse == null ) throw new RuntimeException("Flinks failed to provide a valid response when provided with login ID: " + flinksLoginId.getLoginId());
        
        FlinksAccountsDetailResponse flinksDetailResponse = (FlinksAccountsDetailResponse) flinksAuth.getAccountSummary(x, flinksResponse.getRequestId(), user);
        flinksLoginId.setFlinksAccountsDetails(flinksDetailResponse.getId());

        AccountWithDetailModel[] accounts = flinksDetailResponse.getAccounts();
        for ( int i = 0; i < accounts.length; i++ ) {
          AccountWithDetailModel accountDetail = accounts[i];
          if ( accountDetail.getCurrency().equals("CAD") ) {
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
              .setDesiredPassword("password")
              .setEmailVerified(true)
              .build();
            newUser = (User) smeUserRegistrationDAO.put(newUser);
            agentAuth.actAs(x, newUser);

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

            userCapabilityDataObjects.put("AbliiPrivacyPolicy", privacyPolicy);
            userCapabilityDataObjects.put("AbliiTermsAndConditions", termsAndConditions);
            userCapabilityDataObjects.put("User Registration", registrationData);
            userCapabilityDataObjects.put("Nanopay Admission", null);
            userCapabilityDataObjects.put("API Onboarding User and Business", null);

            CapabilityPayload userCapPayload = new CapabilityPayload.Builder(x)
              .setId("B98D97EE-4A43-4B03-84C1-9DE2C0109E87")
              .setCapabilityDataObjects(new HashMap<String,FObject>(userCapabilityDataObjects))
              .build();
            capabilityPayloadDAO.put(userCapPayload);


            if ( flinksLoginId.getType().equals(AccountType.BUSINESS) ) {
              Map<String,FObject> businessCapabilityDataObjects = new HashMap<>();

              InitialBusinessData initialBusinessData = new InitialBusinessData.Builder(x)
                .setCompanyPhone(phoneNumber)
                .setEmail(holder.getEmail())
                .setSignInAsBusiness(false)
                .setAddress(address)
                .setMailingAddress(address)
                .build();
              SigningOfficerQuestion officerQuestion = new SigningOfficerQuestion.Builder(x)
                .setIsSigningOfficer(true)
                .setSigningOfficerEmail(holder.getEmail())
                .setAdminFirstName(firstName)
                .setAdminLastName(lastName)
                .setAdminPhone(phoneNumber)
                .build();
              BusinessOwnershipData businessOwnershipData = new BusinessOwnershipData.Builder(x)
                .setAmountOfOwners(1)
                .setPubliclyTraded(false)
                .setOwnerSelectionsValidated(true)
                .build();
              CertifyDirectorsListed certifyDirectorsListed = new CertifyDirectorsListed.Builder(x)
                .setAgreement(true)
                .build();
              BusinessInformationData businessInfoData = new BusinessInformationData.Builder(x)
                .setBusinessTypeId(1)
                .setBusinessSectorId(1)
                .setOperatingUnderDifferentName(true)
                .build();
              Phone phone = new Phone.Builder(x)
                .setNumber(phoneNumber)
                .setVerified(true)
                .build();
              SigningOfficerPersonalData soPersonalData = new SigningOfficerPersonalData.Builder(x)
                .setCountryId(holderAddress.getCountry())
                .setAddress(address)
                .setPhone(phone)
                .setPEPHIORelated(false)
                .setThirdParty(false)
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
              CertifyOwnersPercent certifyPercent = new CertifyOwnersPercent.Builder(x)
                .setAgreement(true)
                .build();
              DualPartyAgreementCAD dualPartyAgreement = new DualPartyAgreementCAD.Builder(x)
                .setAgreement(true)
                .build();
              CertifyDataReviewed certifyData = new CertifyDataReviewed.Builder(x)
                .setReviewed(true)
                .build();
  
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
            }

            Business business = (Business) businessDAO.find(newUser.getId());
            if ( business != null ) {
              agentAuth.actAs(x, business);
            }

            CABankAccount bankAccount = new CABankAccount.Builder(x)
              .setOwner(business != null ? business.getId() : newUser.getId())
              .setAccountNumber(accountDetail.getAccountNumber())
              .setBranchId(accountDetail.getTransitNumber())
              .setDenomination(accountDetail.getCurrency())
              .setInstitutionNumber(accountDetail.getInstitutionNumber())
              .setName(accountDetail.getTitle())
              .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
              .setVerifiedBy("FLINKS")
              .build();

            bankAccount = (CABankAccount) accountDAO.put(bankAccount);
            flinksLoginId.setAccount(bankAccount.getId());
            break;
          }
        }

        return super.put_(x, flinksLoginId);
      `
    }
  ]
});
