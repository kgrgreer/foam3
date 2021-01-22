package net.nanopay.auth.openid;

import foam.core.ContextAware;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import net.nanopay.util.Tag;

import javax.ws.rs.core.UriBuilder;
import java.util.ArrayList;
import java.util.Base64;

public class ServerOAuthService implements OAuthService, NanoService, ContextAware {

  protected String providerDAOKey_;
  protected X x_;

  protected static Logger getLogger(X x) {
    return new PrefixLogger(new Object[] { "oauth", ServerOAuthService.class.getSimpleName() }, (Logger) x.get("logger"));
  }

  ServerOAuthService(String providerDAOKey) {
    providerDAOKey_ = providerDAOKey;
  }

  protected DAO getDAO() {
    return (DAO) getX().get(providerDAOKey_);
  }

  public String[] getProviders(X x) {
    var providers = new ArrayList<String>();
    for ( var element : ((ArraySink) getDAO().select(new ArraySink())).getArray()) {
      var tag = (Tag) element;
      providers.add(tag.getId());
    }
    return providers.toArray(new String[0]);
  }

  public OAuthProvider getProvider(String provider) {
    var providers = ((ArraySink) getDAO().select(new ArraySink())).getArray();
    if ( ! providers.contains(provider) )
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
