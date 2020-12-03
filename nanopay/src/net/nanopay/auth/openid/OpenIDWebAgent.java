/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.auth.openid;

import foam.core.ContextAware;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.http.HttpParameters;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import javax.security.auth.login.LoginException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

public class OpenIDWebAgent implements WebAgent, NanoService, ContextAware {

  protected X x_;
  protected String AccessTokenUrl;
  protected String RedirectURI;
  protected String ClientSecret;
  protected String ClientID;
  protected String GroupID;

  OpenIDWebAgent(String accessTokenUrl, String redirectURI, String clientSecret, String clientId, String groupId) {
    AccessTokenUrl = accessTokenUrl;
    RedirectURI = redirectURI;
    ClientSecret = clientSecret;
    ClientID = clientId;
    GroupID = groupId;
  }

  protected long generateUser(X x, JSONObject idToken, SSOToken ssoToken, String password) throws LoginException {
    var userDAO = (DAO) x.get("localUserDAO");
    var user = new User();

    user.setFirstName(idToken.getString("given_name"));
    user.setLastName(idToken.getString("family_name"));
    user.setEmail(idToken.getString("email"));
    user.setGroup(GroupID);
    user.setEmailVerified(true);
    user.setDesiredPassword(password);
    user.setToken(ssoToken.getId());

    userDAO.put(user);
    return user.getId();
  }

  protected void validateIDToken(String header, String body) {
    // TODO Verify ID token was signed by oauth2 ISS, could use com.auth0 java-jwt package
  }

  protected JSONObject getIDToken(String idtoken) {
    var jwt = idtoken.split("\\.");
    var jwtHeader = new String(Base64.getMimeDecoder().decode(jwt[0]));
    var jwtBody = new String(Base64.getMimeDecoder().decode(jwt[1]));
    validateIDToken(jwtHeader, jwtBody);
    return new JSONObject(jwtBody);
  }

  protected void validateState(X x, String state) throws LoginException {
    // TODO Validate state, or potentially ignore it
  }

  protected String generatePassword(SSOToken sso) {
    // TODO I don't think is the best way to do this, the hash code is only 8 digits long
    var sj = new StringJoiner(".");
    sj.add(sso.getISS());
    sj.add(sso.getAUD());
    sj.add(sso.getSUB());
    return Integer.toHexString(sj.toString().hashCode());
  }

  protected long getUser(X x, String code) throws LoginException, IOException {
    var logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName(), "oauth" }, logger);
    CloseableHttpClient httpclient = HttpClients.createDefault();
    HttpPost httppost = new HttpPost(AccessTokenUrl);

    // Check if the redirect URI has already been set in a previous execute call
    String redirectUri = RedirectURI;
    if ( SafetyUtil.isEmpty(redirectUri) ) {
      RedirectURI = ((AppConfig) x.get("appConfig")).getUrl() + "/service/openid";
    }

    // Get access code & id token
    var params = new ArrayList<NameValuePair>(2);
    params.add(new BasicNameValuePair("grant_type", "authorization_code"));
    params.add(new BasicNameValuePair("client_id", ClientID));
    params.add(new BasicNameValuePair("client_secret", ClientSecret));
    params.add(new BasicNameValuePair("code", code));
    params.add(new BasicNameValuePair("redirect_uri", RedirectURI));
    httppost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));

    httppost.addHeader("content-type", "application/x-www-form-urlencoded");

    var response = httpclient.execute(httppost);
    HttpEntity entity = response.getEntity();

    if (entity != null) {
      var resp = EntityUtils.toString(entity, "UTF-8");
      logger.log(resp);
      var jsonObject = new JSONObject(resp);

      if ( jsonObject.has("error") ) {
        var errorString = jsonObject.getString("error");
        if ( jsonObject.has("error_description")) {
          errorString = errorString + "," + jsonObject.getString("error");
        }
        logger.log(errorString);
        throw new LoginException(errorString);
      }

      var idtoken = getIDToken(jsonObject.getString("id_token"));

      if ( idtoken.has("exp") && Instant.now().getEpochSecond() > idtoken.getLong("exp") ) {
        throw new LoginException("ID Token expired");
      }

      if ( idtoken.has("iat") && Instant.now().getEpochSecond() < idtoken.getLong("iat") ) {
        throw new LoginException("ID Token bad issue date");
      }

      // Generate modeled SSO token
      var ssoToken = new SSOToken.Builder(x)
        .setAUD(idtoken.getString("aud"))
        .setISS(idtoken.getString("iss"))
        .setSUB(idtoken.getString("sub"))
        .build();

      var ssoTokenDAO = (DAO) x.get("ssoTokenDAO");
      var ssoUserToken = (SSOToken) ssoTokenDAO.find(ssoToken);
      var password = generatePassword(ssoToken);

      if ( ssoUserToken == null ) {
        // Generating the user might fail, so we should only put the ssoToken into the ssoTokenDAO iff it succeeds
        var userId = generateUser(x, idtoken, ssoToken, password);
        ssoTokenDAO.put(ssoToken);
        return userId;
      }
      var sink = (ArraySink) ssoToken.getUser(x).limit(1).select(new ArraySink());
      if ( sink.getArray().size() == 0 ) {
        throw new LoginException("SSO Token exists with no user associated");
      }

      return ((User) sink.getArray().get(0)).getId();
    }

    throw new LoginException("Invalid OIDC response");
  }

  protected String generateToken(X x, long userid) {
    var service = (OTLoginService) x.get("otLoginService");
    return service.generateToken(x, userid);
  }

  @Override
  public void execute(X x) {
    var logger = (Logger) x.get("logger");
    logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName(), "oauth" }, logger);
    var resp = x.get(HttpServletResponse.class);
    var p = x.get(HttpParameters.class);
    var code = (String) p.get("code");
    var state = (String) p.get("state");

    try {
      try {
        if (SafetyUtil.isEmpty(code)) {
          throw new RuntimeException("OpenID redirectURI code required");
        }

        if ( ! SafetyUtil.isEmpty(state)) {
          validateState(x, state);
        }

        var token = generateToken(x, getUser(x, code));
        resp.sendRedirect("/?otltoken=" + token);
      } catch (LoginException le) {
        resp.sendRedirect("/");
      }
    } catch (Throwable t) {
      logger.error(t);
      try {
        resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, t.getMessage());
      } catch (java.io.IOException e) {
        logger.error("Failed to send HttpServletResponse CODE", e);
      }
    }
  }

  @Override
  public void start() throws Exception {
    if ( SafetyUtil.isEmpty(RedirectURI) ) {
      var baseUrl = ((AppConfig) getX().get("appConfig")).getUrl();
      RedirectURI = baseUrl + (baseUrl.endsWith("/") ? "service/openid" : "/service/openid");
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
}
