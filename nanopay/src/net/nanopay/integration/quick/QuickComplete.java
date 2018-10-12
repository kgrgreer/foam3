package net.nanopay.integration.quick;

import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.data.Account;
import com.intuit.ipp.data.Company;
import com.intuit.ipp.data.CompanyInfo;
import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.ipp.services.DataService;
import com.intuit.ipp.services.QueryResult;
import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
import com.intuit.oauth2.exception.OAuthException;
import com.intuit.oauth2.exception.OpenIdException;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import org.apache.commons.lang.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class QuickComplete
  implements WebAgent {

  QuickClientFactory factory;
  private QuickTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the tokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO          store        = (DAO)  x.get("quickTokenStorageDAO");
    User         user         = (User) x.get("user");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new QuickTokenStorage();
      tokenStorage.setId(user.getId());
      tokenStorage.setAccessToken(" ");
      tokenStorage.setCsrf(" ");
      tokenStorage.setRealmId(" ");
    }
    return tokenStorage;
  }

  public void execute(X x) {
    HttpServletRequest  req          = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
    DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
    QuickConfig         config       = (QuickConfig) x.get("quickConfig");
    QuickTokenStorage   tokenStorage = isValidToken(x);
    QuickOauth          auth         = (QuickOauth) x.get("quickAuth");
    String              code         = req.getParameter("code");
    String              state        = req.getParameter("state");
    String              realm        = req.getParameter("realmId");
    try {
      OAuth2PlatformClient client = (OAuth2PlatformClient) auth.getOAuth();
      OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken()); //set access token obtained from BearerTokenResponse
      String url = config.getIntuitAccountingAPIHost() +"/v3/company";
// Create context
      Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId()); //set realm id

// Create dataservice
      DataService service = new DataService(context);

// Make the API call
      String sql = "select * from companyinfo";
      QueryResult queryResult = service.executeQuery(sql);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
