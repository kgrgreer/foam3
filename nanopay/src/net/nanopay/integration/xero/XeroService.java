package net.nanopay.integration.xero;

import com.xero.api.OAuthAccessToken;
import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class XeroService
  implements WebAgent {

  private XeroTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the tokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO          store        = (DAO)  x.get("tokenStorageDAO");
    User         user         = (User) x.get("user");
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new XeroTokenStorage();
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
      String              verifier     = req.getParameter("oauth_verifier");
      DAO                 store        = (DAO) x.get("tokenStorageDAO");
      User                user         = (User) x.get("user");
      XeroTokenStorage    tokenStorage = isValidToken(x);
      String              redirect     = req.getParameter("portRedirect");
      Group               group        = user.findGroup(x);
      AppConfig           app          = group.getAppConfig(x);
      DAO                 configDAO    = (DAO) x.get("xeroConfigDAO");
      XeroConfig          config       = (XeroConfig) configDAO.find(app.getUrl());

      // Checks if xero has authenticated log in ( Checks which phase in the Log in process you are in )
      if ( verifier == null ) {

        // Calls xero login for authorization
        OAuthRequestToken requestToken = new OAuthRequestToken(config);
        requestToken.execute();
        tokenStorage.setToken(requestToken.getTempToken());
        tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());
        tokenStorage.setPortalRedirect("#" + ( (redirect == null) ? "" : redirect ) );

        //Build the Authorization URL and redirect User
        OAuthAuthorizeToken authToken = new OAuthAuthorizeToken(config, requestToken.getTempToken());
        store.put(tokenStorage);
        resp.sendRedirect(authToken.getAuthUrl());
      } else {

        // Authenticates accessToken
        OAuthAccessToken accessToken = new OAuthAccessToken(config);
        accessToken.build(verifier, tokenStorage.getToken(), tokenStorage.getTokenSecret()).execute();

        // Check if your Access Token call successful
        if ( ! accessToken.isSuccess() ) {

          //Resets tokens
          tokenStorage.setToken("");
          tokenStorage.setTokenSecret("");
          tokenStorage.setTokenTimestamp("0");
          store.put(tokenStorage);
          resp.sendRedirect("/service/xero");
        } else {

          //Store access token and move to the synchronizing code
          tokenStorage.setTokenSecret(accessToken.getTokenSecret());
          tokenStorage.setToken(accessToken.getToken());
          tokenStorage.setTokenTimestamp(accessToken.getTokenTimestamp());
          store.put(tokenStorage);
          resp.sendRedirect("/service/xeroComplete");
        }
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}
