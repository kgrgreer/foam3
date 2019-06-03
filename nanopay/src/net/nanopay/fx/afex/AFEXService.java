package net.nanopay.fx.afex;

import foam.core.ContextAwareSupport;
import net.nanopay.fx.ascendantfx.model.PayeeOperationResult;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

public class AFEXService extends ContextAwareSupport implements AFEX {

  private String apiKey = "00005838Ve1b47397-8772-e911-9608-892613e8802f";
  private String apiPassword = "4e48a0ab-8272-e911-80df-0050569b43ff";
  private String testPartnerApi = "https://demo.api.afex.com:7885/";
  private String testAFEXAPI = "https://demo.api.afex.com:7890/";
  private String testToken = "xKW2S2_OvaOyaqih1npJ3mbL813Dgng4TR6WY9JyslEWe4mYNjcez5IBLEgZ8gx1Fjsn5bUcZST3DCJ3yZgADU8MBy6wpgVSsWtLvkn7F6zAz46m-jNpieCzbJBiZTyG2rmhXKjPECl_-1l1_znQ3jD8_T9rMQvo7svVZxQkqKG0bAseNFaS3fYSBedGEiTM2-fRJ6Hs5G21hC7M2j0ooZViVDScjwnKevsreLi3ghMmkZCMH8zJ-jUYT2-uVqnojL6X4NDIKD8qcPtatu7HjA";

  private CloseableHttpClient httpClient = HttpClients.createDefault();

  @Override
  public String getToken() {
//    CloseableHttpClient httpClient = HttpClients.createDefault();

    try {
      HttpPost httpPost = new HttpPost(testPartnerApi + "token");

      httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");

      List<NameValuePair> nvps = new ArrayList<>();
      nvps.add(new BasicNameValuePair("Grant_Type", "password"));
      nvps.add(new BasicNameValuePair("Username", apiKey));
      nvps.add(new BasicNameValuePair("Password", apiPassword));

      httpPost.setEntity(new UrlEncodedFormEntity(nvps, "utf-8"));

      CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

      BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
      StringBuilder sb = new StringBuilder();
      String line;
      while ( (line = rd.readLine()) != null ) {
        sb.append(line);
      }

      System.out.println("token response: " + sb.toString());

    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public GetQuoteResponse getQuote() {

    //CloseableHttpClient httpClient = HttpClients.createDefault();

    try {
      URIBuilder uriBuilder = new URIBuilder(testAFEXAPI + "api/quote");
      uriBuilder.setParameter("CurrencyPair", "USDCAD")
                .setParameter("ValueDate", "2019/06/03")
                .setParameter("OptionDate", "2019/05/31");

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

      System.out.println("quote response: " + sb.toString());

    } catch (IOException | URISyntaxException e) {
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public GetQuoteResponse getValueDate() {
    //CloseableHttpClient httpClient = HttpClients.createDefault();

    try {
      URIBuilder uriBuilder = new URIBuilder(testAFEXAPI + "api/valuedates");
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
      HttpPost httpPost = new HttpPost(testAFEXAPI + "api/beneficiaryCreate");

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
