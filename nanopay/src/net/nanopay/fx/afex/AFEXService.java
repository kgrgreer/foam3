package net.nanopay.fx.afex;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Eq;
import foam.mlang.predicate.Has;
import net.nanopay.tx.UnsupportedDateException;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.NoConnectionReuseStrategy;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.NetworkPropertyPredicate;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.om.OMLogger;
import foam.util.SafetyUtil;
import foam.util.StringUtil;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import java.net.http.HttpRequest;
public class AFEXService extends ContextAwareSupport implements AFEX {

  AFEXCredentials credentials;
  private CloseableHttpClient httpClient;
  private HttpClient javaHttpClient;
  private JSONParser jsonParser;
  private Logger logger;
  private String valueDate;
  private OMLogger omLogger;

  public AFEXService(X x) {
    setX(x);
    logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
    omLogger = (OMLogger) x.get("OMLogger");

    jsonParser = new JSONParser();
    jsonParser.setX(x);
  }

  protected AFEXCredentials getCredentials(String spid) {
    DAO credentialDAO = (DAO) getX().get("afexCredentialDAO");
    ArraySink arraySink = new ArraySink();
    credentialDAO.where(MLang.EQ(AFEXCredentials.SPID, spid)).select(arraySink);
    if ( arraySink.getArray().size() > 0 ) {
      credentials = (AFEXCredentials) (arraySink.getArray()).get(0);
    }
    if ( ! isCredientialsValid() ) {
      credentials = new AFEXCredentials();
      logger.error(this.getClass().getSimpleName(), "invalid credentials");
      ((DAO) getX().get("alarmDAO")).put(new Alarm.Builder(getX()).setName("AFEX getCredentials").setSeverity(foam.log.LogLevel.ERROR).setReason(AlarmReason.CREDENTIALS).build());
    }
    return credentials;
  }

  protected boolean isCredientialsValid() {
    return credentials != null &&
      ! SafetyUtil.isEmpty(credentials.getApiKey()) &&
      ! SafetyUtil.isEmpty(credentials.getApiPassword()) &&
      ! SafetyUtil.isEmpty(credentials.getPartnerApi()) &&
      ! SafetyUtil.isEmpty(credentials.getAFEXApi());
  }

  protected CloseableHttpClient getHttpClient() {
    if ( httpClient == null ) {
      RequestConfig requestConfig = RequestConfig.custom().setConnectionRequestTimeout(5000).build();
      httpClient = HttpClientBuilder.create().setDefaultRequestConfig(requestConfig)
        .setConnectionReuseStrategy(new NoConnectionReuseStrategy()).build(); // Untill we figure out how to handle stale connections
    }
    return httpClient;
  }

  protected HttpClient getJavaHttpClient() {
    if ( javaHttpClient == null ) {
      javaHttpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(100))
        .build();
    }
    return javaHttpClient;
  }

  @Override
  public Token getToken(String spid) {
    try {

      credentials = getCredentials(spid);

      Map<String, String> map = new HashMap<>();
      map.put("Grant_Type", "password");
      map.put("Username", credentials.getApiKey());
      map.put("Password", credentials.getApiPassword());

      HttpRequest request = HttpRequest.newBuilder()
        .uri(new URI(credentials.getPartnerApi() + "token"))
        .POST(ofFormData(map))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .build();

      logMessage(credentials.getApiKey(), "getToken", request.bodyPublisher().toString(), false);
      omLogger.log("AFEX getToken starting");

      HttpResponse<String> response = getJavaHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

      omLogger.log("AFEX getToken complete");

        if ( response.statusCode() / 100 != 2 ) {
          String errorMsg = response.statusCode() + " " + response.body();
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        logMessage(credentials.getApiKey(), "getToken", response.body(), true);
        return (Token) jsonParser.parseString(response.body(), Token.class);

    } catch (IOException | URISyntaxException | InterruptedException e) {
      omLogger.log("AFEX getToken timeout");
      ((DAO) getX().get("alarmDAO")).put(new Alarm.Builder(getX()).setName("AFEX getToken").setReason(AlarmReason.TIMEOUT).build());
      logger.error(e);
    }

    return null;
  }

  public static HttpRequest.BodyPublisher ofFormData(Map<String, String> data) {
    var builder = new StringBuilder();
    for (Map.Entry<String, String> entry : data.entrySet()) {
      if (builder.length() > 0) {
        builder.append("&");
      }
      builder.append(URLEncoder.encode(entry.getKey().toString(), StandardCharsets.UTF_8));
      builder.append("=");
      builder.append(URLEncoder.encode(entry.getValue().toString(), StandardCharsets.UTF_8));
    }
    return HttpRequest.BodyPublishers.ofString(builder.toString());
  }

  public OnboardAFEXClientResponse onboardAFEXClient(OnboardAFEXClientRequest request, String spid, AccountEntityType entityType) {
    String requestLabel = "onboard " + entityType.getLabel();
    try {
      credentials = getCredentials(spid);
      String requestJson ="";
      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        requestJson = StringUtil.normalize(jsonOutputter.stringify(request));
      }

      HttpRequest httpRequest = HttpRequest.newBuilder()
        .uri(new URI(credentials.getPartnerApi() + "api/v1/AccountCreate"))
        .POST(HttpRequest.BodyPublishers.ofString(requestJson.toString()))
        .header("Content-Type", "application/json")
        .header("Authorization", "bearer " + getToken(spid).getAccess_token())
        .header("API-Key", credentials.getApiKey())
        .build();
      logMessage(credentials.getApiKey(), requestLabel, requestJson, false);

      omLogger.log("AFEX " + requestLabel + " starting");

      HttpResponse<String> response = getJavaHttpClient().send(httpRequest, HttpResponse.BodyHandlers.ofString());

      omLogger.log("AFEX " + requestLabel + " complete");
      if ( response.statusCode() / 100 == 5 ) {
        logger.debug("AFEX " + requestLabel + " failed with 500, retrying.");
        response = getJavaHttpClient().send(httpRequest, HttpResponse.BodyHandlers.ofString());
      } else if ( response.statusCode() == 400 && response.body().contains("An unsecured or incorrectly secured fault was received from the other party") ) {
        response = getJavaHttpClient().send(httpRequest, HttpResponse.BodyHandlers.ofString());
      }

      if ( response.statusCode() / 100 != 2 ) {
        String errorMsg = response.statusCode() + " " + response.body();
        // create alarm here
        DAO alarmDAO = (DAO) getX().get("alarmDAO");
        Alarm alarm = (Alarm) alarmDAO.find(MLang.EQ(Alarm.NAME, "AFEXOnboarding"));
        if ( alarm == null ) {
          alarm = new Alarm.Builder(getX())
            .setName("AFEXOnboarding")
            .setIsActive(true)
            .setNote("Failed to onboard an AFEX business")
            .build();
        } else if ( ! alarm.getIsActive() ) {
          alarm = (Alarm) alarm.fclone();
          alarm.setIsActive(true);
        }
        alarmDAO.put(alarm);
        logger.error(errorMsg);
        throw new RuntimeException(errorMsg);
      } else {
        //clear alarm if exists
        DAO alarmDAO = (DAO) getX().get("alarmDAO");
        Alarm alarm = (Alarm) alarmDAO.find(MLang.EQ(Alarm.NAME, "AFEXOnboarding"));
        if ( alarm != null && alarm.getIsActive() ) {
          alarm = (Alarm) alarm.fclone();
          alarm.setIsActive(false);
          alarmDAO.put(alarm);
        }
      }

      logMessage(credentials.getApiKey(), requestLabel, response.body(), true);
      return (OnboardAFEXClientResponse) jsonParser.parseString(response.body(), OnboardAFEXClientResponse.class);

    } catch (IOException | InterruptedException | URISyntaxException e) {
      omLogger.log("AFEX " + requestLabel + " timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public GetClientAccountStatusResponse getClientAccountStatus(String clientAPIKey, String spid) {
    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getPartnerApi() + "api/v1/clientstatus");
      uriBuilder.setParameter("ApiKey", clientAPIKey);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", credentials.getApiKey());
      httpGet.addHeader("Content-Type", "application/x-www-form-urlencoded");
      httpGet.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      logMessage(credentials.getApiKey(), "getClientAccountStatus", httpGet.toString(), false);

      omLogger.log("AFEX getClientAccountStatus starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX getClientAccountStatus complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("getClientAccountStatus", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "getClientAccountStatus", response, true);

        return (GetClientAccountStatusResponse) jsonParser.parseString(response, GetClientAccountStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e ) {
      omLogger.log("AFEX getClientAccountStatus timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public RetrieveClientAccountDetailsResponse retrieveClientAccountDetails(String clientAPIKey, String spid) {

    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getPartnerApi() + "api/v1/AccountFind");
      uriBuilder.setParameter("ApiKey", clientAPIKey);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", credentials.getApiKey());
      httpGet.addHeader("Content-Type", "application/json");
      httpGet.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      logMessage(credentials.getApiKey(), "retrieveClientAccountDetails", httpGet.toString(), false);

      omLogger.log("AFEX retrieveClientAccountDetails starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX retrieveClientAccountDetails complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("retrieveClientAccountDetails", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "retrieveClientAccountDetails", response, true);
        return (RetrieveClientAccountDetailsResponse) jsonParser.parseString(response, RetrieveClientAccountDetailsResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e ) {
      omLogger.log("AFEX retrieveClientAccountDetails timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateBeneficiaryResponse createBeneficiary(CreateBeneficiaryRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi() + "api/beneficiaryCreate");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("BankAccountNumber", request.getBankAccountNumber()));
      nvps.add(new BasicNameValuePair("BankCountryCode", request.getBankCountryCode()));
      nvps.add(new BasicNameValuePair("BankName", StringUtil.normalize(request.getBankName())));
      nvps.add(new BasicNameValuePair("BankRoutingCode", request.getBankRoutingCode()));
      nvps.add(new BasicNameValuePair( "BankSWIFTBIC", request.getBankSWIFTBIC()));
      nvps.add(new BasicNameValuePair("BeneficiaryAddressLine1", StringUtil.normalize(request.getBeneficiaryAddressLine1())));
      nvps.add(new BasicNameValuePair("BeneficiaryCity", StringUtil.normalize(request.getBeneficiaryCity())));
      nvps.add(new BasicNameValuePair("BeneficiaryCountryCode", request.getBeneficiaryCountryCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryName", StringUtil.normalize(request.getBeneficiaryName())));
      nvps.add(new BasicNameValuePair("BeneficiaryPostalCode", request.getBeneficiaryPostalCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryRegion", request.getBeneficiaryRegion()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("HighLowValue", request.getHighLowValue()));
      nvps.add(new BasicNameValuePair("remittanceLine2", request.getRemittanceLine2()));
      nvps.add(new BasicNameValuePair("remittanceLine3", request.getRemittanceLine3()));
      if ( !request.getVendorId().equals("") ) nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      logMessage(request.getClientAPIKey(), "createBeneficiary", parseHttpPost(httpPost), false);

      omLogger.log("AFEX createBeneficiary starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX createBeneficiary completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("createBeneficiary", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(request.getClientAPIKey(), "createBeneficiary", response, true);
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
  public UpdateBeneficiaryResponse updateBeneficiary(UpdateBeneficiaryRequest request, String spid) {

    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi()  + "api/beneficiaryUpdate");

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("BankAccountNumber", request.getBankAccountNumber()));
      nvps.add(new BasicNameValuePair("BankCountryCode", request.getBankCountryCode()));
      nvps.add(new BasicNameValuePair("BankName", StringUtil.normalize(request.getBankName())));
      nvps.add(new BasicNameValuePair("BankRoutingCode", request.getBankRoutingCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryAddressLine1", StringUtil.normalize(request.getBeneficiaryAddressLine1())));
      nvps.add(new BasicNameValuePair("BeneficiaryCity", StringUtil.normalize(request.getBeneficiaryCity())));
      nvps.add(new BasicNameValuePair("BeneficiaryCountryCode", request.getBeneficiaryCountryCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryName", StringUtil.normalize(request.getBeneficiaryName())));
      nvps.add(new BasicNameValuePair("BeneficiaryPostalCode", request.getBeneficiaryPostalCode()));
      nvps.add(new BasicNameValuePair("BeneficiaryRegion", request.getBeneficiaryRegion()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("VendorId",  request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      logMessage(request.getClientAPIKey(), "updateBeneficiary", parseHttpPost(httpPost), false);

      omLogger.log("AFEX updateBeneficiary starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX updateBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("createBeneficiary", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(request.getClientAPIKey(), "updateBeneficiary", response, true);
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
  public String disableBeneficiary(DisableBeneficiaryRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/beneficiaryDisable");
      uriBuilder.setParameter("VendorId", request.getVendorId());

      HttpPost httpPost = new HttpPost(uriBuilder.build());

      httpPost.addHeader("API-Key", request.getClientAPIKey());
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      logMessage(request.getClientAPIKey(), "disableBeneficiary", parseHttpPost(httpPost), false);

      omLogger.log("AFEX disableBeneficiary starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX disableBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("createBeneficiary", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(request.getClientAPIKey(), "disableBeneficiary", response, true);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e ) {
      omLogger.log("AFEX disableBeneficiary timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public FindBeneficiaryResponse findBeneficiary(FindBeneficiaryRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/beneficiary/find");
      uriBuilder.setParameter("VendorId", request.getVendorId());

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", request.getClientAPIKey());
      httpGet.addHeader("Content-Type", "application/json");

      logMessage( request.getClientAPIKey(), "findBeneficiary", httpGet.toString(), false);

      omLogger.log("AFEX findBeneficiary starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("AFEX findBeneficiary completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("findBeneficiary", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(request.getClientAPIKey(), "findBeneficiary", response, true);
        return (FindBeneficiaryResponse) jsonParser.parseString(response, FindBeneficiaryResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e  ) {
      omLogger.log("AFEX findBeneficiary timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }
    return null;
  }

  @Override
  public FindBankByNationalIDResponse findBankByNationalID(FindBankByNationalIDRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi()  + "api/nationalid/find");

      String apiKey = SafetyUtil.isEmpty(request.getClientAPIKey()) ? credentials.getApiKey() : request.getClientAPIKey();
      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("CountryCode", request.getCountryCode()));
      nvps.add(new BasicNameValuePair("NationalID", request.getNationalID()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      logMessage(apiKey, "findBankByNationalID", parseHttpPost(httpPost), false);

      omLogger.log("AFEX findBankByNationalID starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX findBankByNationalID completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("findBankByNationalID", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "findBankByNationalID", response, true);
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
  public String getValueDate(String currencyPair, String valueType,  String businessApiKey, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getQuoteAndTradeApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = businessApiKey;
      }
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/valuedates");
      uriBuilder.setParameter("CurrencyPair", currencyPair)
                .setParameter("ValueType", valueType);

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(apiKey,"getValueDate", httpGet.toString(), false);

      omLogger.log("AFEX getValueDate starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX getValueDate completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("getValueDate", httpResponse);
          logger.error(errorMsg);
          if ( errorMsg.contains("currency is not allowed for Cash date") || errorMsg.contains("currency is not allowed for Tom date") ) {
            throw new UnsupportedDateException(errorMsg);
          }
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey,"getValueDate", response, true);
        return response.substring(1, response.length() - 1);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e ) {
      omLogger.log("AFEX getValueDate timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public GetRateResponse getRate(GetRateRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getQuoteAndTradeApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = request.getClientAPIKey();
      }
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/rates");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair());
      if ( !request.getValueType().equals("") ) uriBuilder.setParameter("ValueType", request.getValueType());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(apiKey, "getRate", httpGet.toString(), false);

      omLogger.log("AFEX getRate starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX getRate completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("getRate", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "getRate", response, true);
        return (GetRateResponse) jsonParser.parseString(response, GetRateResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX getRate timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public GetRateResponse getSpotRate(GetRateRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/rates");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair());
      uriBuilder.setParameter("ValueType", "SPOT");
      if ( !request.getValueType().equals("") ) uriBuilder.setParameter("ValueType", request.getValueType());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", credentials.getSpotRateApiKey());
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(credentials.getSpotRateApiKey(), "getSpotRate", httpGet.toString(), false);
      omLogger.log("AFEX getSpotRate starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("AFEX getSpotRate completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("getSpotRate", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }
        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getSpotRateApiKey(), "getSpotRate", response, true);
        return (GetRateResponse) jsonParser.parseString(response, GetRateResponse.class);
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX getSpotRate timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }
    return null;
  }

  @Override
  public Quote getQuote(GetQuoteRequest request, String spid) {
    logger.debug("Entered getquote", request);
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getQuoteAndTradeApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = request.getClientAPIKey();
      }
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/quote");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair())
        .setParameter("ValueDate", request.getValueDate())
        .setParameter("Amount", request.getAmount());
      if ( !request.getOptionDate().equals("") ) uriBuilder.setParameter("OptionDate", request.getOptionDate());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      omLogger.log("AFEX getQuote starting");

      logger.debug("before execute");

      logMessage(apiKey, "getQuote", httpGet.toString(), false);
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX getQuote complete");
      logger.debug("after execute", httpResponse);

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          if ( httpResponse.getStatusLine().getStatusCode() / 100 == 5 ) {
            logger.debug("AFEX getQuote failed with 500, retrying.");
            httpResponse = getHttpClient().execute(httpGet);
          }
          if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
            String errorMsg = parseHttpResponse("getQuote", httpResponse);
            logger.error(errorMsg);
            if ( errorMsg.contains("currency is not allowed for Cash date") || errorMsg.contains("currency is not allowed for Tom date") ) {
              throw new UnsupportedDateException(errorMsg);
            }
            throw new RuntimeException(errorMsg);
          }
        }
        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "getQuote", response, true);
        return (Quote) jsonParser.parseString(response, Quote.class);
      } finally {
        httpResponse.close();
      }
    } catch (IOException e ) {
      omLogger.log("AFEX getQuote timeout");
      logger.error("AFEX GetQoute failed",e);
    } catch (URISyntaxException e) {
      logger.error("AFEX GetQoute failed",e);
    }

    return null;
  }

  @Override
  public CreateTradeResponse createTrade(CreateTradeRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getQuoteAndTradeApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = request.getClientAPIKey();
      }
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi()  + "api/trades/create");

      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      BasicNameValuePair accountNumber = new BasicNameValuePair("AccountNumber", request.getAccountNumber());
      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      nvps.add(new BasicNameValuePair("QuoteID", request.getQuoteID()));
      nvps.add(new BasicNameValuePair("SettlementCcy", request.getSettlementCcy()));
      nvps.add(new BasicNameValuePair("TradeCcy", request.getTradeCcy()));
      nvps.add(new BasicNameValuePair("ValueDate", request.getValueDate()));
      nvps.add(accountNumber);
      nvps.add(new BasicNameValuePair("IsAmountSettlement", request.getIsAmountSettlement()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      logMessage(apiKey, "createTrade1", parseHttpPost(httpPost), false);

      omLogger.log("AFEX createTrade starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX createTrade completed");

      CloseableHttpResponse httpResponse2 = null;

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("createTrade1", httpResponse);
          logger.error(errorMsg);

          // try again without account number
          //if ( errorMsg.toLowerCase().contains("account number") ) { //TODO Review this after security audit
            nvps.remove(accountNumber);
            nvps.add(new BasicNameValuePair("Note", request.getNote()));
            httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

            logMessage(apiKey, "createTrade2", parseHttpPost(httpPost), false);
            omLogger.log("AFEX createTrade starting");

            httpResponse2 = getHttpClient().execute(httpPost);

            omLogger.log("AFEX createTrade completed");

            if (httpResponse2.getStatusLine().getStatusCode() / 100 != 2) {
              String errorMsg2 = parseHttpResponse("createTrade2", httpResponse2);
              logger.error(errorMsg2);
              if ( errorMsg2.contains("currency is not allowed for Cash date") || errorMsg2.contains("currency is not allowed for Tom date") ) {
                throw new UnsupportedDateException(errorMsg2);
              }
              throw new RuntimeException(errorMsg2);
            }
            httpResponse = httpResponse2;
          // } else {
          //   throw new RuntimeException(errorMsg);
          // }
        }
        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "createTrade2", response, true);
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
  public CheckTradeStatusResponse checkTradeStatus(CheckTradeStatusRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getQuoteAndTradeApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = request.getClientAPIKey();
      }
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/trades");
      uriBuilder.setParameter("Id", request.getId());

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(apiKey, "checkTradeStatus", httpGet.toString(), false);

      omLogger.log("AFEX checkTradeStatus starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX checkTradeStatus completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("checkTradeStatus", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "checkTradeStatus", response, true);
        return (CheckTradeStatusResponse) jsonParser.parseString(response, CheckTradeStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX checkTradeStatus timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreatePaymentResponse createPayment(CreatePaymentRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi()  + "api/payments/create");

      // Use request api key if set ( corporate key must be used to schedule a payment )
      // Otherwise use instant payment api key to create instant payment
      String apiKey = request.getClientAPIKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = credentials.getInstantPaymentApiKey();
      }
      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Amount", request.getAmount()));
      nvps.add(new BasicNameValuePair("Currency", request.getCurrency()));
      nvps.add(new BasicNameValuePair("PaymentDate", request.getPaymentDate()));
      nvps.add(new BasicNameValuePair("VendorId", request.getVendorId()));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      logMessage(apiKey, "createPayment", parseHttpPost(httpPost), false);

      omLogger.log("AFEX createPayment starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX createPayment completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("createPayment", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "createPayment", response, true);
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
  public CheckPaymentStatusResponse checkPaymentStatus(CheckPaymentStatusRequest request, String spid) {
    credentials = getCredentials(spid);
    // Use request api key if set ( corporate key must be used to check a normal payment )
    // Otherwise use instant payment api key to check instant payment
    String apiKey = request.getClientAPIKey();
    if ( SafetyUtil.isEmpty(apiKey) ) {
      apiKey = credentials.getInstantPaymentApiKey();
    }
    try {
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/payments");
      uriBuilder.setParameter("Id", request.getId());
      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(apiKey,"checkPaymentStatus", httpGet.toString(), false);

      omLogger.log("AFEX checkPaymentStatus starting");

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);

      omLogger.log("AFEX checkPaymentStatus completed");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("checkPaymentStatus", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey,"checkPaymentStatus", response, true);
        return (CheckPaymentStatusResponse) jsonParser.parseString(response, CheckPaymentStatusResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e ) {
      omLogger.log("AFEX checkPaymentStatus timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public byte[] getTradeConfirmation(GetConfirmationPDFRequest confirmationPDFRequest, String spid) {

    OkHttpClient client = new OkHttpClient.Builder()
      .connectTimeout(15, TimeUnit.SECONDS)
      .writeTimeout(15, TimeUnit.SECONDS)
      .readTimeout(30, TimeUnit.SECONDS)
    .build();
    Response response = null;
    credentials = getCredentials(spid);
    String apiKey = credentials.getQuoteAndTradeApiKey();
    if ( SafetyUtil.isEmpty(apiKey) ) {
      apiKey = confirmationPDFRequest.getClientAPIKey();
    }
    Request request = new Request.Builder()
      .header("Content-Type", "application/json")
      .header("API-Key", apiKey)
      .url(credentials.getAFEXApi()  + "api/confirmations?TradeNumber=" + confirmationPDFRequest.getTradeNumber())
      .build();

    logMessage(apiKey, "getTradeConfirmation", request.toString(), false);

    try {
      response = client.newCall(request).execute();
      byte[] bytes = response.body().bytes();

      logMessage(apiKey, "getTradeConfirmation", "Response recieved", true);
      return bytes;

    } catch (IOException e) {
      omLogger.log("AFEX checkPaymentStatus timeout");
      logger.error(e);
    }
    catch ( Throwable t ) {
      logger.error(t);

    } finally {
      if ( response != null ) {
        response.close();
      }
    }

    return null;
  }

  @Override
  public String directDebitEnrollment(DirectDebitEnrollmentRequest directDebitRequest, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getPartnerApi() + "api/v1/DirectDebitEnroll");

      httpPost.addHeader("API-Key", credentials.getApiKey());
      httpPost.addHeader("Content-Type", "application/json");
      httpPost.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      StringEntity params = null;

      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(directDebitRequest));
        params =new StringEntity(requestJson);
      } catch(Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);

      logMessage(credentials.getApiKey(), "directDebitEnrollment", parseHttpPost(httpPost), false);

      omLogger.log("AFEX directDebitEnrollment starting");

      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX directDebitEnrollment complete");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("directDebitEnrollment", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "directDebitEnrollment", response, true);
        return response;
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX directDebitEnrollment timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public String directDebitUnenrollment(DirectDebitUnenrollmentRequest directDebitUnenrollmentRequest, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getPartnerApi() + "api/v1/DirectDebitUnenroll");

      httpPost.addHeader("API-Key", credentials.getApiKey());
      httpPost.addHeader("Content-Type", "application/json");
      httpPost.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      StringEntity params = null;

      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(directDebitUnenrollmentRequest));
        params = new StringEntity(requestJson);
      } catch (Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);

      logMessage(credentials.getApiKey(), "directDebitUnenrollmentRequest", parseHttpPost(httpPost), false);

      omLogger.log("AFEX directDebitUnenrollmentRequest starting");

      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX directDebitUnenrollmentRequest complete");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("directDebitUnenrollmentRequest", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "directDebitUnenrollmentRequest", response, true);
        return response;
      } finally {
        httpResponse.close();
      }

    } catch (IOException e) {
      omLogger.log("AFEX directDebitUnenrollmentRequest timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public String addCompanyOfficer(AddCompanyOfficerRequest addCompanyOfficerRequest, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getPartnerApi() + "api/v2/AddCompanyOfficer");

      httpPost.addHeader("API-Key", credentials.getApiKey());
      httpPost.addHeader("Content-Type", "application/json");
      httpPost.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      StringEntity params = null;

      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(addCompanyOfficerRequest));
        params =new StringEntity(requestJson);
      } catch(Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);

      logMessage(credentials.getApiKey(), "AddCompanyOfficer", parseHttpPost(httpPost), false);

      omLogger.log("AFEX AddCompanyOfficer starting");

      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX AddCompanyOfficer complete");


      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("AddCompanyOfficer", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "AddCompanyOfficer", response, true);
        return response;
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX AddCompanyOfficer timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateFundingBalanceResponse createFundingBalance(CreateFundingBalanceRequest createFundingBalanceRequest, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getFundingBalanceApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = createFundingBalanceRequest.getClientAPIKey();
      }
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi() + "api/fundingbalance/create");
      httpPost.addHeader("API-Key", apiKey);
      httpPost.addHeader("Content-Type", "application/json");

      StringEntity params = null;
      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(createFundingBalanceRequest));
        params =new StringEntity(requestJson);
      } catch(Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);
      logMessage(apiKey, "CreateFundingBalance", parseHttpPost(httpPost), false);
      omLogger.log("AFEX CreateFundingBalance starting");
      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX CreateFundingBalance complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("CreateFundingBalance", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "CreateFundingBalance", response, true);
        return (CreateFundingBalanceResponse) jsonParser.parseString(response, CreateFundingBalanceResponse.class);
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX CreateFundingBalance timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public FundingBalance getFundingBalance(String clientAPIKey, String currency, String spid) {
    try {
      credentials = getCredentials(spid);
      String apiKey = credentials.getFundingBalanceApiKey();
      if ( SafetyUtil.isEmpty(apiKey) ) {
        apiKey = clientAPIKey;
      }
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/fundingbalance?Currency");
      uriBuilder.setParameter("Currency", currency);

      HttpGet httpGet = new HttpGet(uriBuilder.build());
      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      logMessage(apiKey, "GetFundingBalance", httpGet.toString(), false);
      omLogger.log("AFEX GetFundingBalance starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("AFEX GetFundingBalance completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("GetFundingBalance", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(apiKey, "GetFundingBalance", response, true);
        Object[] fundingBalances = jsonParser.parseStringForArray(response, FundingBalance.class);
        if ( fundingBalances != null && fundingBalances.length > 0 ) return (FundingBalance)fundingBalances[0];
      } finally {
        httpResponse.close();
      }
    } catch (IOException e ) {
      omLogger.log("AFEX GetFundingBalance timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public CreateInstantBeneficiaryResponse createInstantBeneficiary(CreateInstantBeneficiaryRequest createInstantBeneficiaryRequest, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi() + "api/instantbeneficiarycreate");
      httpPost.addHeader("API-Key", credentials.getInstantPaymentApiKey());
      httpPost.addHeader("Content-Type", "application/json");

      StringEntity params = null;
      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(createInstantBeneficiaryRequest));
        params =new StringEntity(requestJson);
      } catch(Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);
      logMessage(credentials.getInstantPaymentApiKey(), "CreateInstantBeneficiary", parseHttpPost(httpPost), false);
      omLogger.log("AFEX CreateInstantBeneficiary starting");
      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX CreateInstantBeneficiary complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("CreateInstantBeneficiary", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getInstantPaymentApiKey(), "CreateInstantBeneficiary", response, true);
        Object[] instantBeneficiaryResponses = jsonParser.parseStringForArray(response, CreateInstantBeneficiaryResponse.class);
        if ( instantBeneficiaryResponses != null && instantBeneficiaryResponses.length > 0 )
          return (CreateInstantBeneficiaryResponse)instantBeneficiaryResponses[0];
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX CreateInstantBeneficiary timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public ValidateInstantBenefiaryResponse validateInstantBenefiaryRequest(ValidateInstantBenefiaryRequest validateInstantBenefiary, String spid) {
    try {
      credentials = getCredentials(spid);
      HttpPost httpPost = new HttpPost(credentials.getAFEXApi() + "api/instantbeneficiaryvalidate");
      httpPost.addHeader("API-Key", credentials.getInstantPaymentApiKey());
      httpPost.addHeader("Content-Type", "application/json");

      StringEntity params = null;
      try(Outputter jsonOutputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate()).setOutputClassNames(false)) {
        String requestJson = StringUtil.normalize(jsonOutputter.stringify(validateInstantBenefiary));
        params =new StringEntity(requestJson);
      } catch(Exception e) {
        logger.error(e);
      }

      httpPost.setEntity(params);
      logMessage(credentials.getInstantPaymentApiKey(), "ValidateInstantBenefiaryRequest", parseHttpPost(httpPost), false);
      omLogger.log("AFEX ValidateInstantBenefiaryRequest starting");
      logger.debug(params);

      CloseableHttpResponse httpResponse = getHttpClient().execute(httpPost);

      omLogger.log("AFEX ValidateInstantBenefiaryRequest complete");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("ValidateInstantBenefiaryRequest", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getInstantPaymentApiKey(), "ValidateInstantBenefiaryRequest", response, true);
        Object[] instantBenefiaryResponses = jsonParser.parseStringForArray(response, ValidateInstantBenefiaryResponse.class);
        if ( instantBenefiaryResponses != null && instantBenefiaryResponses.length > 0 )
          return (ValidateInstantBenefiaryResponse)instantBenefiaryResponses[0];
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
      omLogger.log("AFEX ValidateInstantBenefiaryRequest timeout");
      logger.error(e);
    }

    return null;
  }

  @Override
  public IsIbanResponse isiban(IsIbanRequest request, String spid) {
    try {
      credentials = getCredentials(spid);
      URIBuilder uriBuilder = new URIBuilder(credentials.getAFEXApi()  + "api/beneficiary/isiban");
      uriBuilder.setParameter("Iban", request.getIban());
      uriBuilder.setParameter("Country", request.getCountry());

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", credentials.getApiKey());
      httpGet.addHeader("Content-Type", "application/json");
      httpGet.addHeader("Authorization", "bearer " + getToken(spid).getAccess_token());

      logMessage(credentials.getApiKey(), "isiban", httpGet.toString(), false);

      omLogger.log("AFEX isiban starting");
      CloseableHttpResponse httpResponse = getHttpClient().execute(httpGet);
      omLogger.log("AFEX isiban completed");

      try {
        if ( httpResponse.getStatusLine().getStatusCode() / 100 != 2 ) {
          String errorMsg = parseHttpResponse("isiban", httpResponse);
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }

        String response = new BasicResponseHandler().handleResponse(httpResponse);
        logMessage(credentials.getApiKey(), "isiban", response, true);
        return (IsIbanResponse) jsonParser.parseString(response, IsIbanResponse.class);
      } finally {
        httpResponse.close();
      }

    } catch (IOException e  ) {
      omLogger.log("AFEX isiban timeout");
      logger.error(e);
    } catch (URISyntaxException e) {
      logger.error(e);
    }
    return null;
  }

  protected void logMessage(String apiKey, String methodName, String msg, boolean isResponse) {
    String msgType = isResponse ? "Response" : "Request";
    StringBuilder sb = new StringBuilder();
    sb.append("{ apiKey: ");
    sb.append(apiKey);
    sb.append(", name: ");
    sb.append(methodName);
    sb.append(", " + msgType +" : ");
    sb.append(msg);
    logger.info(sb.toString());
  }

  protected String parseHttpPost(HttpPost httpPost) {
    try {
      return EntityUtils.toString(httpPost.getEntity());
    } catch (Exception e) {

    }
    return "";
  }

  protected String parseHttpResponse(String methodName, CloseableHttpResponse httpResponse) {
    if ( httpResponse == null  ) return "";
    StringBuilder sb = new StringBuilder();
    sb.append("AFEX ");
    sb.append(methodName);
    sb.append(" failed with: ");
    sb.append(httpResponse.getStatusLine().getStatusCode());
    sb.append(" - ");
    sb.append(httpResponse.getStatusLine().getReasonPhrase());
    try {
      sb.append(EntityUtils.toString(httpResponse.getEntity(), "UTF-8"));
    } catch (Exception e) {

    }
    EntityUtils.consumeQuietly(httpResponse.getEntity());
    return sb.toString();
  }
}
