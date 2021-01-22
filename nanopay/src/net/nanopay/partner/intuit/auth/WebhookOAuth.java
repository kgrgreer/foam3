package net.nanopay.partner.intuit.auth;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.NanoService;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.auth.openid.OAuthProvider;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import javax.annotation.CheckForNull;
import javax.ws.rs.core.HttpHeaders;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;

public class WebhookOAuth implements OAuthProvider, NanoService, ContextAware {

  protected final String BEARER_TOKEN_REFRESH_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
  protected final String CLIENT_ID_SECRET_REFRESH_URL = "https://oauth.platform.intuit.com/oauth2/v1/clients";

  protected X x_;

  protected String appToken_ = "";
  protected String clientContext_ = "";
  protected String clientId_;
  protected String clientSecret_;
  protected String bearerToken_;
  protected long bearerTokenExp_;

  protected Logger getLogger() {
    return new PrefixLogger(new Object[] { "oauth", this.getClass().getSimpleName() }, (Logger) getX().get("logger"));
  }

  WebhookOAuth(String appToken, String clientContext) {
    appToken_ = appToken;
    clientContext_ = clientContext;
  }

  protected void refreshClientSecretId() throws IOException {
    var httpclient = HttpClients.createDefault();
    var httppost = new HttpPost(CLIENT_ID_SECRET_REFRESH_URL);

    httppost.addHeader(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded");

    // Get access code & id token
    var params = new ArrayList<NameValuePair>(2);
    params.add(new BasicNameValuePair("x_app_token", appToken_));
    params.add(new BasicNameValuePair("x_client_context", clientContext_));
    httppost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));

    var response = httpclient.execute(httppost);
    var entity = response.getEntity();

    var resp = EntityUtils.toString(entity, "UTF-8");
    var jsonObject = new JSONObject(resp);

    // If for some reason either of these fail we don't want to update stored client_id or client_secret
    var clientId = jsonObject.getString("client_id");
    var clientSecret = jsonObject.getString("client_secret");

    clientId_ = clientId;
    clientSecret_ = clientSecret;
  }

  @Override
  public String getAuthorizationUrl() {
    throw new UnsupportedOperationException("Intuit Webhook OAuth Provider doesn't support redirect uri");
  }

  @Override
  public String getRedirectUri() {
    throw new UnsupportedOperationException("Intuit Webhook OAuth Provider doesn't support redirect uri");
  }

  @Override
  @CheckForNull
  public String getClientId() {
    if ( Instant.now().getEpochSecond() >= bearerTokenExp_ ) {
      try {
        refreshClientSecretId();
      } catch (IOException e) {
        getLogger().error(e.getMessage());
        return null;
      }
    }
    return clientId_;
  }

  @Override
  @CheckForNull
  public String getClientSecret() {
    if ( Instant.now().getEpochSecond() >= bearerTokenExp_ ) {
      try {
        refreshClientSecretId();
      } catch (IOException e) {
        getLogger().error(e.getMessage());
        return null;
      }
    }
    return clientSecret_;
  }

  @Override
  @CheckForNull
  public String getAuthToken() {
    var now = Instant.now().getEpochSecond();

    if ( now < bearerTokenExp_ ) {
      return bearerToken_;
    }

    try {
      refreshClientSecretId();
    } catch (IOException e) {
      getLogger().error(e.getMessage());
      e.printStackTrace();
      return null;
    }

    var accessToken = Base64.getEncoder().encodeToString((clientId_ + ":" + clientSecret_).getBytes());

    var httpclient = HttpClients.createDefault();
    var httppost = new HttpPost(BEARER_TOKEN_REFRESH_URL);

    httppost.addHeader(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded");
    httppost.addHeader(HttpHeaders.AUTHORIZATION, "Basic " + accessToken);

    // Get access code & id token
    var params = new ArrayList<NameValuePair>(2);
    params.add(new BasicNameValuePair("grant_type", "client_credentials"));

    try {
      httppost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));
      var response = httpclient.execute(httppost);
      var entity = response.getEntity();

      var resp = EntityUtils.toString(entity, "UTF-8");
      var jsonObject = new JSONObject(resp);

      var bearerToken = jsonObject.getString("access_token");
      var tokenType = jsonObject.getString("token_type");
      var exp = jsonObject.getLong("expires_in");

      if ( ! tokenType.equals("bearer") ) {
        getLogger().error("Unexpected error in retrieving Auth Token: unknown tokenType, expected 'bearer'");
        throw new RuntimeException("Unexpected error in retrieving Auth Token");
      }

      bearerToken_ = bearerToken;
      bearerTokenExp_ = now + exp;

      return bearerToken_;
    } catch (IOException e) {
      getLogger().error(e.getMessage());
      return null;
    }
  }

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }

  @Override
  public void start() throws Exception {

  }
}
