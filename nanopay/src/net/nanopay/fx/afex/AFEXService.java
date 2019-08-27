package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.lib.NetworkPropertyPredicate;
import foam.nanos.logger.Logger;
import foam.nanos.om.OMLogger;
import foam.util.SafetyUtil;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.util.EntityUtils;

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
  private OMLogger omLogger;

  public AFEXService(X x) {
    setX(x);
    AFEXCredentials credentials = getCredentials();
    apiKey = credentials.getApiKey();
    apiPassword = credentials.getApiPassword();
    partnerAPI = credentials.getPartnerApi();
    AFEXAPI = credentials.getAFEXApi();
    RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(5000).build();
    httpClient = HttpClientBuilder.create().setDefaultRequestConfig(requestConfig).build();
    jsonParser = new JSONParser();
    jsonParser.setX(x);
    logger = (Logger) x.get("logger");
    omLogger = (OMLogger) x.get("OMLogger");
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

      omLogger.log("AFEX getToken starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX getToken complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "AFEX get token failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (Token) jsonParser.parseString(response, Token.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX getToken timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public OnboardCorporateClientResponse onboardCorporateClient(OnboardCorporateClientRequest request) {
    try {
      HttpPost httpPost = new HttpPost(partnerAPI + "api/v1/corporateClient");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/json");
      httpPost.addHeader("Authorization", "bearer " + getToken().getAccess_token());

      Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false);
      String requestJson = jsonOutputter.stringify(request);
      StringEntity params =new StringEntity(requestJson); 

      httpPost.setEntity(params);

      omLogger.log("AFEX onboardCorpateClient starting");

      logger.debug(params);

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX onboardCorpateClient complete");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Onboard AFEX corporate client failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (OnboardCorporateClientResponse) jsonParser.parseString(response, OnboardCorporateClientResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX onboardCorpateClient timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public GetClientAccountStatusResponse getClientAccountStatus(String clientAPIKey) {
    try {
      URIBuilder uriBuilder = new URIBuilder(partnerAPI + "api/v1/clientstatus");
      uriBuilder.setParameter("ApiKey", clientAPIKey);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/x-www-form-urlencoded");
      httpGet.addHeader("Authorization", "bearer " + getToken().getAccess_token());

      omLogger.log("AFEX getClientAccountStatus starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX getClientAccountStatus complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Get AFEX Client Account Status failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logger.debug(response);
        return (GetClientAccountStatusResponse) jsonParser.parseString(response, GetClientAccountStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof IOException ) {
        omLogger.log("AFEX getClientAccountStatus timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public RetrieveClientAccountDetailsResponse retrieveClientAccountDetails(String clientAPIKey) {

    try {
      URIBuilder uriBuilder = new URIBuilder(partnerAPI + "api/v1/privateclient");
      uriBuilder.setParameter("ApiKey", clientAPIKey);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/x-www-form-urlencoded");
      httpGet.addHeader("Authorization", "bearer " + getToken().getAccess_token());

      omLogger.log("AFEX retrieveClientAccountDetails starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX retrieveClientAccountDetails complete");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Retrieve AFEX client account details failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);

        return (RetrieveClientAccountDetailsResponse) jsonParser.parseString(response, RetrieveClientAccountDetailsResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof IOException ) {
        omLogger.log("AFEX retrieveClientAccountDetails timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateBeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/beneficiaryCreate");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
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
      if ( !request.getVendorId().equals("") ) nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      omLogger.log("AFEX createBeneficiary starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX createBeneficiary completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        Object[] respArr = jsonParser.parseStringForArray(response, CreateBeneficiaryResponse.class);
        if ( respArr.length != 0 ) {
          return (CreateBeneficiaryResponse) respArr[0];
        }
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX createBeneficiary timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public UpdateBeneficiaryResponse updateBeneficiary(UpdateBeneficiaryRequest request) {

    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/beneficiaryUpdate");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
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

      omLogger.log("AFEX updateBeneficiary starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX updateBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Update AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        Object[] respArr = jsonParser.parseStringForArray(response, UpdateBeneficiaryResponse.class);
        if ( respArr.length != 0 ) {
          for ( Object resp : respArr) {
            UpdateBeneficiaryResponse updateBeneficiaryResponse = (UpdateBeneficiaryResponse) resp;
            if ( updateBeneficiaryResponse.getName().equals("Beneficiary has been updated") ) {
              return updateBeneficiaryResponse;
            }
          }
        }
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX updateBeneficiary timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public String disableBeneficiary(DisableBeneficiaryRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/beneficiaryDisable");
      uriBuilder.setParameter("VendorId", request.getVendorId());

      HttpPost httpPost = new HttpPost(uriBuilder.build());

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      omLogger.log("AFEX disableBeneficiary starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX disableBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Disable AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof  IOException ) {
        omLogger.log("AFEX disableBeneficiary timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public FindBeneficiaryResponse findBeneficiary(FindBeneficiaryRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/beneficiary/find");
      uriBuilder.setParameter("VendorId", request.getVendorId());

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX findBeneficiary starting");
      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);
      omLogger.log("AFEX findBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Get AFEX payee information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (FindBeneficiaryResponse) jsonParser.parseString(response, FindBeneficiaryResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof IOException ) {
        omLogger.log("AFEX findBeneficiary timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public FindBankByNationalIDResponse findBankByNationalID(FindBankByNationalIDRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/nationalid/find");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("CountryCode", request.getCountryCode()));
      nvps.add(new BasicNameValuePair("NationalID", request.getNationalID()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      omLogger.log("AFEX findBankByNationalID starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX findBankByNationalID completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Find bank by national ID failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        Object[] respArr = jsonParser.parseStringForArray(response, FindBankByNationalIDResponse.class);

        if ( respArr.length != 0 ) {
          return (FindBankByNationalIDResponse) respArr[0];
        }
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX findBankByNationalID timeout");
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

      omLogger.log("AFEX getValueDate starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX getValueDate completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Get AFEX value date information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof IOException ) {
        omLogger.log("AFEX getValueDate timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public GetRateResponse getRate(GetRateRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/rates");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair());
      if ( !request.getValueType().equals("") ) uriBuilder.setParameter("ValueType", request.getValueType());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX getRate starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX getRate completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Get AFEX rate failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (GetRateResponse) jsonParser.parseString(response, GetRateResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof  IOException ) {
        omLogger.log("AFEX getRate timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public Quote getQuote(GetQuoteRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/quote");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair())
        .setParameter("ValueDate", request.getValueDate())
        .setParameter("Amount", request.getAmount());
      if ( !request.getOptionDate().equals("") ) uriBuilder.setParameter("OptionDate", request.getOptionDate());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX getQuote starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX getQuote complete");

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      DAO afexLogger =(DAO) getX().get("afexLoggingDAO");
      Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false);
      AFEXLogging afexLogging = new AFEXLogging.Builder(getX())
        .setUser(request.getAmount() + "   " + request.getClientAPIKey())
        .setOther("Fx quote request")
        .setRequest(jsonOutputter.stringify(request))
        .setResponse(response)
        .build();
      afexLogger.put(afexLogging);
      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Get AFEX quote failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }
        return (Quote) jsonParser.parseString(response, Quote.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof  IOException ) {
        omLogger.log("AFEX getQuote timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateTradeResponse createTrade(CreateTradeRequest request) {
    try {
      valueDate = getValueDate(request.getTradeCcy() + request.getSettlementCcy(), "SPOT");
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/trades/create");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      BasicNameValuePair accountNumber = new BasicNameValuePair("AccountNumber", request.getAccountNumber());
      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      nvps.add(new BasicNameValuePair("QuoteID", request.getQuoteID()));
      nvps.add(new BasicNameValuePair("SettlementCcy", request.getSettlementCcy()));
      nvps.add(new BasicNameValuePair("TradeCcy", request.getTradeCcy()));
      nvps.add(new BasicNameValuePair("ValueDate", valueDate));
      nvps.add(accountNumber);
      nvps.add(new BasicNameValuePair("IsAmountSettlement", request.getIsAmountSettlement()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      omLogger.log("AFEX createTrade starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX createTrade completed");
      String response = new BasicResponseHandler().handleResponse(httpResponse);

      DAO afexLogger =(DAO) getX().get("afexLoggingDAO");
      Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false);
      AFEXLogging afexLogging = new AFEXLogging.Builder(getX())
        .setUser(request.getAmount() + "   " + request.getClientAPIKey())
        .setOther("First trade request")
        .setRequest(EntityUtils.toString(httpPost.getEntity()))
        .setResponse(response)
        .build();
      afexLogger.put(afexLogging);
      CloseableHttpResponse httpResponse2 = null;

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Create AFEX trade with account number failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");
          logger.error(errorMsg);

          // try again without account number
          nvps.remove(accountNumber);
          nvps.add(new BasicNameValuePair("Note", request.getNote()));
          httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
          omLogger.log("AFEX createTrade starting");

          httpResponse2 = httpClient.execute(httpPost);

          omLogger.log("AFEX createTrade completed");
          response = new BasicResponseHandler().handleResponse(httpResponse2);

          AFEXLogging afexLogging2 = new AFEXLogging.Builder(getX())
            .setUser(request.getAmount() + "   " + request.getClientAPIKey())
            .setOther("2nd trade request")
            .setRequest(EntityUtils.toString(httpPost.getEntity()))
            .setResponse(response)
            .build();
          afexLogger.put(afexLogging2);

          if ( httpResponse2.getStatusLine().getStatusCode() / 100 != 2 ) {
            String errorMsg2 = "Create AFEX trade failed: " + httpResponse2.getStatusLine().getStatusCode() + " - "
              + httpResponse2.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse2.getEntity(), "UTF-8");
            logger.error(errorMsg);

            throw new RuntimeException(errorMsg);
          }

        }

        return (CreateTradeResponse) jsonParser.parseString(response, CreateTradeResponse.class);
      } finally {
        httpResponse.close();
        if ( httpResponse2 != null ) {
          httpResponse2.close();
        }
      }

    } catch (IOException e) {
      omLogger.log("AFEX createTrade timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public CheckTradeStatusResponse checkTradeStatus(CheckTradeStatusRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/trades");
      uriBuilder.setParameter("Id", request.getId());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX checkTradeStatus starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX checkTradeStatus completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Check AFEX trade status failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (CheckTradeStatusResponse) jsonParser.parseString(response, CheckTradeStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof  IOException ) {
        omLogger.log("AFEX checkTradeStatus timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreatePaymentResponse createPayment(CreatePaymentRequest request) {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/payments/create");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("PaymentDate", request.getPaymentDate()));
      nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      omLogger.log("AFEX createPayment starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      omLogger.log("AFEX createPayment completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Create AFEX payment failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (CreatePaymentResponse) jsonParser.parseString(response, CreatePaymentResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX createPayment timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public CheckPaymentStatusResponse checkPaymentStatus(CheckPaymentStatusRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/payments");
      uriBuilder.setParameter("Id", request.getId());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX checkPaymentStatus starting");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      omLogger.log("AFEX checkPaymentStatus completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = "Check AFEX payment status failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase() + " " + EntityUtils.toString(httpResponse.getEntity(), "UTF-8");

          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (CheckPaymentStatusResponse) jsonParser.parseString(response, CheckPaymentStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
      if ( e instanceof IOException ) {
        omLogger.log("AFEX checkPaymentStatus timeout");
      }
      logger.error(e);
    }

    return null;
  }

  @Override
  public byte[] getTradeConfirmation(GetConfirmationPDFRequest confirmationPDFRequest) {

    OkHttpClient client = new OkHttpClient();
    Response response = null;

    Request request = new Request.Builder()
      .header("Content-Type", "application/json")
      .header("API-Key", confirmationPDFRequest.getClientAPIKey())
      .url(AFEXAPI + "api/confirmations?TradeNumber=" + confirmationPDFRequest.getTradeNumber())
      .build();

    try {
      response = client.newCall(request).execute();
      byte[] bytes = response.body().bytes();
      return bytes;

    } catch ( Throwable t ) {
      if ( t instanceof IOException ) {
        omLogger.log("AFEX checkPaymentStatus timeout");
      }
      logger.error(t);

    } finally {
      if ( response != null ) {
        response.close();
      }
    }

    return null;
  }
}
