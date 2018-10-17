package net.nanopay.integration.quick;

import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.ipp.services.DataService;
import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
import foam.core.X;
import foam.dao.DAO;
import foam.lib.json.JSONParser;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.client.HttpClient;
import foam.lib.json.JSONParser;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;

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


      HttpClient httpclient = HttpClients.createDefault();
      HttpGet httpget =  new HttpGet(config.getIntuitAccountingAPIHost()+"/v3/company/"+tokenStorage.getRealmId()+"/companyinfo/"+tokenStorage.getRealmId());
      httpget.setHeader("Authorization", "Bearer "+tokenStorage.getAccessToken());
      httpget.setHeader("Content-Type","application/json");
      httpget.setHeader("Api-Version","alpha");
      httpget.setHeader("Accept","application/json");
      HttpResponse response = httpclient.execute(httpget);
      BufferedReader  rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
      String line;
      line = rd.readLine();
      System.out.println(line);
      JSONParser parser = new JSONParser();

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
