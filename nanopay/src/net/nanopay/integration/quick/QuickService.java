package net.nanopay.integration.quick;


import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class QuickService
  implements WebAgent {
  public void execute(X x) {
    /*
    Info:   Function to access the QuickBooks API to sign in and valid user information in QuickBooks
    Input:  x: The context to allow access to services that will store the information obtained when contacting QuickBooks
    */
    Logger              logger       = (Logger) x.get("logger");
    try {
      HttpServletRequest  req          = x.get(HttpServletRequest.class);
      HttpServletResponse resp         = x.get(HttpServletResponse.class);
      DAO                 store        = (DAO) x.get("quickTokenStorageDAO");
      User                user         = (User) x.get("user");
      QuickOauth          auth         = (QuickOauth) x.get("quickAuth");
      Group               group        = user.findGroup(x);
      AppConfig           app          = group.getAppConfig(x);
      DAO                 configDAO    = (DAO) x.get("quickConfigDAO");
      QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
      QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());
      String              code         = req.getParameter("code");
      String              state        = req.getParameter("state");
      String              realm        = req.getParameter("realmId");
      String              redirect     = req.getParameter("portRedirect");

      // Checks if QB has authenticated log in ( Checks which phase in the Sign in process you are in )
      if( SafetyUtil.isEmpty(code) ) {
        QuickClientFactory factory = new QuickClientFactory();
        //Builds the urls
        factory.init(x);
        tokenStorage = (QuickTokenStorage) store.find(user.getId());
        tokenStorage.setPortalRedirect("#" + ( (SafetyUtil.isEmpty(redirect) ) ? "" : redirect ) );
        store.put(tokenStorage);

        //creates the redirected url
        resp.sendRedirect(tokenStorage.getAppRedirect());
      } else {

        //On the return point. Checks the company is the same as it returns
        if ( tokenStorage.getCsrf().equals(state) ) {
          OAuth2PlatformClient client = (OAuth2PlatformClient) auth.getOAuth();
          tokenStorage.setAuthCode(code);
          BearerTokenResponse bearerTokenResponse = client.retrieveBearerTokens(tokenStorage.getAuthCode(), config.getAppRedirect());
          tokenStorage.setAccessToken(bearerTokenResponse.getAccessToken());
          tokenStorage.setRefreshToken(bearerTokenResponse.getRefreshToken());
          tokenStorage.setRealmId(realm);
          store.put(tokenStorage);
          resp.sendRedirect("/service/quickComplete" + tokenStorage.getPortalRedirect());
        } else {

          //Resets tokens
          tokenStorage.setAccessToken(" ");
          tokenStorage.setCsrf(" ");
          tokenStorage.setRealmId(" ");
          store.put(tokenStorage);
          resp.sendRedirect("/service/quick");
        }
      }
    } catch ( Throwable e ) {
      e.printStackTrace();
      logger.error(e);
    }
  }
}
