package net.nanopay.integration.quick;


import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.quick.model.QuickQueryBill;
import net.nanopay.integration.quick.model.QuickQueryContact;
import net.nanopay.integration.quick.model.QuickQueryInvoice;
import net.nanopay.integration.xero.XeroConfig;
import net.nanopay.integration.xero.XeroIntegrationService;
import net.nanopay.integration.xero.XeroTokenStorage;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


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
      DAO                 userDAO      = (DAO) x.get("bareUserDAO");
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
          User nUser = (User) userDAO.find(user.getId());
          nUser = (User) nUser.fclone();
          nUser.setHasIntegrated(true);
          nUser.setIntegrationCode(2);
          userDAO.put(nUser);
          sync(x, resp);
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

  public void sync(X x, HttpServletResponse response) {
    DAO                     store        = (DAO) x.get("quickTokenStorageDAO");
    User                    user         = (User) x.get("user");
    QuickTokenStorage       tokenStorage = (QuickTokenStorage) store.find(user.getId());
    DAO                     notification = (DAO) x.get("notificationDAO");
    QuickIntegrationService quickSign = (QuickIntegrationService) x.get("quickSignIn");

    try {
      ResultResponse res = quickSign.syncSys(x , user);
      if (res.getResult())
      {
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
            response.sendRedirect("/" +  (SafetyUtil.isEmpty(tokenStorage.getPortalRedirect()) ? "" : tokenStorage.getPortalRedirect() ));
          }
        }
      }
      throw new Throwable( res.getReason() );

    } catch ( Throwable e ) {
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
