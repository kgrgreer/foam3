package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
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
import java.util.ArrayList;
import java.util.List;

public class AFEXService extends ContextAwareSupport implements AFEX {

  private String apiKey;
  private String apiPassword;
  private String partnerAPI;
  private String AFEXAPI;
  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private String valueDate;

  public AFEXService(X x) {
    setX(x);
    AFEXCredentials credentials = getCredentials();
    apiKey = credentials.getApiKey();
    apiPassword = credentials.getApiPassword();
    partnerAPI = credentials.getPartnerApi();
    AFEXAPI = credentials.getAFEXApi();
    httpClient = HttpClients.createDefault();
    jsonParser = new JSONParser();
    jsonParser.setX(x);
    logger = (Logger) x.get("logger");
  }

  protected AFEXCredentials getCredentials() {
    AFEXCredentials credentials = (AFEXCredentials) getX().get("AFEXCredentials");
    if ( credentials == null ||
      SafetyUtil.isEmpty(credentials.getApiKey()) ||
      SafetyUtil.isEmpty(credentials.getApiPassword()) ||
      SafetyUtil.isEmpty(credentials.getPartnerApi()) ||
      SafetyUtil.isEmpty(credentials.getAFEXApi()) ) {
      logger.error(this.getClass().getSimpleName(), "invalid credentials");
      throw new RuntimeException("AFEX invalid credentials");
    }
    return credentials;
  }

  @Override
  public Token getToken() {
    try {
      HttpPost httpPost = new HttpPost(partnerAPI + "token");

      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Grant_Type", "password"));
      nvps.add(new BasicNameValuePair("Username", apiKey));
      nvps.add(new BasicNameValuePair("Password", apiPassword));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);
      String response = new BasicResponseHandler().handleResponse(httpResponse);

      Token token = (Token) jsonParser.parseString(response, Token.class);
      System.out.println("parsed token: " + token.getAccess_token());
      System.out.println(token.getToken_type());
      System.out.println(token.getExpires_in());

      return token;
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public OnboardCorporateClientResponse onboardCorporateClient(OnboardCorporateClientRequest request) {
    try {
      HttpPost httpPost = new HttpPost(partnerAPI + "api/v1/corporateClient");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
      httpPost.addHeader("Authorization", "bearer " + getToken().getAccess_token());

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("AccountPrimaryIdentificationExpirationDate", request.getAccountPrimaryIdentificationExpirationDate()));
      nvps.add(new BasicNameValuePair("AccountPrimaryIdentificationNumber", request.getAccountPrimaryIdentificationNumber()));
      nvps.add(new BasicNameValuePair("AccountPrimaryIdentificationType", request.getAccountPrimaryIdentificationType()));
      nvps.add(new BasicNameValuePair("BusinessAddress1", request.getBusinessAddress1()));
      nvps.add(new BasicNameValuePair("BusinessCity", request.getBusinessCity()));
      nvps.add(new BasicNameValuePair("BusinessCountryCode", request.getBusinessCountryCode()));
      nvps.add(new BasicNameValuePair("BusinessName", request.getBusinessName()));
      nvps.add(new BasicNameValuePair("BusinessZip", request.getBusinessZip()));
      nvps.add(new BasicNameValuePair("CompanyType", request.getCompanyType()));
      nvps.add(new BasicNameValuePair("ContactBusinessPhone", request.getContactBusinessPhone()));
      nvps.add(new BasicNameValuePair("DateOfIncorporation", request.getDateOfIncorporation()));
      nvps.add(new BasicNameValuePair("FirstName", request.getFirstName()));
      nvps.add(new BasicNameValuePair("Gender", request.getGender()));
      nvps.add(new BasicNameValuePair("LastName", request.getLastName()));
      nvps.add(new BasicNameValuePair("PrimaryEmailAddress", request.getPrimaryEmailAddress()));
      nvps.add(new BasicNameValuePair("TermsAndConditions", request.getTermsAndConditions()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Onboard AFEX corporate client failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      OnboardCorporateClientResponse onboardCorporateClientResponse = (OnboardCorporateClientResponse) jsonParser.parseString(response, OnboardCorporateClientResponse.class);

      System.out.println(onboardCorporateClientResponse.getAPIKey());
      System.out.println(onboardCorporateClientResponse.getAccountNumber());
      System.out.println(onboardCorporateClientResponse.getMessage());

      return onboardCorporateClientResponse;
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateBeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/beneficiaryCreate");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("BankAccountNumber", request.getBankAccountNumber()));
      nvps.add(new BasicNameValuePair("BankCountryCode", request.getBankCountryCode()));
      nvps.add(new BasicNameValuePair("BankName", request.getBankName()));
      nvps.add(new BasicNameValuePair("BankRoutingCode", request.getBankRoutingCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryAddressLine1", request.getBeneficiaryAddressLine1()));
      nvps.add(new BasicNameValuePair("BeneficiaryCity", request.getBeneficiaryCity()));
      nvps.add(new BasicNameValuePair("BeneficiaryCountryCode", request.getBeneficiaryCountryCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryName", request.getBeneficiaryName()));
      nvps.add(new BasicNameValuePair("BeneficiaryPostalCode", request.getBeneficiaryPostalCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryRegion", request.getBeneficiaryRegion()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      Object[] respArr = jsonParser.parseStringForArray(response, CreateBeneficiaryResponse.class);

      if ( respArr.length != 0 ) {
        CreateBeneficiaryResponse createBeneficiaryResponse = (CreateBeneficiaryResponse) respArr[0];
        System.out.println("Add beneficiary response: ");
        System.out.println(createBeneficiaryResponse.getName());
        System.out.println(createBeneficiaryResponse.getCode());
        System.out.println(createBeneficiaryResponse.getInformationMessage());
        System.out.println(createBeneficiaryResponse.getInformationCode());
        System.out.println(createBeneficiaryResponse.getStatus());

        return createBeneficiaryResponse;
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public UpdateBeneficiaryResponse updateBeneficiary(UpdateBeneficiaryRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/beneficiaryUpdate");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("BankAccountNumber", request.getBankAccountNumber()));
      nvps.add(new BasicNameValuePair("BankCountryCode", request.getBankCountryCode()));
      nvps.add(new BasicNameValuePair("BankName", request.getBankName()));
      nvps.add(new BasicNameValuePair("BankRoutingCode", request.getBankRoutingCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryAddressLine1", request.getBeneficiaryAddressLine1()));
      nvps.add(new BasicNameValuePair("BeneficiaryCity", request.getBeneficiaryCity()));
      nvps.add(new BasicNameValuePair("BeneficiaryCountryCode", request.getBeneficiaryCountryCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryName", request.getBeneficiaryName()));
      nvps.add(new BasicNameValuePair("BeneficiaryPostalCode", request.getBeneficiaryPostalCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryRegion", request.getBeneficiaryRegion()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("VendorId",  request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Update AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      Object[] respArr = jsonParser.parseStringForArray(response, UpdateBeneficiaryResponse.class);

      if ( respArr.length != 0 ) {
        for ( Object resp : respArr) {
          UpdateBeneficiaryResponse updateBeneficiaryResponse = (UpdateBeneficiaryResponse) resp;
          if ( updateBeneficiaryResponse.getName().equals("Beneficiary has been updated") ) {
            System.out.println("Update Payee response: ");
            System.out.println(updateBeneficiaryResponse.getName());
            System.out.println(updateBeneficiaryResponse.getCode());
            System.out.println(updateBeneficiaryResponse.getInformationMessage());
            System.out.println(updateBeneficiaryResponse.getInformationCode());
            System.out.println(updateBeneficiaryResponse.getStatus());

            return updateBeneficiaryResponse;
          }
        }
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public String disableBeneficiary(String vendorId) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/beneficiaryDisable");
      uriBuilder.setParameter("VendorId", vendorId);

      HttpPost httpPost = new HttpPost(uriBuilder.build());

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");


      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Disable AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      System.out.println("disable beneficiary response: " + response.substring(1, response.length() - 1));

      return response.substring(1, response.length() - 1);
    } catch (IOException | URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public FindBeneficiaryResponse findBeneficiary(String vendorId) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/beneficiary/find");
      uriBuilder.setParameter("VendorId", vendorId);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Get AFEX payee information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      FindBeneficiaryResponse findBeneficiaryResponse = (FindBeneficiaryResponse) jsonParser.parseString(response, FindBeneficiaryResponse.class);
      System.out.println("find beneficiary response: ");
      System.out.println(findBeneficiaryResponse.getCurrency());
      System.out.println(findBeneficiaryResponse.getVendorId());
      System.out.println(findBeneficiaryResponse.getBeneficiaryName());
      System.out.println(findBeneficiaryResponse.getBeneficiaryAddressLine1());
      System.out.println(findBeneficiaryResponse.getBeneficiaryCity());
      System.out.println(findBeneficiaryResponse.getBeneficiaryCountryCode());

      return findBeneficiaryResponse;
    } catch (IOException | URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public String getValueDate(String currencyPair, String valueType) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/valuedates");
      uriBuilder.setParameter("CurrencyPair", currencyPair)
                .setParameter("ValueType", valueType);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Get AFEX value date information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      System.out.println("value date response: " + response.substring(1, response.length() - 1));

      return response.substring(1, response.length() - 1);
    } catch (IOException | URISyntaxException e) {
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public Quote getQuote(GetQuoteRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/quote");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair())
        .setParameter("ValueDate", request.getValueDate())
        .setParameter("OptionDate", request.getOptionDate())
        .setParameter("Amount", request.getAmount());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");
      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
      String response = new BasicResponseHandler().handleResponse(httpResponse);

      Quote quote = (Quote) jsonParser.parseString(response, Quote.class);
      System.out.println("quote: ");
      System.out.println(quote.getRate());
      System.out.println(quote.getInvertedRate());
      System.out.println(quote.getValueDate());
      System.out.println(quote.getOptionDate());
      System.out.println(quote.getQuoteId());
      System.out.println(quote.getTerms());
      System.out.println(quote.getAmount());
      System.out.println(quote.getIsAmountSettlement());

      return quote;
    } catch (IOException | URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateTradeResponse createTrade(CreateTradeRequest request) {
    try {
      valueDate = getValueDate(request.getTradeCcy() + request.getSettlementCcy(), "CASH");
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/trades/create");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      // todo: need quote id?
      //nvps.add(new BasicNameValuePair("QuoteID", request.getQuoteID()));
      nvps.add(new BasicNameValuePair("SettlementCcy", request.getSettlementCcy()));
      nvps.add(new BasicNameValuePair("TradeCcy", request.getTradeCcy()));
      nvps.add(new BasicNameValuePair("ValueDate", valueDate));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Create AFEX trade failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      CreateTradeResponse createTradeResponse = (CreateTradeResponse) jsonParser.parseString(response, CreateTradeResponse.class);

      System.out.println(createTradeResponse.getTradeNumber());
      System.out.println(createTradeResponse.getAmount());
      System.out.println(createTradeResponse.getRate());
      System.out.println(createTradeResponse.getTradeCcy());
      System.out.println(createTradeResponse.getSettlementAmt());
      System.out.println(createTradeResponse.getSettlementCcy());
      System.out.println(createTradeResponse.getValueDate());

      return createTradeResponse;
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public net.nanopay.fx.afex.CreatePaymentResponse createPayment(CreatePaymentRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/payments/create");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("PaymentDate", valueDate));
      nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
        throw new RuntimeException("Create AFEX payment failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      CreatePaymentResponse createPaymentResponse = (CreatePaymentResponse) jsonParser.parseString(response, CreatePaymentResponse.class);

      System.out.println(createPaymentResponse.getReferenceNumber());
      System.out.println(createPaymentResponse.getAmount());
      System.out.println(createPaymentResponse.getCcy());
      System.out.println(createPaymentResponse.getPaymentDate());
      System.out.println(createPaymentResponse.getMessage());

      return createPaymentResponse;
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }
}
