package net.nanopay.meter.test;

import foam.core.X;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

// apache
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.commons.io.IOUtils;
import org.apache.http.util.EntityUtils;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.client.config.RequestConfig;

public class DowJonesIntegrationTest extends foam.nanos.test.Test {

  String namespace = "18";
  String username = "nanoAPI";
  String password = "dowjones";

  @Override
  public void runTest(X x) {
    String authCredentials = namespace + "/" + username + ":" + password;
    String encodedCredentials = Base64.getEncoder().encodeToString((authCredentials).getBytes());

    BufferedReader rd = null;
    HttpEntity responseEntity = null;
    HttpResponse response = null;
    HttpClient client = null;
    try {
      int timeout = 30;
      RequestConfig config = RequestConfig.custom()
        .setConnectTimeout(timeout*1000)
        .setConnectionRequestTimeout(timeout*1000).build();
      client = HttpClientBuilder.create().setDefaultRequestConfig(config).build();
      client = HttpClientBuilder.create().build();

      String testUrlAddress = "https://djrc.api.test.dowjones.com/v1/search/name?name=medvedev&record-type=P&search-type=precise&exclude-deceased=true&hits-from=0&hits-to=4";
      HttpGet get = new HttpGet(testUrlAddress);
      get.setHeader("Authorization", "Basic " + encodedCredentials);
      response = client.execute(get);
      ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
      response.getEntity().writeTo(outputStream);
      String responseString = outputStream.toString();
      System.out.println(responseString);

    } catch ( Throwable t ) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(rd);
      HttpClientUtils.closeQuietly(response);
      HttpClientUtils.closeQuietly(client);
    }
  }
  
}