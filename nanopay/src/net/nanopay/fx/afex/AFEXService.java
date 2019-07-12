package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
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
    RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(5000).build();
    httpClient = HttpClientBuilder.create().setDefaultRequestConfig(requestConfig).build();
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

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("AFEX get token failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("AFEX get token failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (Token) jsonParser.parseString(response, Token.class);
      } finally {
        httpResponse.close();
      }

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

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Onboard AFEX corporate client failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Onboard AFEX corporate client failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (OnboardCorporateClientResponse) jsonParser.parseString(response, OnboardCorporateClientResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
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

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
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
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Update AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Update AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
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

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Disable AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Disable AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
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

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Get AFEX payee information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Get AFEX payee information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (FindBeneficiaryResponse) jsonParser.parseString(response, FindBeneficiaryResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
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
      nvps.add(new BasicNameValuePair("City", request.getCity()));
      nvps.add(new BasicNameValuePair("CountryCode", request.getCountryCode()));
      nvps.add(new BasicNameValuePair("Institution", request.getInstitution()));
      nvps.add(new BasicNameValuePair("NationalID", request.getNationalID()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Create AFEX beneficiary failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
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

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Get AFEX value date information failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Get AFEX value date information failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException | URISyntaxException e) {
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
      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Get AFEX quote failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Get AFEX quote failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (Quote) jsonParser.parseString(response, Quote.class);
      } finally {
        httpResponse.close();
      }

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

      httpPost.addHeader("API-Key", request.getClientAPIKey());
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

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Create AFEX trade failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Create AFEX trade failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (CreateTradeResponse) jsonParser.parseString(response, CreateTradeResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
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
      nvps.add(new BasicNameValuePair("PaymentDate", valueDate));
      nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));
      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          logger.error("Create AFEX payment failed: " + httpResponse.getStatusLine().getStatusCode() + " - " + httpResponse.getStatusLine().getReasonPhrase());
          throw new RuntimeException("Create AFEX payment failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
            + httpResponse.getStatusLine().getReasonPhrase());
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        return (CreatePaymentResponse) jsonParser.parseString(response, CreatePaymentResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }
}
