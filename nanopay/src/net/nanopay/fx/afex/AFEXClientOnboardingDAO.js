foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXClientOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.core.FObject',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.EQ',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.afex.AFEXBusiness',
    'net.nanopay.fx.afex.AFEXService',
    'net.nanopay.fx.afex.OnboardCorporateClientRequest',
    'net.nanopay.fx.afex.OnboardCorporateClientResponse',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
   
    'java.text.SimpleDateFormat',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( !(obj instanceof BankAccount) ) {
        return getDelegate().put_(x, obj);
      }
  
      BankAccount account = (BankAccount) obj;
      BankAccount existingAccount = (BankAccount) getDelegate().find(account.getId());
      if ( existingAccount != null && existingAccount.getStatus() == BankAccountStatus.UNVERIFIED 
            &&  account.getStatus() == BankAccountStatus.VERIFIED ) {
        System.out.println("A verified bank account exists");
        AuthService auth = (AuthService) x.get("auth");
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        Business business = (Business) localBusinessDAO.find(account.getOwner());
        if  ( null != business  ) {
          System.out.println("A business exists");
          // TODO: Check if business is already pushed to AFEX?
          DAO afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
          AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
          if ( afexBusiness != null ) return super.put_(x, obj);
  
          System.out.println("Business hass not being onboarded to AFEX before now");
  
          boolean hasFXProvisionPayerPermission = true; //auth.checkUser(getX(), business, "fx.provision.payer");
          //boolean hasCurrencyReadUSDPermission = auth.checkUser(getX(), business, "currency.read.USD");
          if ( hasFXProvisionPayerPermission ) {
            User signingOfficer = getSigningOfficer(x, business);
            if ( signingOfficer != null ) {
              String identificationExpiryDate = null;
              try {
                identificationExpiryDate = new SimpleDateFormat("yyyy/mm/dd").format(signingOfficer.getIdentification().getExpirationDate()); 
              } catch(Throwable t) {
                ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
              } 
              AFEXService afexService = (AFEXService) x.get("afexService");
              OnboardCorporateClientRequest onboardingRequest = new OnboardCorporateClientRequest();
              onboardingRequest.setAccountPrimaryIdentificationExpirationDate(identificationExpiryDate);
              onboardingRequest.setAccountPrimaryIdentificationNumber(String.valueOf(signingOfficer.getIdentification().getIdentificationNumber()));
              onboardingRequest.setAccountPrimaryIdentificationType(String.valueOf(signingOfficer.getIdentification().getIdentificationTypeId())); // TODO: This should ref AFEX ID type
              onboardingRequest.setBusinessAddress1(business.getAddress().getAddress1());
              onboardingRequest.setBusinessCity(business.getAddress().getCity());
              onboardingRequest.setBusinessCountryCode(business.getAddress().getCountryId());
              onboardingRequest.setBusinessName(business.getBusinessName());
              onboardingRequest.setBusinessZip(business.getAddress().getPostalCode());
              onboardingRequest.setCompanyType(String.valueOf(business.getBusinessTypeId())); // TODO: This should ref AFEX company type
              onboardingRequest.setContactBusinessPhone(business.getBusinessPhone().getNumber());
              String businessRegDate = null;
              try {
                businessRegDate = new SimpleDateFormat("yyyy/mm/dd").format(business.getBusinessRegistrationDate()); 
              } catch(Throwable t) {
                ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
              } 
              onboardingRequest.setDateOfIncorporation(businessRegDate);
              onboardingRequest.setFirstName(signingOfficer.getFirstName());
              onboardingRequest.setGender("Male"); //TODO
              onboardingRequest.setLastName(signingOfficer.getLastName());
              onboardingRequest.setPrimaryEmailAddress(signingOfficer.getEmail());
              onboardingRequest.setTermsAndConditions("true");
              OnboardCorporateClientResponse newClient = afexService.onboardCorporateClient(onboardingRequest);
              if ( newClient != null ) {
                System.out.println("Business is now onboarded to afex");
                afexBusiness  = new AFEXBusiness();
                afexBusiness.setUser(business.getId());
                afexBusiness.setApiKey(newClient.getAPIKey());
                afexBusiness.setAccountNumber(newClient.getAccountNumber());
                afexBusiness.setStatus("Active"); // TODO: Confirm this
                afexBusinessDAO.put(afexBusiness);
              }
            }
          }
        }
      }
  
      return super.put_(x, obj);
      `
    }
  ]
});