package net.nanopay.fx.afex;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.Address;
import foam.nanos.auth.Country;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import static foam.mlang.MLang.*;
import net.nanopay.account.Account;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.model.Business;
import net.nanopay.model.BusinessSector;
import net.nanopay.model.BusinessType;
import net.nanopay.model.JobTitle;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
import java.util.Locale;

public class AFEXServiceProvider extends ContextAwareSupport implements FXService, PaymentService {

  private  AFEX afexClient;
  protected DAO fxQuoteDAO_;
  private  X x;
  private final Logger logger_;

  public AFEXServiceProvider(X x, final AFEX afexClient) {
    this.afexClient = afexClient;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
    this.logger_ = (Logger) x.get("logger");
  }

  public boolean onboardBusiness(Business business) {
    BankAccount bankAccount = (BankAccount) ((DAO) this.x.get("localAccountDAO")).find(AND(
      EQ(BankAccount.OWNER,business.getId()),
      INSTANCE_OF(BankAccount.class)));
    return onboardBusiness(business, bankAccount);
  }

  public boolean onboardBusiness(BankAccount bankAccount) {
    Business business = (Business) ((DAO) this.x.get("localBusinessDAO")).find(bankAccount.getOwner());
    return onboardBusiness(business, bankAccount);
  }

  public boolean onboardBusiness(Business business, BankAccount bankAccount) throws RuntimeException{
    if ( business == null ||  ! business.getCompliance().equals(ComplianceStatus.PASSED) ) return false;

    if ( bankAccount == null ||  bankAccount.getStatus() != BankAccountStatus.VERIFIED ) return false;

    try {
      if  ( business.getOnboarded() ) {
        DAO afexBusinessDAO = (DAO) this.x.get("afexBusinessDAO");
        AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
        if ( afexBusiness != null ) return false;

        AuthService auth = (AuthService) this.x.get("auth");
        boolean hasFXProvisionPayerPermission = auth.checkUser(this.x, business, "fx.provision.payer");
        if ( hasFXProvisionPayerPermission) {
          OnboardCorporateClientRequest onboardingRequest = new OnboardCorporateClientRequest();
          User signingOfficer = getSigningOfficer(this.x, business);
          Region businessRegion = business.getAddress().findRegionId(this.x);
          Country businessCountry = business.getAddress().findCountryId(this.x);

          if ( signingOfficer != null ) {
            Boolean useHardCoded = business.getAddress().getCountryId().equals("CA");
            String identificationType = businessCountry == null || businessCountry.getId().equals("CA") ? "Passport"
              : "EmployerIdentificationNumber_EIN"; // Madlen asked it is hardcoded
            String identificationNumber = SafetyUtil.isEmpty(business.getBusinessRegistrationNumber()) ? "N/A"
              : business.getBusinessRegistrationNumber(); // Madlen asked it is hardcoded
            if ( businessRegion != null ) onboardingRequest.setBusinessStateRegion(businessRegion.getCode());
            onboardingRequest.setAccountPrimaryIdentificationExpirationDate("01/01/2099"); // Asked to hardcode this by Madlen(AFEX)
            onboardingRequest.setAccountPrimaryIdentificationNumber( useHardCoded ? "000000000" : identificationNumber);
            onboardingRequest.setAccountPrimaryIdentificationType(useHardCoded ? "BusinessRegistrationNumber" : identificationType);
            if ( businessCountry != null ) onboardingRequest.setBusinessCountryCode(businessCountry.getCode());
            if ( businessRegion != null ) onboardingRequest.setBusinessStateRegion(businessRegion.getCode());
            onboardingRequest.setBusinessAddress1(business.getAddress().getAddress());
            onboardingRequest.setBusinessCity(business.getAddress().getCity());

            Country businessFormationCountry = (Country) ((DAO) this.x.get("countryDAO")).find(business.getCountryOfBusinessRegistration());
            if ( businessFormationCountry != null ) {
              onboardingRequest.setAccountPrimaryIdentificationIssuer( useHardCoded ? "Canada" : businessFormationCountry.getName());
            }

            onboardingRequest.setBusinessName(business.getBusinessName());
            onboardingRequest.setBusinessZip(business.getAddress().getPostalCode());
            onboardingRequest.setCompanyType(getAFEXCompanyType(business.getBusinessTypeId()));
            onboardingRequest.setContactBusinessPhone(business.getPhone().getNumber());
            String businessRegDate = null;
            try {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              businessRegDate = sdf.format(business.getBusinessRegistrationDate());
            } catch(Throwable t) {
              logger_.error("Error onboarding business. Error parsing business registration date.", t);
              throw new RuntimeException("Error onboarding business. Error parsing business registration date.");
            }
            onboardingRequest.setDateOfIncorporation(businessRegDate);
            onboardingRequest.setFirstName(signingOfficer.getFirstName());
            onboardingRequest.setGender("Male"); // TO be removed in API by AFEX
            onboardingRequest.setLastName(signingOfficer.getLastName());
            onboardingRequest.setPrimaryEmailAddress(signingOfficer.getEmail());
            Address contactAddress = signingOfficer.getAddress();
            if ( contactAddress != null ) {
              onboardingRequest.setContactAddress1(contactAddress.getAddress());
              onboardingRequest.setContactCity(contactAddress.getCity());
              Region region = contactAddress.findRegionId(this.x);
              if ( region != null ) onboardingRequest.setContactStateRegion(region.getCode());
              Country country = contactAddress.findCountryId(this.x);
              if ( country != null ) onboardingRequest.setContactCountryCode(country.getCode());
              onboardingRequest.setContactZip(contactAddress.getPostalCode());
            }

            try {
              SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
              sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
              onboardingRequest.setDateOfBirth(sdf.format(signingOfficer.getBirthday()));
            } catch(Throwable t) {
              logger_.error("Error onboarding business. Cound not parse signing officer birthday", t);
              throw new RuntimeException("Error onboarding business. Cound not parse signing officer birthday.");
            }
            JobTitle jobTitle = (JobTitle) ((DAO) this.x.get("jobTitleDAO")).find(EQ(JobTitle.NAME, signingOfficer.getJobTitle()));
            String jobTitleName = jobTitle == null ? "Other" : jobTitle.getName();
            onboardingRequest.setJobTitle(jobTitleName);
            onboardingRequest.setExpectedMonthlyPayments(mapAFEXTransactionCount(business.getSuggestedUserTransactionInfo().getAnnualTransactionFrequency()));
            onboardingRequest.setExpectedMonthlyVolume(mapAFEXVolumeEstimates(business.getSuggestedUserTransactionInfo().getAnnualDomesticVolume()));
            onboardingRequest.setDescription(business.getSuggestedUserTransactionInfo().getTransactionPurpose());

            BusinessSector businessSector = (BusinessSector) ((DAO) this.x.get("businessSectorDAO")).find(business.getBusinessSectorId());
            if ( businessSector != null ) onboardingRequest.setNAICS(businessSector.getName());

            if ( ! SafetyUtil.isEmpty(business.getOperatingBusinessName()) ) {
              onboardingRequest.setTradeName(business.getOperatingBusinessName());
            } else {
              onboardingRequest.setTradeName(business.getOrganization());
            }
            onboardingRequest.setTermsAndConditions("true");
            OnboardCorporateClientResponse newClient = afexClient.onboardCorporateClient(onboardingRequest);
            if ( newClient != null ) {
              afexBusiness  = new AFEXBusiness();
              afexBusiness.setUser(business.getId());
              afexBusiness.setApiKey(newClient.getAPIKey());
              afexBusiness.setAccountNumber(newClient.getAccountNumber());
              afexBusinessDAO.put(afexBusiness);
              return true;
            }
          }
        }
      }

    } catch(Exception e) {
      logger_.error("Failed to onboard client to AFEX.", e);
    }

    return false;

  }

  public String getClientAccountStatus(AFEXBusiness afexBusiness) throws RuntimeException {
    String status = null;
    if ( afexBusiness == null ) return null;
    try {
      GetClientAccountStatusResponse response = this.afexClient.getClientAccountStatus(afexBusiness.getApiKey());
      if ( response != null ) {
        status = response.getAccountStatus();
      }
    } catch(Throwable t) {
      logger_.error("Error getting afex business compliance status.", t);
    }
    return status;
  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
    String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    GetQuoteRequest quoteRequest = new GetQuoteRequest();
    boolean isAmountSettlement = sourceAmount > 0 ? true : false;
    Long amount = isAmountSettlement ? sourceAmount : destinationAmount;
    quoteRequest.setAmount(String.valueOf(toDecimal(amount)));
    quoteRequest.setCurrencyPair(targetCurrency + sourceCurrency);

    AFEXBusiness business = this.getAFEXBusiness(x, user);
    if ( business == null ) {
      throw new RuntimeException("No afexBusiness found for user " + user);
    }
    quoteRequest.setValueDate(getValueDate(targetCurrency, sourceCurrency, business.getApiKey()));
    quoteRequest.setClientAPIKey(business.getApiKey());

    if ( SafetyUtil.isEmpty(quoteRequest.getClientAPIKey()) ) {
      throw new RuntimeException("No ClientAPIKey set");
    }
    try {
      Quote quote = this.afexClient.getQuote(quoteRequest);
      if ( null != quote ) {
        Double fxAmount = isAmountSettlement ? getConvertedAmount(quote,sourceAmount, true):  getConvertedAmount(quote,destinationAmount, false);
        fxQuote.setRate(quote.getTerms().equals("A") ? quote.getInvertedRate(): quote.getRate());
        fxQuote.setTargetAmount(isAmountSettlement ? fromDecimal(fxAmount) : destinationAmount);
        fxQuote.setTargetCurrency(targetCurrency);
        fxQuote.setSourceAmount(isAmountSettlement ? sourceAmount : fromDecimal(fxAmount));
        fxQuote.setSourceCurrency(sourceCurrency);
        fxQuote.setValueDate(quote.getValueDate());
        fxQuote.setExternalId(quote.getQuoteId());
        fxQuote.setHasSourceAmount(isAmountSettlement);

        LocalDateTime time;
        AFEXCredentials credentials = (AFEXCredentials) getX().get("AFEXCredentials");
        if ( credentials != null && credentials.getQuoteExpiryTime() != 0 ) {
          time = LocalDateTime.now().plusSeconds(credentials.getQuoteExpiryTime());
        } else {
          time = LocalDateTime.now().plusSeconds(30);
        }
        fxQuote.setExpiryTime(Date.from( time.atZone( ZoneId.systemDefault()).toInstant()));
        fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      }

    } catch(Exception e) {
      logger_.error("Error to get FX Rate from AFEX.", e);
    }

    return fxQuote;
  }

  private Double getConvertedAmount(Quote quote, long amount, Boolean isSettlementAmount ) {
    if ( isSettlementAmount ) {
      if (quote.getTerms().equals("A")) {
        return toDecimal(amount) / quote.getRate();
      } else {
        return toDecimal(amount) * quote.getRate();
      }
    } else {
      if (quote.getTerms().equals("A")) {
        return toDecimal(amount) * quote.getRate();
      } else {
        return toDecimal(amount) / quote.getRate();
      }
    }
  }

  private String getValueDate(String targetCurrency, String sourceCurrency, String apiKey ) {
    String valueDate = null;
    try {
      valueDate = this.afexClient.getValueDate(targetCurrency + sourceCurrency, "SPOT", apiKey);
    } catch(Exception e) {
      // Log here
    }
    return valueDate;
  }

  public boolean acceptFXRate(String quoteId, long user) throws RuntimeException {
    // TODO: Decide whether to create Trade here?
    return true;
  }

  public void addPayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    // Check if business address is set and not empty
    Address userAddress = new Address();
    if ( user instanceof Contact ) {
      Contact contact = (Contact) user;
      if ( contact.getBusinessAddress() != null && ! SafetyUtil.equals((contact.getBusinessAddress()).getCountryId(), "") ) {
        userAddress = ((Contact) user).getBusinessAddress();
      }
    } else if (user.getAddress() != null && ! SafetyUtil.equals((user.getAddress()).getCountryId(), "") ){
      userAddress = user.getAddress();
    }
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );

    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress();
    FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount);
    if ( null == bankAddress ) {
      if ( bankInformation == null ) {
        throw new RuntimeException("Bank Account Address is null " + bankAccountId );
      }
      bankAddress = new Address.Builder(x)
        .setCountryId(bankInformation.getIsoCountryCode())
        .build();
    }

    // Check payee does not already exists on AFEX
    FindBeneficiaryResponse beneficiaryResponse = findBeneficiary(userId,afexBusiness.getApiKey());
    if ( null == beneficiaryResponse ) {
      String allowedChars = "[^a-zA-Z0-9,.+()?/:‘\\s-]";
      String beneficiaryName = user.getBusinessName().replaceAll(allowedChars,"");;
      String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();
      CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
      createBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
      createBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
      createBeneficiaryRequest.setBankName(bankName);
      String bankRoutingCode = bankAccount.getRoutingCode(this.x);
      if ( bankAccount instanceof CABankAccount) {
        bankRoutingCode = "0" + bankAccount.getBankCode(x) + bankRoutingCode;
      }
      createBeneficiaryRequest.setBankRoutingCode(bankRoutingCode);
      createBeneficiaryRequest.setBeneficiaryAddressLine1(userAddress.getAddress());
      createBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
      createBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
      createBeneficiaryRequest.setBeneficiaryName(beneficiaryName);
      createBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
      createBeneficiaryRequest.setBeneficiaryRegion(userAddress.getRegionId());
      createBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
      createBeneficiaryRequest.setVendorId(String.valueOf(userId));
      createBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

      try {
        CreateBeneficiaryResponse createBeneficiaryResponse = this.afexClient.createBeneficiary(createBeneficiaryRequest);
        if ( null == createBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
        if ( createBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to create Beneficiary at this time. " +  createBeneficiaryResponse.getInformationMessage());
        addBeneficiary(x, userId, sourceUser, createBeneficiaryResponse.getStatus());
      } catch(Throwable t) {
        logger_.error("Error creating AFEX beneficiary.", t);
      }
    } else {
      addBeneficiary(x, userId, sourceUser, beneficiaryResponse.getStatus());
    }
  }

  public FindBeneficiaryResponse findBeneficiary(long beneficiaryId, String clientApiKey) {
    FindBeneficiaryRequest findBeneficiaryRequest = new FindBeneficiaryRequest();
    findBeneficiaryRequest.setVendorId(String.valueOf(beneficiaryId));
    findBeneficiaryRequest.setClientAPIKey(clientApiKey);
    FindBeneficiaryResponse beneficiaryResponse = null;
    try {
      beneficiaryResponse = this.afexClient.findBeneficiary(findBeneficiaryRequest);
    } catch(Throwable t) {
      logger_.error("Error finding AFEX beneficiary.", t);
    }
    return beneficiaryResponse;
  }

  private void addBeneficiary(X x, long beneficiaryId, long ownerId, String status) {
    DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
    AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(
      AND(
        EQ(AFEXBeneficiary.CONTACT, beneficiaryId),
        EQ(AFEXBeneficiary.OWNER, ownerId)
      )
    );

    if ( null == afexBeneficiary ) {
      afexBeneficiary = new AFEXBeneficiary();
    }
    afexBeneficiary = (AFEXBeneficiary) afexBeneficiary.fclone();
    afexBeneficiary.setId(afexBeneficiary.getId());
    afexBeneficiary.setContact(beneficiaryId);
    afexBeneficiary.setOwner(ownerId);
    afexBeneficiary.setStatus(status);
    afexBeneficiaryDAO.put(afexBeneficiary);
  }

  public void updatePayee(long userId, long bankAccountId, long sourceUser) throws RuntimeException {
    User user = User.findUser(x, userId);
    if ( null == user ) throw new RuntimeException("Unable to find User " + userId);

    Address userAddress = user.getAddress();
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );

    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress();
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount);
    String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();

    String allowedChars = "[^a-zA-Z0-9,.+()?/:‘\\s-]";
    String beneficiaryName = user.getBusinessName().replaceAll(allowedChars,"");;
    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
    updateBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
    updateBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
    updateBeneficiaryRequest.setBankName(bankName);
    String bankRoutingCode = bankAccount.getRoutingCode(this.x);
    if ( bankAccount instanceof CABankAccount) {
      bankRoutingCode = "0" + bankAccount.getBankCode(x) + bankRoutingCode;
    }
    updateBeneficiaryRequest.setBankRoutingCode(bankRoutingCode);
    updateBeneficiaryRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
    updateBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
    updateBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
    updateBeneficiaryRequest.setBeneficiaryName(beneficiaryName);
    updateBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
    updateBeneficiaryRequest.setBeneficiaryRegion(userAddress.getRegionId());
    updateBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
    updateBeneficiaryRequest.setVendorId(String.valueOf(userId));
    updateBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

    try {
      UpdateBeneficiaryResponse updateBeneficiaryResponse = this.afexClient.updateBeneficiary(updateBeneficiaryRequest);
      if ( null == updateBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
      if ( updateBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to update Beneficiary at this time. " +  updateBeneficiaryResponse.getInformationMessage());
      addBeneficiary(x, userId, sourceUser, updateBeneficiaryResponse.getStatus());
    } catch(Throwable t) {
      logger_.error("Error creating AFEX beneficiary.", t);
    }

  }

  private boolean accountDataIsStale(BankAccount bankAccount, AFEXBeneficiary afexBeneficiary) throws RuntimeException {
    if ( null == afexBeneficiary ) return false;
    if ( null == afexBeneficiary.getLastModified() ) return true;
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account for: " + afexBeneficiary.getContact());
    Calendar accountLastModifiedDate = Calendar.getInstance();
    accountLastModifiedDate.setTime(bankAccount.getLastModified());
    Calendar afexBeneficiaryLastModifiedDate = Calendar.getInstance();
    afexBeneficiaryLastModifiedDate.setTime(afexBeneficiary.getLastModified());
    return (accountLastModifiedDate.after(afexBeneficiaryLastModifiedDate));
  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {
    AFEXBusiness afexBusiness = getAFEXBusiness(x, payerUserId);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + payerUserId);

    try{
      DisableBeneficiaryRequest request = new DisableBeneficiaryRequest();
      request.setClientAPIKey(afexBusiness.getApiKey());
      request.setVendorId(String.valueOf(payeeUserId));
      this.afexClient.disableBeneficiary(request);
      DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
      AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(AND(
        EQ(AFEXBeneficiary.CONTACT, payeeUserId),
        EQ(AFEXBeneficiary.OWNER, payerUserId)
      ));
      if ( afexBeneficiary != null ) afexBeneficiaryDAO.remove(afexBeneficiary);

    } catch(Throwable t) {
      logger_.error("Unexpected error disabling AFEX Beneficiary history record.", t);
    }
  }

  public FindBeneficiaryResponse getPayeeInfo(String payeeUserId, Long businessId) throws RuntimeException {
    FindBeneficiaryResponse payeeInfo = null;
    AFEXBusiness afexBusiness = getAFEXBusiness(x, businessId);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + businessId);
    FindBeneficiaryRequest request = new FindBeneficiaryRequest();
    request.setVendorId(payeeUserId);
    request.setClientAPIKey(afexBusiness.getApiKey());
    try {
      payeeInfo = this.afexClient.findBeneficiary(request);
    } catch(Throwable t) {
      logger_.error("Error creating AFEX beneficiary.", t);
    }
    return payeeInfo;
  }

  public int createTrade(Transaction transaction) throws  RuntimeException {
    DAO txnDAO = (DAO) x.get("localTransactionDAO");

    if ( ! (transaction instanceof AFEXTransaction) ) {
      logger_.error("Transaction id: " + transaction.getId() + " not an instance of AFEXTransaction.");
      throw new RuntimeException("Transaction id: " + transaction.getId() + " not an instance of AFEXTransaction.");
    }
    AFEXTransaction afexTransaction = (AFEXTransaction) transaction;

    AFEXBusiness afexBusiness = getAFEXBusiness(x,afexTransaction.getPayerId());
    if ( null == afexBusiness ) {
      logger_.error("Business has not been completely onboarded on partner system. " + transaction.getPayerId());
      throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());
    }

    AFEXBeneficiary afexBeneficiary = getOrCreateAFEXBeneficiary(x,afexTransaction.getPayeeId(), afexTransaction.getPayerId());
    if ( null == afexBeneficiary ) {
      logger_.error("Contact has not been completely onboarded on partner system as a Beneficiary. " + transaction.getPayerId());
      throw new RuntimeException("Contact has not been completely onboarded on partner system as a Beneficiary. " + transaction.getPayerId());
    }

    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(afexTransaction.getFxQuoteId()));
    if  ( null == quote ) {
      logger_.error("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
      throw new RuntimeException("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
    }

    long tradeAmount = 0;
    tradeAmount =  afexTransaction.getDestinationAmount();
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setClientAPIKey(afexBusiness.getApiKey());
    createTradeRequest.setAmount(String.valueOf(toDecimal(tradeAmount)));
    createTradeRequest.setIsAmountSettlement(String.valueOf(false));
    createTradeRequest.setSettlementCcy(afexTransaction.getSourceCurrency());
    createTradeRequest.setTradeCcy(afexTransaction.getDestinationCurrency());
    createTradeRequest.setQuoteID(quote.getExternalId());
    BankAccount account = (BankAccount)transaction.findSourceAccount(x);
    createTradeRequest.setAccountNumber(account.getAccountNumber());
    createTradeRequest.setNote(account.getAccountNumber() + ", " + account.getDenomination());
    createTradeRequest.setValueDate(quote.getValueDate().toString());

    try {
      CreateTradeResponse tradeResponse = this.afexClient.createTrade(createTradeRequest);
      if ( null != tradeResponse && tradeResponse.getTradeNumber() > 0 ) {
        DAO traderesponseDAO = (DAO) x.get("afexTradeResponseDAO");
        traderesponseDAO.put(tradeResponse);

      return tradeResponse.getTradeNumber();

      }
    } catch(Throwable t) {
      logger_.error("Error creating AFEX Trade.", t);
      throw new RuntimeException(t);
    }
    logger_.error("Unable to create Trade for  " + afexTransaction.getFxQuoteId());
    throw new RuntimeException("Unable to create Trade for  " + afexTransaction.getFxQuoteId());
  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException {
    if ( ! (transaction instanceof AFEXTransaction) ) return transaction;

    AFEXTransaction afexTransaction = (AFEXTransaction) transaction;
    Account destinationAccount = afexTransaction.findDestinationAccount(x);
    Account sourceAccount = afexTransaction.findSourceAccount(x);

    AFEXBusiness afexBusiness = getAFEXBusiness(x,sourceAccount.getOwner());
    if ( null == afexBusiness ) {
      logger_.error("Business has not been completely onboarded on partner system. " + sourceAccount.getOwner());
      throw new RuntimeException("Business has not been completely onboarded on partner system. " + sourceAccount.getOwner());
    }

    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, destinationAccount.getOwner(), sourceAccount.getOwner());
    if ( null == afexBeneficiary ) {
      logger_.error("Contact has not been completely onboarded on partner system as a Beneficiary. " + destinationAccount.getOwner());
      throw new RuntimeException("Contact has not been completely onboarded on partner system as a Beneficiary. " + destinationAccount.getOwner());
    }

    // If beneficiary bank account happen to have changed we want to update AFEX Beneficiary
    if ( destinationAccount instanceof BankAccount ) {
      BankAccount beneficiaryBankAccount = (BankAccount) destinationAccount;
      if ( accountDataIsStale(beneficiaryBankAccount, afexBeneficiary) ) {
        try {
          updatePayee(afexTransaction.getPayeeId(), beneficiaryBankAccount.getId(), afexTransaction.getPayerId());
        } catch(Throwable t) {
          logger_.error("Bank account details is stale but unable to update afex beneficiary." );
        }
      }
    }


    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(afexTransaction.getFxQuoteId()));
    if  ( null == quote ) {
      logger_.error("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
      throw new RuntimeException("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());
    }

    DAO traderesponseDAO = (DAO) x.get("afexTradeResponseDAO");
    CreateTradeResponse tradeResponse = (CreateTradeResponse) traderesponseDAO.find(EQ(CreateTradeResponse.TRADE_NUMBER, afexTransaction.getAfexTradeResponseNumber()));

    if ( null != tradeResponse && tradeResponse.getTradeNumber() > 0 ) {
      CreatePaymentRequest createPaymentRequest = new CreatePaymentRequest();
      createPaymentRequest.setClientAPIKey(afexBusiness.getApiKey());
      createPaymentRequest.setPaymentDate(tradeResponse.getValueDate());
      createPaymentRequest.setAmount(String.valueOf(tradeResponse.getAmount()));
      createPaymentRequest.setCurrency(tradeResponse.getTradeCcy());
      createPaymentRequest.setVendorId(String.valueOf(afexBeneficiary.getContact()));
      try {
        CreatePaymentResponse paymentResponse = this.afexClient.createPayment(createPaymentRequest);
        if ( paymentResponse != null && paymentResponse.getReferenceNumber() > 0 ) {
          AFEXTransaction txn = (AFEXTransaction) afexTransaction.fclone();
          txn.setReferenceNumber(String.valueOf(paymentResponse.getReferenceNumber()));
          try {
            Date valueDate = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").parse(tradeResponse.getValueDate());
            txn.setCompletionDate(valueDate);
          } catch(Throwable t) {
            logger_.error("Error parsing date.", t);
          }
          return txn;
        }
      } catch(Throwable t) {
        logger_.error("Error sending payment to AFEX.", t);
        throw new RuntimeException(t);
      }
    } else {
      logger_.error("Unable to find afexTradeResponse for transaction id: " + transaction.getId());
      throw new RuntimeException("Unable to find afexTradeResponse for transaction id: " + transaction.getId());
    }

    return afexTransaction;
  }

  public Transaction updatePaymentStatus(Transaction transaction) throws RuntimeException {
    if ( ! (transaction instanceof AFEXTransaction) ) return transaction;

    transaction.setPayerId(transaction.findSourceAccount(x).getOwner());
    AFEXBusiness afexBusiness = getAFEXBusiness(x,transaction.findSourceAccount(x).getOwner());
    if ( null == afexBusiness ) throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());

    CheckPaymentStatusRequest request = new CheckPaymentStatusRequest();
    request.setClientAPIKey(afexBusiness.getApiKey());
    request.setId(transaction.getReferenceNumber());

    try {
      CheckPaymentStatusResponse paymentStatusResponse = this.afexClient.checkPaymentStatus(request);
      if ( null == paymentStatusResponse ) throw new RuntimeException("Null response got for remote system." );

      transaction.setStatus(mapAFEXPaymentStatus(paymentStatusResponse.getPaymentStatus()));

    } catch(Throwable t) {
      logger_.error("Error creating AFEX beneficiary.", t);
    }

    return transaction;

  }

  public TransactionStatus mapAFEXPaymentStatus(String paymentStatus){
    if ( AFEXPaymentStatus.SUBMITTED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.APPROVED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;

    if ( AFEXPaymentStatus.PROCESSED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;     
      
    if ( AFEXPaymentStatus.PREPARED.getLabel().equals(paymentStatus) )
      return TransactionStatus.COMPLETED;       

    if ( AFEXPaymentStatus.FAILED.getLabel().equals(paymentStatus) )
      return TransactionStatus.DECLINED;

    if ( AFEXPaymentStatus.CANCELLED.getLabel().equals(paymentStatus) )
      return TransactionStatus.DECLINED;

      if ( AFEXPaymentStatus.PREPARED_CANCELLED.getLabel().equals(paymentStatus) )
      return TransactionStatus.DECLINED;      

      return TransactionStatus.SENT;

  }

  public FindBankByNationalIDResponse getBankInformation(X x, String clientAPIKey, BankAccount bankAccount) {
    FindBankByNationalIDResponse bankInformation = null;
    FindBankByNationalIDRequest findBankByNationalIDRequest = new FindBankByNationalIDRequest();
    findBankByNationalIDRequest.setClientAPIKey(clientAPIKey);
    findBankByNationalIDRequest.setCountryCode(bankAccount.getCountry());
    if ( bankAccount instanceof CABankAccount ) {
      findBankByNationalIDRequest.setNationalID("0" + bankAccount.getInstitutionNumber() + bankAccount.getBranchId());
    } else if ( bankAccount instanceof USBankAccount ) {
      findBankByNationalIDRequest.setNationalID(bankAccount.getBranchId());
    } else {
      return null;
    }
    try {
      bankInformation = this.afexClient.findBankByNationalID(findBankByNationalIDRequest);
    } catch(Throwable t) {
      logger_.error("Error finding bank information from AFEX.", t);
    }
    return bankInformation;
  }

  public byte[] getConfirmationPDF(Transaction txn) {
    if ( ! (txn instanceof AFEXTransaction) ) {
      return null;
    }
    AFEXTransaction afexTransaction = (AFEXTransaction) txn;

    AFEXBusiness business = getAFEXBusiness(x, afexTransaction.getPayerId());
    GetConfirmationPDFRequest pdfRequest = new GetConfirmationPDFRequest.Builder(x)
      .setClientAPIKey(business.getApiKey())
      .setTradeNumber(afexTransaction.getAfexTradeResponseNumber()+"")
      .build();
    try {
      return afexClient.getTradeConfirmation(pdfRequest);
    } catch (Throwable t) {
      logger_.error("Error getting trade confirmation PDF from AFEX.", t);
    }
    return null;
  }

  protected AFEXBusiness getAFEXBusiness(X x, Long userId) {
    DAO dao = (DAO) x.get("afexBusinessDAO");
    return (AFEXBusiness) dao.find(EQ(AFEXBusiness.USER, userId));
  }

  protected AFEXBeneficiary getAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    DAO dao = (DAO) x.get("afexBeneficiaryDAO");
    return (AFEXBeneficiary) dao.find(AND(EQ(AFEXBeneficiary.CONTACT, beneficiaryId), EQ(AFEXBeneficiary.OWNER, ownerId)));
  }

  protected AFEXBeneficiary getOrCreateAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x, beneficiaryId, ownerId);
    if ( afexBeneficiary == null ) {
      DAO localAccountDAO = (DAO) x.get("localAccountDAO");
      BankAccount bankAccount = ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, beneficiaryId), INSTANCE_OF(BankAccount.class), EQ(BankAccount.ENABLED, true))));
      if ( null != bankAccount ) {
        try {
          addPayee(beneficiaryId, bankAccount.getId(), ownerId);
          afexBeneficiary = getAFEXBeneficiary(x, beneficiaryId, ownerId);
        } catch(Throwable t) {
          ((Logger) x.get("logger")).error("Error creating AFEX Beneficiary.", t);
        }
      }
    }
    return afexBeneficiary;
  }

  protected User getSigningOfficer(X x, Business business) {
    java.util.List<User> signingOfficers = ((ArraySink) business.getSigningOfficers(x).getDAO().select(new ArraySink())).getArray();
    return signingOfficers.isEmpty() ? null : signingOfficers.get(0);
  }

  protected String getAFEXIdentificationType(long idType) {
    switch((int)idType) {
      case 1:
        return "DriversLicense";
      case 2:
        return "CitizenshipCard";
      case 3:
        return "Passport";
      default:
        return "Item";
    }
  }

  protected String getAFEXCompanyType(long companyType) {
    switch((int)companyType) {
      case 1:
        return "Sole Proprietorship";
      case 2:
        return "Partnership";
      case 3:
        return "Corporation";
      case 4:
        return "Registered Charity";
      case 5:
        return "Limited Liability Company (LLC)";
      case 6:
        return "Public Limited Company";
      default:
        return ((BusinessType) ((DAO) this.x.get("businessTypeDAO")).find(companyType)).getName();
    }
  }

  private String mapAFEXVolumeEstimates(String estimates) {
    switch (estimates) {
    case "$0 to $50,000":
      return String.valueOf(50000/12);
    case "$50,001 to $100,000":
      return String.valueOf(100000/12);
    case "$100,001 to $500,000":
      return String.valueOf(500000/12);
    default:
      return String.valueOf(1000000/12);
    }
  }

  private String mapAFEXTransactionCount(String estimates) {
    switch (estimates) {
    case "1 to 99":
      return String.valueOf(99/12);
    case "100 to 199":
      return String.valueOf(199/12);
    case "200 to 499":
      return String.valueOf(499/12);
    case "500 to 999":
      return String.valueOf(999/12);
    default:
      return String.valueOf(1000/12);
    }
  }

  private Double toDecimal(Long amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.divide(x100).setScale(2,BigDecimal.ROUND_HALF_DOWN).doubleValue();
  }

  private Long fromDecimal(Double amount) {
    BigDecimal x100 = new BigDecimal(100);
    BigDecimal val = BigDecimal.valueOf(amount).setScale(2,BigDecimal.ROUND_HALF_DOWN);
    return val.multiply(x100).longValueExact();
  }

}
