package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
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
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public GetQuoteResponse getValueDate() {
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
  public PayeeOperationResult addPayee() {
    try {
      HttpPost httpPost = new HttpPost(AFEXAPI + "api/beneficiaryCreate");

      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("BankAccountNumber", "58926481025163"));
      nvps.add(new BasicNameValuePair("BankAddress1", "Association 926 W College Ave"));
      nvps.add(new BasicNameValuePair("BankAddress3", "Appleton"));
      nvps.add(new BasicNameValuePair("BankCountryCode", "US"));
      nvps.add(new BasicNameValuePair("BankName", "Associated Bank, National"));
      nvps.add(new BasicNameValuePair("BankRoutingCode", "075900575"));
      nvps.add(new BasicNameValuePair("BeneficiaryAddressLine1", "200 King St"));
      nvps.add(new BasicNameValuePair("BeneficiaryCity", "New York"));
      nvps.add(new BasicNameValuePair("BeneficiaryCountryCode", "US"));
      nvps.add(new BasicNameValuePair("BeneficiaryName", "Jack2"));
      nvps.add(new BasicNameValuePair("BeneficiaryPostalCode", "10019"));
      nvps.add(new BasicNameValuePair("BeneficiaryRegion", "New York"));
      nvps.add(new BasicNameValuePair("Corporate", "true"));
      nvps.add(new BasicNameValuePair("Currency", "USD"));
      nvps.add(new BasicNameValuePair("HighLowValue", "1"));
      nvps.add(new BasicNameValuePair("RemittanceLine1", "BOF NanoPay X-border Corporation"));


      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
      StringBuilder sb = new StringBuilder();
      String line;
      while ( (line = rd.readLine()) != null ) {
        sb.append(line);
      }

      System.out.println("addPayee response: " + sb.toString());

    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }
}
