package net.nanopay.kotak;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.oltu.oauth2.client.OAuthClient;
import org.apache.oltu.oauth2.client.URLConnectionClient;
import org.apache.oltu.oauth2.client.request.OAuthClientRequest;
import org.apache.oltu.oauth2.client.response.OAuthAccessTokenResponse;
import org.apache.oltu.oauth2.common.OAuth;
import org.apache.oltu.oauth2.common.exception.OAuthProblemException;
import org.apache.oltu.oauth2.common.exception.OAuthSystemException;
import org.apache.oltu.oauth2.common.message.types.GrantType;

public class KotakTokenUtil {
  public String getAccessToken() {
    final String clientId = "l7xx9aff4c89f1fb4b26b8bf1d9961479558";
    final String clientSecret = "25dd555a98e24a0ba0a5a94aa37d1555";
    final String accessTokenUrl="https://apigwuat.kotak.com:8443/auth/oauth/v2/token";

    CloseableHttpClient httpClient = HttpClients.createDefault();

    OAuthClient oAuthClient = new OAuthClient(new URLConnectionClient());

    String accessToken = null;
    try {
      OAuthClientRequest accessTokenRequest = OAuthClientRequest
        .tokenLocation(accessTokenUrl)
        .setGrantType(GrantType.CLIENT_CREDENTIALS)
        .setClientId(clientId)
        .setClientSecret(clientSecret)
        .buildQueryMessage();

      OAuthAccessTokenResponse accessTokenResponse = oAuthClient.accessToken(accessTokenRequest, OAuth.HttpMethod.POST);

      accessToken = accessTokenResponse.getAccessToken();

      System.out.println("accessToken: " + accessToken);

    } catch (OAuthSystemException | OAuthProblemException e) {
      e.printStackTrace();
    }

    return accessToken;
  }
}
