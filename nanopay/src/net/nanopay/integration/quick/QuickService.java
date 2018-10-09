package net.nanopay.integration.quick;


import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.config.OAuth2Config;
import com.sun.xml.bind.v2.model.annotation.Quick;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import net.nanopay.integration.xero.TokenStorage;
import com.intuit.oauth2.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class QuickService
  implements WebAgent {

  private TokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the tokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO          store        = (DAO)  x.get("tokenStorageDAO");
    User         user         = (User) x.get("user");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new TokenStorage();
      tokenStorage.setId(user.getId());
      tokenStorage.setToken(" ");
      tokenStorage.setTokenSecret(" ");
      tokenStorage.setTokenTimestamp("0");
    }
    return tokenStorage;
  }

  public void execute(X x) {
    /*
    Info:   Function to access the Xero API to sign in and valid user information in Xero
    Input:  x: The context to allow access to services that will store the information obtained when contacting Xero
    */
    try {
      HttpServletRequest  req          = (HttpServletRequest) x.get(HttpServletRequest.class);
      HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
      QuickConfig config = new QuickConfig();
      OAuth2Config oauth2Config = new OAuth2Config.OAuth2ConfigBuilder(config.getOAuth2AppClientId(), config.getOAuth2AppClientSecret()) //set client id, secret
        .buildConfig();
      System.out.println(oauth2Config.getClientId());
      OAuth2PlatformClient client = new OAuth2PlatformClient(oauth2Config);
      oauth2Config.getIntuitAuthorizationEndpoint();
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}
