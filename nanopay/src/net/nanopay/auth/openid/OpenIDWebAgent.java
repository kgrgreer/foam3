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

import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
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
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;
import java.io.IOException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.ArrayList;
import java.util.Base64;
import java.util.StringJoiner;

public class OpenIDWebAgent implements OAuthProvider, WebAgent, NanoService, ContextAware {

  protected X x_;
  protected String authorizationUrl_;
  protected String accessTokenUrl_;
  protected String providerUrl_;
  protected String redirectUri_;
  protected String clientSecret_;
  protected String clientId_;
  protected String groupId_;
  protected String spidId_;
  protected JwkProvider keyProvider_;

  @Override
  public String getAuthorizationUrl() {
    return authorizationUrl_;
  }

  @Override
  public String getRedirectUri() {
    return redirectUri_;
  }

  @Override
  public String getClientId() {
    return clientId_;
  }

  @Override
  public String getClientSecret() {
    return clientSecret_;
  }

  @Override
  public String getAuthToken() {
    return Base64.getMimeEncoder().encodeToString((clientId_ + ":" + clientSecret_).getBytes());
  }

  protected Logger getLogger(X x) {
    return new PrefixLogger(new Object[] { "oauth", this.getClass().getSimpleName() }, (Logger) x.get("logger"));
  }

  OpenIDWebAgent(String authorizationUrl, String accessTokenUrl, String providerUrl, String redirectUri, String clientSecret, String clientId, String groupId, String spidId) {
    authorizationUrl_ = authorizationUrl;
    accessTokenUrl_ = accessTokenUrl;
    providerUrl_ = providerUrl;
    redirectUri_ = redirectUri;
    clientSecret_ = clientSecret;
    clientId_ = clientId;
    groupId_ = groupId;
    spidId_ = spidId;
  }

  protected long generateUser(X x, DecodedJWT jwt, SSOToken ssoToken, String password) {
    var userDAO = (DAO) x.get("localUserDAO");
    var user = new User();

    user.setFirstName(jwt.getClaim("given_name").asString());
    user.setLastName(jwt.getClaim("family_name").asString());
    user.setEmail(jwt.getClaim("email").asString());
    user.setGroup(groupId_);
    if ( ! SafetyUtil.isEmpty(spidId_) ) {
      user.setSpid(spidId_);
    }
    user.setEmailVerified(true);
    user.setDesiredPassword(password);
    user.setToken(ssoToken.getId());

    userDAO.put(user);
    getLogger(x).info("Generated user " + jwt.getClaim("email").asString() + "," + ssoToken.getSUB() + "," + user.getGroup() + "," + user.getSpid());
    return user.getId();
  }

  protected RSAPublicKey getRSAPublicKey(String kid) throws JwkException {
    return (RSAPublicKey) keyProvider_.get(kid).getPublicKey();
  }

  protected void validateIDToken(DecodedJWT jwt) throws LoginException {
    var algtype = jwt.getAlgorithm();
    var kid = jwt.getKeyId();

    // TODO Verify ID token was signed by oauth2 ISS, could use com.auth0 java-jwt package
    Algorithm alg = null;
    getLogger(getX()).info("SSO JWT signed with " + algtype);
    try {
      switch (algtype) {
        case "none":
          alg = Algorithm.none();
          break;
        case "HS256":
          alg = Algorithm.HMAC256(clientSecret_);
          break;
        case "HS384":
          alg = Algorithm.HMAC384(clientSecret_);
          break;
        case "HS512":
          alg = Algorithm.HMAC512(clientSecret_);
          break;
        case "RS256":
          alg = Algorithm.RSA256(getRSAPublicKey(kid), null);
          break;
        case "RS384":
          alg = Algorithm.RSA384(getRSAPublicKey(kid), null);
          break;
        case "RS512":
          alg = Algorithm.RSA512(getRSAPublicKey(kid), null);
          break;
        case "ES256":
          alg = Algorithm.ECDSA256(null, null);
          break;
        case "ES384":
          alg = Algorithm.ECDSA384(null, null);
          break;
        case "ES512":
          alg = Algorithm.ECDSA512(null, null);
          break;
        case "PS256":
        case "PS384":
        case "PS512":
          // Apparently these are outdated/insecure
          break;
      }
    } catch (JwkException e) {
      getLogger(getX()).error("Jwk Algorith creation failed '" + e.getMessage() + "'");
      throw new LoginException("There was an error logging in");
    }

    if ( alg == null ) {
      getLogger(getX()).error("JWK Validation failure due to unrecognized or invalid algorithm");
      throw new LoginException("There was an error logging in");
    }

    var jwtVerifier = JWT.require(alg)
      .withAudience(clientId_)
      .acceptLeeway(7200)
      .build();

    try {
      jwtVerifier.verify(jwt);
    } catch (JWTVerificationException e) {
      getLogger(getX()).log("JWT Verification failed: '" + e.getMessage() + "'");
      throw new LoginException("Error logging in user");
    }
  }

  protected DecodedJWT getJWT(String jwt) throws LoginException {
    var decJwt = JWT.decode(jwt);
    validateIDToken(decJwt);
    return decJwt;
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
    CloseableHttpClient httpclient = HttpClients.createDefault();
    HttpPost httppost = new HttpPost(accessTokenUrl_);

    // Check if the redirect URI has already been set in a previous execute call
    String redirectUri = redirectUri_;
    if ( SafetyUtil.isEmpty(redirectUri_) ) {
      redirectUri_ = ((AppConfig) x.get("appConfig")).getUrl() + "/service/openid";
    }

    // Get access code & id token
    var params = new ArrayList<NameValuePair>(2);
    params.add(new BasicNameValuePair("grant_type", "authorization_code"));
    params.add(new BasicNameValuePair("client_id", clientId_));
    params.add(new BasicNameValuePair("client_secret", clientSecret_));
    params.add(new BasicNameValuePair("code", code));
    params.add(new BasicNameValuePair("redirect_uri", redirectUri_));
    httppost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));


    httppost.addHeader(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded");

    var response = httpclient.execute(httppost);
    HttpEntity entity = response.getEntity();

    if (entity != null) {
      var resp = EntityUtils.toString(entity, "UTF-8");
      var jsonObject = new JSONObject(resp);

      if ( jsonObject.has("error") ) {
        var errorString = jsonObject.getString("error");
        if ( jsonObject.has("error_description")) {
          errorString = errorString + "," + jsonObject.getString("error");
        }
        throw new LoginException(errorString);
      }

      var jwt = getJWT(jsonObject.getString("id_token"));

      // Generate modeled SSO token
      var ssoToken = new SSOToken.Builder(x)
        .setAUD(jwt.getClaim("aud").asString())
        .setISS(jwt.getClaim("iss").asString())
        .setSUB(jwt.getClaim("sub").asString())
        .build();

      var ssoTokenDAO = (DAO) x.get("ssoTokenDAO");
      var ssoUserToken = (SSOToken) ssoTokenDAO.find(ssoToken);
      var password = generatePassword(ssoToken);

      if ( ssoUserToken == null ) {
        // Generating the user might fail, so we should only put the ssoToken into the ssoTokenDAO iff it succeeds
        var userId = generateUser(x, jwt, ssoToken, password);
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
    var logger = getLogger(x);
    var resp = x.get(HttpServletResponse.class);
    var p = x.get(HttpParameters.class);
    var code = (String) p.get("code");
    var state = (String) p.get("state");

    try {
      try {
        if (SafetyUtil.isEmpty(code)) {
          throw new RuntimeException("OpenID code required");
        }

        if ( ! SafetyUtil.isEmpty(state)) {
          validateState(x, state);
        }

        var token = generateToken(x, getUser(x, code));
        resp.sendRedirect("/?otltoken=" + token);
      } catch (LoginException le) {
        logger.error(le.getMessage());
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
    if ( SafetyUtil.isEmpty(redirectUri_) ) {
      var baseUrl = ((AppConfig) getX().get("appConfig")).getUrl();
      redirectUri_ = baseUrl + (baseUrl.endsWith("/") ? "service/openid" : "/service/openid");
      getLogger(getX()).info("Set redirectUri_ to " + redirectUri_);
    }

    keyProvider_ = new UrlJwkProvider(new URL(providerUrl_), null, null);
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
