package net.nanopay.integration.xero;

import com.xero.api.OAuthAccessToken;
import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.sink.Count;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.IntegrationCode;
import net.nanopay.integration.ResultResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import static foam.mlang.MLang.*;

/**
 * When the user hits the "Connect" button in Ablii for Xero, they're
 * brought to /services/xero, which calls the execute method defined in this
 * file.
 *
 * The execute method will generate a URL for Xeros' website that the user's
 * browser gets redirected to. At that URL they'll be able to sign in and grant
 * Ablii access to their data, such as invoices, contacts, and bank accounts.
 *
 * This is the 'xero' service, which is not served. It is accessed via a web
 * agent. This needs to be a web agent because we need a URL that Xero can
 * redirect to when giving us the API access information.
 */
public class XeroService
  implements WebAgent {

  private XeroTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the xeroTokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO store = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    User user = (User) x.get("user");
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( tokenStorage == null ) {
      tokenStorage = new XeroTokenStorage();
      tokenStorage.setId(user.getId());
      tokenStorage.setToken(" ");
      tokenStorage.setTokenSecret(" ");
      tokenStorage.setTokenTimestamp("0");
      tokenStorage.setPortalRedirect(" ");
    }
    return tokenStorage;
  }

  public void execute(X x) {
    /*
    Info:   Function to access the Xero API to sign in and valid user information in Xero
    Input:  x: The context to allow access to services that will store the information obtained when contacting Xero
    */
    try {
      HttpServletRequest  req          = x.get(HttpServletRequest.class);
      HttpServletResponse resp         = x.get(HttpServletResponse.class);
      String              verifier     = req.getParameter("oauth_verifier");
      DAO                 store        = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
      User                user         = (User) x.get("user");
      DAO                 userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
      XeroTokenStorage    tokenStorage = isValidToken(x);
      String              redirect     = req.getParameter("portRedirect");
      Group               group        = user.findGroup(x);
      AppConfig           app          = group.getAppConfig(x);
      DAO                 configDAO    = ((DAO) x.get("xeroConfigDAO")).inX(x);
      XeroConfig          config       = (XeroConfig) configDAO.find(app.getUrl());
      // Checks if xero has authenticated log in ( Checks which phase in the Log in process you are in )
      if ( SafetyUtil.isEmpty(verifier) ) {

        // Calls xero login for authorization
        OAuthRequestToken requestToken = new OAuthRequestToken(config);
        requestToken.execute();
        tokenStorage.setToken(requestToken.getTempToken());
        tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());
        if ( ! SafetyUtil.isEmpty(redirect) ) {
          tokenStorage.setPortalRedirect("#" + redirect);
        }
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
          User nUser = (User) userDAO.find(user.getId());
          nUser = (User) nUser.fclone();
          nUser.setHasIntegrated(true);
          nUser.setIntegrationCode(IntegrationCode.XERO);
          userDAO.put(nUser);
          sync(x, resp);
        }
      }
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
  }


  public void sync(X x, HttpServletResponse response) {
    HttpServletResponse    resp         = x.get(HttpServletResponse.class);
    DAO                    store        = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    DAO                    notification = ((DAO) x.get("notificationDAO")).inX(x);
    User                   user         = (User) x.get("user");
    XeroTokenStorage       tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group                  group        = user.findGroup(x);
    AppConfig              app          = group.getAppConfig(x);
    DAO                    configDAO    = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroIntegrationService xeroSign     = (XeroIntegrationService) x.get("xeroSignIn");
    XeroConfig             config       = (XeroConfig)configDAO.find(app.getUrl());

    try {
      ResultResponse res = xeroSign.syncSys(x);
      if ( res.getResult() ) {
        long count = ((Count) (((DAO) x.get("localAccountDAO")).inX(x)).where(
          AND(
            INSTANCE_OF(BankAccount.getOwnClassInfo()),
            EQ(BankAccount.OWNER,user.getId())
          )).select(new Count())).getValue();
        if ( count != 0 ) {
          response.sendRedirect("/#sme.bank.matching");
        } else {
          resp.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        }
      }
      new Throwable(res.getReason());

    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        try {
          response.sendRedirect("/service/xero");
        } catch ( IOException e1 ) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occured while trying to sync the data: " + e.getMessage());
          notification.put(notify);
          response.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch ( IOException e1 ) {
          logger.error(e1);
        }
      }
    }


  }
}
