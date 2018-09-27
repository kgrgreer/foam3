package net.nanopay.integration.xero;

import com.xero.api.OAuthAccessToken;
import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class XeroService
  implements WebAgent {

  private TokenStorage isValidToken(X x) {

    // Checks if user has used xero
    DAO          store        = (DAO)  x.get("tokenStorageDAO");
    User         user         = (User) x.get("user");
    TokenStorage tokenStorage;

                 tokenStorage = (TokenStorage) store.find(user.getId());
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
    try {
      HttpServletRequest  req          = (HttpServletRequest) x.get(HttpServletRequest.class);
      HttpServletResponse resp         = (HttpServletResponse) x.get(HttpServletResponse.class);
      XeroConfig          config       = new XeroConfig();
      String              verifier     = req.getParameter("oauth_verifier");
      DAO                 store        = (DAO) x.get("tokenStorageDAO");
      User                user         = (User) x.get("user");
      TokenStorage        tokenStorage;
      tokenStorage = isValidToken(x);

      // Checks if xero has authenticated log in
      if ( verifier == null ) {

        // Checks if user is still logged into xero
        if ( (1000 * Long.parseLong(tokenStorage.getTokenTimestamp()) + (1000 * 60 * 3)) > System.currentTimeMillis() ) {
          resp.sendRedirect("/#");
        } else {

          // Calls xero login for authorization
          OAuthRequestToken requestToken = new OAuthRequestToken(config);
          requestToken.execute();
          tokenStorage.setToken(requestToken.getTempToken());
          tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());

          //Build the Authorization URL and redirect User
          OAuthAuthorizeToken authToken = new OAuthAuthorizeToken(config, requestToken.getTempToken());
          store.put(tokenStorage);
          resp.sendRedirect(authToken.getAuthUrl());
        }

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
          //Store access token
          tokenStorage.setTokenSecret(accessToken.getTokenSecret());
          tokenStorage.setToken(accessToken.getToken());
          tokenStorage.setTokenTimestamp(accessToken.getTokenTimestamp());
          store.put(tokenStorage);
          resp.sendRedirect("/service/xeroComplete");
//          resp.sendRedirect("/");

        }
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
  }
}
