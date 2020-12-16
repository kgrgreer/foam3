package net.nanopay.auth.openid;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.NanoService;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import javax.ws.rs.core.UriBuilder;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;

public class ServerOAuthService implements OAuthService, NanoService, ContextAware {

  protected HashSet<String> providers_;
  protected X x_;

  protected static Logger getLogger(X x) {
    return new PrefixLogger(new Object[] { "oauth", ServerOAuthService.class.getSimpleName() }, (Logger) x.get("logger"));
  }

  ServerOAuthService(String[] providers) {
    providers_ = new HashSet<>();
    providers_.addAll(Arrays.asList(providers));
  }

  public String[] getProviders(X x) {
    return providers_.toArray(new String[] {});
  }

  public OAuthProvider getProvider(String provider) {
    if ( ! providers_.contains(provider) )
      throw new IllegalArgumentException("Provider " + provider + " isn't a valid oauth provider");

    return (OAuthProvider) getX().get(provider);
  }

  public String getLoginUrl(X x, String providerId) {
    var provider = getProvider(providerId);

    var uri = UriBuilder.fromPath(provider.getAuthorizationUrl())
      .queryParam("scope", "openid email profile")
      .queryParam("client_id", provider.getClientId())
      .queryParam("redirect_uri", provider.getRedirectUri())
      .queryParam("response_code", "code")
      .build();

    return uri.toString();
  }

  public String getAuthHeader(String providerId) {
    var provider = getProvider(providerId);
    var header = provider.getClientId() + ":" + provider.getClientSecret();
    return Base64.getMimeEncoder().encodeToString(header.getBytes());
  }

  @Override
  public void start() throws Exception {}

  @Override
  public X getX() {
    return x_;
  }

  @Override
  public void setX(X x) {
    x_ = x;
  }

}
