package net.nanopay.integration.xero;

import com.sun.org.apache.bcel.internal.generic.INSTANCEOF;
import com.xero.api.OAuthAccessToken;
import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.ResultResponse;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


public class XeroService
  implements WebAgent {

  private XeroTokenStorage isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the xeroTokenStorageDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO store = (DAO) x.get("xeroTokenStorageDAO");
    User user = (User) x.get("user");
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());

    // If the user has never tried logging in to Xero before
    if (tokenStorage == null) {
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
      HttpServletRequest  req = (HttpServletRequest) x.get(HttpServletRequest.class);
      HttpServletResponse resp = (HttpServletResponse) x.get(HttpServletResponse.class);
      String              verifier = req.getParameter("oauth_verifier");
      DAO                 store = (DAO) x.get("xeroTokenStorageDAO");
      User                user = (User) x.get("user");
      DAO                 userDAO      = (DAO) x.get("localUserDAO");
      XeroTokenStorage    tokenStorage = isValidToken(x);
      String              redirect = req.getParameter("portRedirect");
      Group               group = user.findGroup(x);
      AppConfig           app = group.getAppConfig(x);
      DAO                 configDAO = (DAO) x.get("xeroConfigDAO");
      XeroConfig          config = (XeroConfig) configDAO.find(app.getUrl());

      // Checks if xero has authenticated log in ( Checks which phase in the Log in process you are in )
      if (SafetyUtil.isEmpty(verifier)) {

        // Calls xero login for authorization
        OAuthRequestToken requestToken = new OAuthRequestToken(config);
        requestToken.execute();
        tokenStorage.setToken(requestToken.getTempToken());
        tokenStorage.setTokenSecret(requestToken.getTempTokenSecret());
        if ( ! SafetyUtil.isEmpty(redirect)) {
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
        if ( ! accessToken.isSuccess()) {

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
          nUser.setIntegrationCode(1);
          userDAO.put(nUser);
          sync(x, resp);
        }
      }
    } catch (Throwable e) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
  }


  public void sync(X x, HttpServletResponse response) {
    HttpServletResponse    resp         = x.get(HttpServletResponse.class);
    DAO                    store        = (DAO) x.get("xeroTokenStorageDAO");
    DAO                    notification = (DAO) x.get("notificationDAO");
    User                   user         = (User) x.get("user");
    XeroTokenStorage       tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group                  group        = user.findGroup(x);
    AppConfig              app          = group.getAppConfig(x);
    DAO                    configDAO    = (DAO) x.get("xeroConfigDAO");
    XeroIntegrationService xeroSign     = (XeroIntegrationService) x.get("xeroSignIn");
    XeroConfig             config       = (XeroConfig)configDAO.find(app.getUrl());

    try {
      ResultResponse res = xeroSign.syncSys(x , user);
      if (res.getResult())
      {
        long count = ((Count) ((DAO) x.get("localAccountDAO")).where(
          MLang.AND(
            MLang.INSTANCE_OF(BankAccount.getOwnClassInfo()),
            MLang.EQ(BankAccount.OWNER,user.getId())
          )).select(new Count())).getValue();
        if  (count != 0 ) {
          response.sendRedirect("/#sme.bank.matching");
        } else {
          resp.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        }
      }
      new Throwable( res.getReason() );

    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      if (e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired")) {
        try {
          response.sendRedirect("/service/xero");
        } catch (IOException e1) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occured while trying to sync the data: " + e.getMessage());
          notification.put(notify);
          response.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch (IOException e1) {
          logger.error(e1);
        }
      }
    }


  }
}
