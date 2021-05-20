package net.nanopay.partner.intuit.auth;

import foam.core.ContextAware;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import foam.util.StringUtil;
import net.nanopay.auth.oauth.OAuthCredential;
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

public class WebhookOAuthV2 implements OAuthProvider, NanoService, ContextAware {

  protected final String BEARER_TOKEN_REFRESH_URL = "https://oauth-e2e.platform.intuit.com/oauth2/v1/tokens/bearer";

  protected X x_;

  protected String oauthCredentialId_;
  protected String bearerToken_;
  protected long bearerTokenExp_;

  protected Logger getLogger() {
    return new PrefixLogger(new Object[] { "oauth", this.getClass().getSimpleName() }, (Logger) getX().get("logger"));
  }

  WebhookOAuthV2(String oauthCredentialId) {
    oauthCredentialId_ = oauthCredentialId;
  }

  @Override
  public String getAuthorizationUrl() {
    throw new UnsupportedOperationException("Intuit Webhook OAuth Provider doesn't support redirect uri");
  }

  @Override
  public String getRedirectUri() {
    throw new UnsupportedOperationException("Intuit Webhook OAuth Provider doesn't support redirect uri");
  }

  protected OAuthCredential getOAuthCredentials() {
    final var oauthCredDAO = (DAO) getX().get("oauthCredentialDAO");
    return (OAuthCredential) oauthCredDAO.find(oauthCredentialId_);
  }

  @Override
  @CheckForNull
  public String getClientId() {
    final var creds = getOAuthCredentials();
    return creds != null ? creds.getClientId() : null;
  }

  @Override
  @CheckForNull
  public String getClientSecret() {
    final var creds = getOAuthCredentials();
    return creds != null ? creds.getClientSecret() : null;
  }

  @Override
  @CheckForNull
  public String getAuthToken() {
    var now = Instant.now().getEpochSecond();

    if ( now < bearerTokenExp_ ) {
      return bearerToken_;
    }

    final var clientId = getClientId();
    final var clientSecret = getClientSecret();

    if ( SafetyUtil.isEmpty(clientId) || SafetyUtil.isEmpty(clientSecret) ) {
      throw new AuthenticationException("OAuth credential entry \"" + oauthCredentialId_ + "\" not found");
    }

    var accessToken = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

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
