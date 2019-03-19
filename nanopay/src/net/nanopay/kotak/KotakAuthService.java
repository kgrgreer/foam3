package net.nanopay.kotak;

import com.google.api.client.auth.oauth2.ClientCredentialsTokenRequest;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.auth.oauth2.TokenResponseException;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import static org.apache.xml.serialize.OutputFormat.Defaults.Encoding;

public class KotakAuthService {
  public String getAccessToken() {
    final String clientId = "l7xx9aff4c89f1fb4b26b8bf1d9961479558";
    final String clientSecret = "25dd555a98e24a0ba0a5a94aa37d1555";
    final String accessTokenUrl="https://apigwuat.kotak.com:8443/auth/oauth/v2/token";

    String token = null;
    try {
      TokenResponse response = new ClientCredentialsTokenRequest(new NetHttpTransport(), new JacksonFactory(),
          new GenericUrl(accessTokenUrl))
          .set("client_id", clientId)
          .set("client_secret", clientSecret)
          .execute();

      token = response.getAccessToken();

      System.out.println("Access token: " + token);
    } catch (TokenResponseException e) {
      if (e.getDetails() != null) {
        System.err.println("Error: " + e.getDetails().getError());
        if (e.getDetails().getErrorDescription() != null) {
          System.err.println(e.getDetails().getErrorDescription());
        }
        if (e.getDetails().getErrorUri() != null) {
          System.err.println(e.getDetails().getErrorUri());
        }
      } else {
        System.err.println(e.getMessage());
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return token;
  }

  public void sendPaymentRequest() {
    final String paymentUrl = "https://apigwuat.kotak.com:8443/LastMileEnc/pay";

    CloseableHttpClient httpClient = HttpClients.createDefault();
    String token = getAccessToken();

    HttpPost post = new HttpPost(paymentUrl);
    post.addHeader("Authorization", "Bearer " + token);

    String bodyData = "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" +
        "gkl4awbhOM";
    post.setEntity(new StringEntity(bodyData, Encoding));

    String response;
    try {
      CloseableHttpResponse httpResponse = httpClient.execute(post);

      try {
        BufferedReader rd = new BufferedReader(new InputStreamReader(httpResponse.getEntity().getContent()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ( (line = rd.readLine()) != null ) {
          sb.append(line);
        }
        response = sb.toString();

        System.out.println("response: " + response);
      } finally {
        httpResponse.close();
      }
    } catch (IOException e) {
        e.printStackTrace();
    } finally {
      try {
        httpClient.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
  }
}
