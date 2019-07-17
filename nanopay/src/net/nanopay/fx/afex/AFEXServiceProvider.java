package net.nanopay.fx.afex;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import static foam.mlang.MLang.*;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.model.Business;
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.model.Transaction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.text.SimpleDateFormat;

public class AFEXServiceProvider extends ContextAwareSupport implements FXService, PaymentService {

  private  AFEX afexClient;
  protected DAO fxQuoteDAO_;
  private  X x;

  public AFEXServiceProvider(X x, final AFEX afexClient) {
    this.afexClient = afexClient;
    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    this.x = x;
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

  public boolean onboardBusiness(Business business, BankAccount bankAccount) {
    Logger logger = (Logger) this.x.get("logger");
    if ( ! ((AppConfig) this.x.get("appConfig")).getEnableInternationalPayment() ) return false;

    if ( business == null ||  ! business.getCompliance().equals(ComplianceStatus.PASSED) ) return false;

    if ( bankAccount == null ||  bankAccount.getStatus() != BankAccountStatus.VERIFIED ) return false;

    try {
      if  ( business.getOnboarded() ) {
        DAO afexBusinessDAO = (DAO) this.x.get("afexBusinessDAO");
        AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
        if ( afexBusiness != null ) return false;

        AuthService auth = (AuthService) this.x.get("auth");
        boolean hasFXProvisionPayerPermission = auth.checkUser(this.x, business, "fx.provision.payer");
        if ( hasFXProvisionPayerPermission ) {
          User signingOfficer = getSigningOfficer(this.x, business);
          if ( signingOfficer != null ) {
            String identificationExpiryDate = null;
            try {
              identificationExpiryDate = new SimpleDateFormat("yyyy/MM/dd").format(signingOfficer.getIdentification().getExpirationDate()); 
            } catch(Throwable t) {
              logger.error("Error creating AFEX beneficiary.", t);
            } 
            AFEXService afexService = (AFEXService) this.x.get("afexService");
            OnboardCorporateClientRequest onboardingRequest = new OnboardCorporateClientRequest();
            onboardingRequest.setAccountPrimaryIdentificationExpirationDate(identificationExpiryDate);
            onboardingRequest.setAccountPrimaryIdentificationNumber(String.valueOf(signingOfficer.getIdentification().getIdentificationNumber()));
            onboardingRequest.setAccountPrimaryIdentificationType(getAFEXIdentificationType(signingOfficer.getIdentification().getIdentificationTypeId())); // TODO: This should ref AFEX ID type
            onboardingRequest.setBusinessAddress1(business.getAddress().getAddress());
            onboardingRequest.setBusinessCity(business.getAddress().getCity());
            onboardingRequest.setBusinessCountryCode(business.getAddress().getCountryId());
            onboardingRequest.setBusinessName(business.getBusinessName());
            onboardingRequest.setBusinessZip(business.getAddress().getPostalCode());
            onboardingRequest.setCompanyType(getAFEXCompanyType(business.getBusinessTypeId()));
            onboardingRequest.setContactBusinessPhone(business.getBusinessPhone().getNumber());
            String businessRegDate = null;
            try {
              businessRegDate = new SimpleDateFormat("yyyy/MM/dd").format(business.getBusinessRegistrationDate()); 
            } catch(Throwable t) {
              logger.error("Error creating AFEX beneficiary.", t);
            } 
            onboardingRequest.setDateOfIncorporation(businessRegDate);
            onboardingRequest.setFirstName(signingOfficer.getFirstName());
            onboardingRequest.setGender(signingOfficer.getGender().getLabel()); //TODO
            onboardingRequest.setLastName(signingOfficer.getLastName());
            onboardingRequest.setPrimaryEmailAddress(signingOfficer.getEmail());
            onboardingRequest.setTermsAndConditions("true");
            OnboardCorporateClientResponse newClient = afexService.onboardCorporateClient(onboardingRequest);
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
      ((Logger) getX().get("logger")).error("Failed to onboard client to AFEX.", e);
    }

    return false;

  }

  public FXQuote getFXRate(String sourceCurrency, String targetCurrency, long sourceAmount,  long destinationAmount,
    String fxDirection, String valueDate, long user, String fxProvider) throws RuntimeException {
    FXQuote fxQuote = new FXQuote();
    GetQuoteRequest quoteRequest = new GetQuoteRequest();
    boolean isAmountSettlement = sourceAmount > 0 ? true : false;
    Long amount = isAmountSettlement ? sourceAmount : destinationAmount;
    quoteRequest.setAmount(String.valueOf(toDecimal(amount)));
    quoteRequest.setCurrencyPair(targetCurrency + sourceCurrency);
    quoteRequest.setValueDate(getValueDate(targetCurrency, sourceCurrency));
    try {
      Quote quote = this.afexClient.getQuote(quoteRequest);
      if ( null != quote ) {
        Double fxAmount = isAmountSettlement ? toDecimal(sourceAmount) *  quote.getRate():  toDecimal(destinationAmount) *  quote.getInvertedRate();
        fxQuote.setRate(quote.getRate());
        fxQuote.setTargetAmount(isAmountSettlement ? fromDecimal(fxAmount) : destinationAmount);
        fxQuote.setTargetCurrency(targetCurrency);
        fxQuote.setSourceAmount(isAmountSettlement ? sourceAmount : fromDecimal(fxAmount));
        fxQuote.setSourceCurrency(sourceCurrency);
        fxQuote.setValueDate(quote.getValueDate());
        fxQuote.setExternalId(quote.getQuoteId());
        fxQuote.setHasSourceAmount(isAmountSettlement);
        fxQuote = (FXQuote) fxQuoteDAO_.put_(x, fxQuote);
      }

    } catch(Exception e) {
      ((Logger) getX().get("logger")).error("Error to get FX Rate from AFEX.", e);
    }

    return fxQuote;
  }

  private String getValueDate(String targetCurrency, String sourceCurrency ) {
    String valueDate = null;
    try {
      valueDate = this.afexClient.getValueDate(targetCurrency + sourceCurrency, "CASH");
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

    Address userAddress = user.getAddress() == null ? user.getBusinessAddress() : user.getAddress(); 
    if ( null == userAddress ) throw new RuntimeException("User Address is null " + userId );
    
    BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(bankAccountId);
    if ( null == bankAccount ) throw new RuntimeException("Unable to find Bank account: " + bankAccountId );

    Address bankAddress = bankAccount.getAddress() == null ? bankAccount.getBankAddress() : bankAccount.getAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    // Check payee does not already exists on AFEX
    FindBeneficiaryResponse beneficiaryResponse = findBeneficiary(userId,afexBusiness.getApiKey());
    if ( null == beneficiaryResponse ) {
      FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount);
      String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();
      CreateBeneficiaryRequest createBeneficiaryRequest = new CreateBeneficiaryRequest();
      createBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
      createBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
      createBeneficiaryRequest.setBankName(bankName);
      createBeneficiaryRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
      createBeneficiaryRequest.setBeneficiaryAddressLine1(userAddress.getAddress());
      createBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
      createBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
      createBeneficiaryRequest.setBeneficiaryName(user.getBusinessName());
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
        ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
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
      ((Logger) x.get("logger")).error("Error finding AFEX beneficiary.", t);
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

    Address bankAddress = bankAccount.getBankAddress(); 
    if ( null == bankAddress ) throw new RuntimeException("Bank Account Address is null " + bankAccountId );

    AFEXBusiness afexBusiness = getAFEXBusiness(x, sourceUser);
    if ( null == afexBusiness ) throw new RuntimeException("Business as not been completely onboarded on partner system. " + sourceUser);

    FindBankByNationalIDResponse bankInformation = getBankInformation(x,afexBusiness.getApiKey(),bankAccount);
    String bankName = bankInformation != null ? bankInformation.getInstitutionName() : bankAccount.getName();

    UpdateBeneficiaryRequest updateBeneficiaryRequest = new UpdateBeneficiaryRequest();
    updateBeneficiaryRequest.setBankAccountNumber(bankAccount.getAccountNumber());
    updateBeneficiaryRequest.setBankCountryCode(bankAddress.getCountryId());
    updateBeneficiaryRequest.setBankName(bankName);
    updateBeneficiaryRequest.setBankRoutingCode(bankAccount.getRoutingCode(this.x));
    updateBeneficiaryRequest.setBeneficiaryAddressLine1(bankAddress.getAddress());
    updateBeneficiaryRequest.setBeneficiaryCity(userAddress.getCity());
    updateBeneficiaryRequest.setBeneficiaryCountryCode(userAddress.getCountryId());
    updateBeneficiaryRequest.setBeneficiaryName(user.getLegalName());
    updateBeneficiaryRequest.setBeneficiaryPostalCode(userAddress.getPostalCode());
    updateBeneficiaryRequest.setBeneficiaryRegion(userAddress.getRegionId());
    updateBeneficiaryRequest.setCurrency(bankAccount.getDenomination());
    updateBeneficiaryRequest.setVendorId(String.valueOf(userId));
    updateBeneficiaryRequest.setClientAPIKey(afexBusiness.getApiKey());

    try {
      UpdateBeneficiaryResponse updateBeneficiaryResponse = this.afexClient.updateBeneficiary(updateBeneficiaryRequest);
      if ( null == updateBeneficiaryResponse ) throw new RuntimeException("Null response got for remote system." );
      if ( updateBeneficiaryResponse.getCode() != 0 ) throw new RuntimeException("Unable to update Beneficiary at this time. " +  updateBeneficiaryResponse.getInformationMessage());
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }    

  }

  public void deletePayee(long payeeUserId, long payerUserId) throws RuntimeException {}

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
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }
    return payeeInfo;
  }

  public Transaction submitPayment(Transaction transaction) throws RuntimeException {
    if ( ! (transaction instanceof AFEXTransaction) ) return transaction;

    AFEXTransaction afexTransaction = (AFEXTransaction) transaction;

    AFEXBusiness afexBusiness = getAFEXBusiness(x,afexTransaction.getPayerId());
    if ( null == afexBusiness ) throw new RuntimeException("Business has not been completely onboarded on partner system. " + transaction.getPayerId());

    AFEXBeneficiary afexBeneficiary = getAFEXBeneficiary(x,afexTransaction.getPayeeId(), afexTransaction.getPayerId());
    if ( null == afexBeneficiary ) throw new RuntimeException("Ontact has not been completely onboarded on partner system as a Beneficiary. " + transaction.getPayerId());

    FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(afexTransaction.getFxQuoteId()));
    if  ( null == quote ) throw new RuntimeException("FXQuote not found with Quote ID:  " + afexTransaction.getFxQuoteId());

    long tradeAmount = 0;
    boolean isAmountSettlement = quote.getHasSourceAmount();
    tradeAmount = isAmountSettlement ? afexTransaction.getAmount() : afexTransaction.getDestinationAmount();
    CreateTradeRequest createTradeRequest = new CreateTradeRequest();
    createTradeRequest.setClientAPIKey(afexBusiness.getApiKey());
    createTradeRequest.setAmount(String.valueOf(toDecimal(tradeAmount)));
    createTradeRequest.setIsAmountSettlement(String.valueOf(isAmountSettlement));
    createTradeRequest.setSettlementCcy(afexTransaction.getSourceCurrency());
    createTradeRequest.setTradeCcy(afexTransaction.getDestinationCurrency());
    createTradeRequest.setQuoteID(quote.getExternalId());
    try {
      CreateTradeResponse tradeResponse = this.afexClient.createTrade(createTradeRequest);
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
              Date valueDate = new SimpleDateFormat("yyyy/MM/dd").parse(tradeResponse.getValueDate());
              txn.setCompletionDate(valueDate); 
            } catch(Throwable t) {
              ((Logger) x.get("logger")).error("Error parsing date.", t);
            } 
            return txn;
          }
        } catch(Throwable t) {
          ((Logger) x.get("logger")).error("Error sending payment to AFEX.", t);
          throw new RuntimeException(t);
        } 
      }
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error createing AFEX Trade.", t);
      throw new RuntimeException(t);
    }

    return afexTransaction;
  }

  public FindBankByNationalIDResponse getBankInformation(X x, String clientAPIKey, BankAccount bankAccount) {
    FindBankByNationalIDResponse bankInformation = null;
    Address bankAddress = bankAccount.getBankAddress(); 
    if ( null == bankAddress ) return bankInformation;

    FindBankByNationalIDRequest findBankByNationalIDRequest = new FindBankByNationalIDRequest();
    findBankByNationalIDRequest.setClientAPIKey(clientAPIKey);
    findBankByNationalIDRequest.setCity(bankAddress.getCity());
    findBankByNationalIDRequest.setCountryCode(bankAddress.getCountryId());
    findBankByNationalIDRequest.setInstitution(bankAccount.getBankCode(x));
    findBankByNationalIDRequest.setNationalID(bankAccount.getRoutingCode(x));
    try {
      bankInformation = this.afexClient.findBankByNationalID(findBankByNationalIDRequest);
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error findind bank information from AFEX.", t);
    }
    return bankInformation;
  }

  protected AFEXBusiness getAFEXBusiness(X x, Long userId) {
    DAO dao = (DAO) x.get("afexBusinessDAO");
    return (AFEXBusiness) dao.find(AND(EQ(AFEXBusiness.USER, userId), EQ(AFEXBusiness.STATUS, "Active")));
  }

  protected AFEXBeneficiary getAFEXBeneficiary(X x, Long beneficiaryId, Long ownerId) {
    DAO dao = (DAO) x.get("afexBeneficiaryDAO");
    return (AFEXBeneficiary) dao.find(AND(EQ(AFEXBeneficiary.CONTACT, beneficiaryId), EQ(AFEXBeneficiary.OWNER, ownerId), 
      EQ(AFEXBeneficiary.STATUS, "Active")));
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
      default:
        return "";
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
