package net.nanopay.accounting.quickbooks;

import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.accounting.IntegrationCode;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * When the user hits the "Connect" button in Ablii for QuickBooks, they're
 * brought to /services/quickbooks, which calls the execute method defined in this
 * file.
 *
 * The execute method will generate a URL for QuickBooks' website that the user's
 * browser gets redirected to. At that URL they'll be able to sign in and grant
 * Ablii access to their data, such as invoices, contacts, and bank accounts.
 *
 * This is the 'quickbooks' service, which is not served. It is accessed via a web
 * agent. This needs to be a web agent because we need a URL that QuickBooks can
 * redirect to when giving us the API access information.
 */
public class QuickbooksWebAgent implements WebAgent {
  public void execute(X x) {
    /*
    Info:   Function to access the QuickBooks API to sign in and valid user information in QuickBooks
    Input:  x: The context to allow access to services that will store the information obtained when contacting QuickBooks
    */
    Logger              logger       = (Logger) x.get("logger");

    try {
      HttpServletRequest  req          = x.get(HttpServletRequest.class);
      HttpServletResponse resp         = x.get(HttpServletResponse.class);
      DAO                 store        = ((DAO) x.get("quickbooksTokenDAO")).inX(x);
      User                user         = ((Subject) x.get("subject")).getUser();
      DAO                 userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
      QuickbooksOauth          auth         = (QuickbooksOauth) x.get("quickbooksAuth");
      Group               group        = user.findGroup(x);
      AppConfig           app          = group.getAppConfig(x);
      DAO                 configDAO    = ((DAO) x.get("quickbooksConfigDAO")).inX(x);
      QuickbooksConfig         config       = (QuickbooksConfig) configDAO.find(app.getUrl());
      QuickbooksToken   tokenStorage = (QuickbooksToken) store.find(user.getId());

      if ( tokenStorage != null ) {
        tokenStorage = (QuickbooksToken) tokenStorage.fclone();
      }
      // These come from QuickBooks
      String code  = req.getParameter("code");
      String state = req.getParameter("state");
      String realm = req.getParameter("realmId");

      // This comes from our client when the user first clicks "sign in" for
      // QuickBooks.
      String redirect = req.getParameter("portRedirect");

      if ( SafetyUtil.isEmpty(code) ) {
        // This is our client accessing the service.

        // Create the object we use to store everything we need to access the
        // QuickBooks API.
        QuickbooksClientFactory factory = new QuickbooksClientFactory();
        factory.init(x);

        // Set the portal redirect URL on the object.
        tokenStorage = (QuickbooksToken) store.find(user.getId());
        tokenStorage = (QuickbooksToken) tokenStorage.fclone();
        tokenStorage.setPortalRedirect("#" + (SafetyUtil.isEmpty(redirect) ? "" : redirect));
        store.put(tokenStorage);

        // Redirect to the QuickBooks API so the user can grant Ablii access to
        // their information.
        resp.sendRedirect(tokenStorage.getAppRedirect());
      } else {
        // This is QuickBooks' API accessing the service.

        // On the return point. Checks the company is the same as it returns.
        if ( tokenStorage != null && tokenStorage.getCsrf().equals(state) ) {

          // Save the information we're getting from QuickBooks. We'll need this
          // information when we want to access the API later.
          OAuth2PlatformClient client = (OAuth2PlatformClient) auth.getOAuth();
          tokenStorage.setAuthCode(code);
          BearerTokenResponse bearerTokenResponse = client.retrieveBearerTokens(tokenStorage.getAuthCode(), config.getAppRedirect());
          tokenStorage.setAccessToken(bearerTokenResponse.getAccessToken());
          tokenStorage.setRefreshToken(bearerTokenResponse.getRefreshToken());
          tokenStorage.setRealmId(realm);
          store.put(tokenStorage);

          // Record that the user has integrated with accounting software.
          User nUser = (User) userDAO.find(user.getId());
          nUser = (User) nUser.fclone();
          nUser.setHasIntegrated(true);
          nUser.setIntegrationCode(IntegrationCode.QUICKBOOKS);
          userDAO.put(nUser);

          sync(x, resp);
        } else {

          // Resets tokens.
          if ( tokenStorage != null ) {
            tokenStorage.setAccessToken(" ");
            tokenStorage.setCsrf(" ");
            tokenStorage.setRealmId(" ");
            store.put(tokenStorage);
          }
          resp.sendRedirect("/service/quickbooksWebAgent");
        }
      }
    } catch ( Throwable e ) {
      logger.error(e);
    }
  }

  public void sync(X x, HttpServletResponse response) {
    try {
      response.sendRedirect("/#sme.bank.matching");
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
  }
}
