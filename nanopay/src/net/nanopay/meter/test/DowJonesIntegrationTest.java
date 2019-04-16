package net.nanopay.meter.test;

import foam.core.X;
import foam.nanos.test.Test;
import net.nanopay.meter.compliance.dowJones.DowJonesCredentials;
import net.nanopay.meter.compliance.dowJones.DowJonesService;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;
import java.util.Calendar;
import java.util.Date;

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

public class DowJonesIntegrationTest extends Test {

  @Override
  public void runTest(X x) {
    DowJonesCredentials credentials = (DowJonesCredentials) x.get("dowjonesCredentials");
    DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");

    credentials.setNamespace("18");
    credentials.setUsername("nanoAPI");
    credentials.setPassword("dowjones");

    String authCredentials = credentials.getNamespace() + "/" + credentials.getUsername() + ":" + credentials.getPassword();
    String encodedCredentials = Base64.getEncoder().encodeToString((authCredentials).getBytes());

    String firstName = "Blake";
    String lastName = "Green";

    System.out.println(dowJonesService.personNameSearch(x, firstName, lastName, null));

    /*BufferedReader rd = null;
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

      String testUrlAddress = "https://djrc.api.test.dowjones.com/v1/search/person-name?first-name="+firstName+"&surname="+lastName;
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
    }*/
  }
  
}