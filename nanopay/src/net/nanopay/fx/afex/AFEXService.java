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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

public class AFEXService extends ContextAwareSupport implements AFEX {

  private String apiKey;
  private String apiPassword;
  private String partnerApi;
  private String AFEXAPI;
  private CloseableHttpClient httpClient;
  private JSONParser jsonParser;
  private Logger logger;

  public AFEXService(X x) {
    setX(x);
    AFEXCredentials credentials = getCredentials();
    apiKey = credentials.getApiKey();
    apiPassword = credentials.getApiPassword();
    partnerApi = credentials.getPartnerApi();
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
      HttpPost httpPost = new HttpPost(partnerApi + "token");

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
  public Quote getQuote(GetQuoteRequest request) {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/quote");
      uriBuilder.setParameter("CurrencyPair", request.getCurrencyPair())
                .setParameter("ValueDate", request.getValueDate())
                .setParameter("OptionDate", request.getOptionDate());

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
  public Quote getValueDate() {
    try {
      URIBuilder uriBuilder = new URIBuilder(AFEXAPI + "api/valuedates");
      uriBuilder.setParameter("CurrencyPair", "USDCAD")
        .setParameter("ValueType", "CASH");

      HttpGet httpGet = new HttpGet(uriBuilder.build());

      httpGet.addHeader("API-Key", apiKey);
      httpGet.addHeader("Content-Type", "application/json");

      CloseableHttpResponse httpResponse = httpClient.execute(httpGet);

      BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
      StringBuilder sb = new StringBuilder();
      String line;
      while ( (line = rd.readLine()) != null ) {
        sb.append(line);
      }

      System.out.println("value date response: " + sb.toString());

    } catch (IOException | URISyntaxException e) {
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public AddPayeeResponse addPayee(AddPayeeRequest request) {
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

      if ( httpResponse.getStatusLine().getStatusCode() != 200 ) {
        throw new RuntimeException("Add AFEX payee failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);

      Object[] respArr = jsonParser.parseStringForArray(response, AddPayeeResponse.class);

      if ( respArr.length != 0 ) {
        AddPayeeResponse addPayeeResponse = (AddPayeeResponse) respArr[0];
        System.out.println("Add Payee response: ");
        System.out.println(addPayeeResponse.getName());
        System.out.println(addPayeeResponse.getCode());
        System.out.println(addPayeeResponse.getInformationMessage());
        System.out.println(addPayeeResponse.getInformationCode());
        System.out.println(addPayeeResponse.getStatus());

        return addPayeeResponse;
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }

  @Override
  public UpdatePayeeResponse updatePayee(UpdatePayeeRequest request) {
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

      if ( httpResponse.getStatusLine().getStatusCode() != 200 ) {
        throw new RuntimeException("Update AFEX payee failed: " + httpResponse.getStatusLine().getStatusCode() + " - "
          + httpResponse.getStatusLine().getReasonPhrase());
      }

      String response = new BasicResponseHandler().handleResponse(httpResponse);
      Object[] respArr = jsonParser.parseStringForArray(response, UpdatePayeeResponse.class);

      if ( respArr.length != 0 ) {
        for ( Object resp : respArr) {
          UpdatePayeeResponse updatePayeeResponse = (UpdatePayeeResponse) resp;
          if ( updatePayeeResponse.getName().equals("Beneficiary has been updated") ) {
            System.out.println("Update Payee response: ");
            System.out.println(updatePayeeResponse.getName());
            System.out.println(updatePayeeResponse.getCode());
            System.out.println(updatePayeeResponse.getInformationMessage());
            System.out.println(updatePayeeResponse.getInformationCode());
            System.out.println(updatePayeeResponse.getStatus());

            return updatePayeeResponse;
          }
        }
      }
    } catch (IOException e) {
      logger.error(e);
    }

    return null;
  }
}
