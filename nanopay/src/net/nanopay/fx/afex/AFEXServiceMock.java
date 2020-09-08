package net.nanopay.fx.afex;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.logger.Logger;

public class AFEXServiceMock extends ContextAwareSupport implements AFEX {

  private Logger logger;

  public AFEXServiceMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }


  @Override
  public Token getToken(String spid) {
    return null;
  }

  @Override
  public OnboardCorporateClientResponse onboardCorporateClient(OnboardCorporateClientRequest request, String spid) {
    OnboardCorporateClientResponse response = new OnboardCorporateClientResponse();
    response.setAPIKey("API_KEY");
    response.setAccountNumber("00000122");
    return response;
  }

  @Override
  public GetClientAccountStatusResponse getClientAccountStatus(String clientAPIKey, String spid) {
    return null;
  }

  @Override
  public RetrieveClientAccountDetailsResponse retrieveClientAccountDetails(String clientAPIKey, String spid) {
    return null;
  }

  @Override
  public CreateBeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request, String spid) {
    CreateBeneficiaryResponse response = new CreateBeneficiaryResponse();
    response.setCode(0);
    response.setStatus("Active");
    return null;
  }

  @Override
  public UpdateBeneficiaryResponse updateBeneficiary(UpdateBeneficiaryRequest request, String spid) {
    return null;
  }

  @Override
  public String disableBeneficiary(DisableBeneficiaryRequest request, String spid) {
    return null;
  }

  @Override
  public FindBeneficiaryResponse findBeneficiary(FindBeneficiaryRequest request, String spid) {
    FindBeneficiaryResponse response = new FindBeneficiaryResponse();
    response.setBeneficiaryName("Test Beneficiary");
    return response;
  }

  @Override
  public FindBankByNationalIDResponse findBankByNationalID(FindBankByNationalIDRequest request, String spid) {
    return null;
  }

  @Override
  public String getValueDate(String currencyPair, String valueType, String businessApiKey, String spid) {
    return null;
  }

  @Override
  public GetRateResponse getRate(GetRateRequest request, String spid) {
    return null;
  }

  @Override
  public GetRateResponse getSpotRate(GetRateRequest request, String spid) { return null; }

  @Override
  public Quote getQuote(GetQuoteRequest request, String spid) {

    Date date = Calendar.getInstance().getTime();
    DateFormat dateFormat = new SimpleDateFormat("yyyy-mm-dd'T'hh:mm:ss");
    String strDate = dateFormat.format(date);
    Quote quote = new Quote.Builder(getX())
      .setAmount(Double.parseDouble(request.getAmount()))
      .setQuoteId(request.getAmount()+1)
      .setValueDate(strDate)
      .build();
    if ( request.getCurrencyPair().equals("CADUSD") ) {
      quote.setRate(1.34);
      quote.setTerms("E");
    } else if ( request.getCurrencyPair().equals("USDUSD") ){
      quote.setRate(1);
    } else if ( request.getCurrencyPair().equals("USDCAD") ) {
      quote.setTerms("A");
      quote.setRate(1.34);
    }
    return quote;
  }

  @Override
  public CreateTradeResponse createTrade(CreateTradeRequest request, String spid) {
    return null;
  }

  @Override
  public CheckTradeStatusResponse checkTradeStatus(CheckTradeStatusRequest request, String spid) {
    return null;
  }

  @Override
  public net.nanopay.fx.afex.CreatePaymentResponse createPayment(CreatePaymentRequest request, String spid) {
    return null;
  }

  @Override
  public CheckPaymentStatusResponse checkPaymentStatus(CheckPaymentStatusRequest request, String spid) {
    return null;
  }

  @Override
  public byte[] getTradeConfirmation(GetConfirmationPDFRequest confirmationPDFRequest, String spid) {
    return null;
  }

  @Override
  public String directDebitEnrollment(DirectDebitEnrollmentRequest directDebitRequest, String spid) {
    return null;
  }

  @Override
  public String directDebitUnenrollment(DirectDebitUnenrollmentRequest directDebitRequest, String spid) {
    return null;
  }

  @Override
  public String addCompanyOfficer(AddCompanyOfficerRequest addCompanyOfficerRequest, String spid) {
    return null;
  }

  @Override
  public CreateFundingBalanceResponse createFundingBalance(CreateFundingBalanceRequest createFundingBalanceRequest, String spid) {
    return null;
  }

  @Override
  public GetFundingBalanceResponse getFundingBalance(String clientAPIKey, String currency, String spid) {
    return null;
  }

  @Override
  public CreateInstantBenefiaryResponse createInstantBenefiary(CreateInstantBenefiaryRequest createInstantBenefiaryRequest, String spid) {
    return null;
  }

  @Override
  public ValidateInstantBenefiaryResponse validateInstantBenefiaryRequest(ValidateInstantBenefiaryRequest validateInstantBenefiary, String spid)  {
    return null;
  }
}
