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
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.connection.CapabilityPayload',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy',
    'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
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

            Map<String,FObject> capabilityDataObjects = new HashMap<>();
            AbliiPrivacyPolicy privacyPolicy = new AbliiPrivacyPolicy.Builder(x)
              .setTitle("Ablii's Privacy Policy")
              .setAgreement(true)
              .build();
            AbliiTermsAndConditions termsAndConditions = new AbliiTermsAndConditions.Builder(x)
              .setTitle("Ablii's Terms and Conditions")
              .setAgreement(true)
              .build();
            UserRegistrationData registrationData = new UserRegistrationData.Builder(x)
              .setFirstName(newUser.getFirstName())
              .setLastName(newUser.getLastName())
              .setPhone(newUser.getPhoneNumber())
              .build();

            capabilityDataObjects.put("AbliiPrivacyPolicy", privacyPolicy);
            capabilityDataObjects.put("AbliiTermsAndConditions", termsAndConditions);
            capabilityDataObjects.put("User Registration", registrationData);
            capabilityDataObjects.put("Nanopay Admission", null);
            capabilityDataObjects.put("API Onboarding User and Business", null);

            if ( flinksLoginId.getType().equals(AccountType.BUSINESS) ) {
              InitialBusinessData businessData = new InitialBusinessData.Builder(x)
                .setBusinessName("Business")
                .setCompanyPhone(phoneNumber)
                .setEmail(holder.getEmail())
                .setSignInAsBusiness(false)
                .setAddress(address)
                .setMailingAddress(address)
                .build();

              capabilityDataObjects.put("Business Registration", businessData);
            }

            CapabilityPayload payload = new CapabilityPayload.Builder(x)
              .setCapabilityDataObjects(new HashMap<String,FObject>(capabilityDataObjects))
              .build();
            capabilityPayloadDAO.put(payload);

            Business business = (Business) businessDAO.find(newUser.getId());
            if ( business != null ) {
              agentAuth.actAs(x, business);
            }

            CABankAccount bankAccount = new CABankAccount();
            bankAccount.setOwner(business != null ? business.getId() : newUser.getId());
            bankAccount.setAccountNumber(accountDetail.getAccountNumber());
            bankAccount.setBranchId(accountDetail.getTransitNumber());
            bankAccount.setDenomination(accountDetail.getCurrency());
            bankAccount.setInstitutionNumber(accountDetail.getInstitutionNumber());
            bankAccount.setName(accountDetail.getTitle());
            bankAccount.setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED);
            bankAccount.setVerifiedBy("FLINKS");

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
