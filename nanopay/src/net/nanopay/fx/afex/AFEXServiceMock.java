package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.model.Currency;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

import java.io.IOException;
import java.net.URISyntaxException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class AFEXServiceMock extends ContextAwareSupport implements AFEX {

  private Logger logger;

  public AFEXServiceMock(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
  }


  @Override
  public Token getToken() {
    return null;
  }

  @Override
  public OnboardCorporateClientResponse onboardCorporateClient(OnboardCorporateClientRequest request) {
    OnboardCorporateClientResponse response = new OnboardCorporateClientResponse();
    response.setAPIKey("API_KEY");
    response.setAccountNumber("00000122");
    return response;
  }

  @Override
  public GetClientAccountStatusResponse getClientAccountStatus(String clientAPIKey) {
    return null;
  }

  @Override
  public RetrieveClientAccountDetailsResponse retrieveClientAccountDetails(String clientAPIKey) {
    return null;
  }

  @Override
  public CreateBeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request) {
    CreateBeneficiaryResponse response = new CreateBeneficiaryResponse();
    response.setCode(0);
    response.setStatus("Active");
    return null;
  }

  @Override
  public UpdateBeneficiaryResponse updateBeneficiary(UpdateBeneficiaryRequest request) {
    return null;
  }

  @Override
  public String disableBeneficiary(DisableBeneficiaryRequest request) {
    return null;
  }

  @Override
  public FindBeneficiaryResponse findBeneficiary(FindBeneficiaryRequest request) {
    FindBeneficiaryResponse response = new FindBeneficiaryResponse();
    response.setBeneficiaryName("Test Beneficiary");
    return response;
  }

  @Override
  public FindBankByNationalIDResponse findBankByNationalID(FindBankByNationalIDRequest request) {
    return null;
  }

  @Override
  public String getValueDate(String currencyPair, String valueType) {
    return null;
  }

  @Override
  public GetRateResponse getRate(GetRateRequest request) {
    return null;
  }

  @Override
  public Quote getQuote(GetQuoteRequest request) {

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
  public CreateTradeResponse createTrade(CreateTradeRequest request) {
    return null;
  }

  @Override
  public CheckTradeStatusResponse checkTradeStatus(CheckTradeStatusRequest request) {
    return null;
  }

  @Override
  public net.nanopay.fx.afex.CreatePaymentResponse createPayment(CreatePaymentRequest request) {
    return null;
  }

  @Override
  public CheckPaymentStatusResponse checkPaymentStatus(CheckPaymentStatusRequest request) {
    return null;
  }
}
