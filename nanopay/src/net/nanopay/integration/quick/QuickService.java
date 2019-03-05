package net.nanopay.integration.quick;

import com.intuit.oauth2.client.OAuth2PlatformClient;
import com.intuit.oauth2.data.BearerTokenResponse;
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
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.IntegrationCode;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static foam.mlang.MLang.*;


/**
 * When the user hits the "Connect" button in Ablii for QuickBooks, they're
 * brought to /services/quick, which calls the execute method defined in this
 * file.
 *
 * The execute method will generate a URL for QuickBooks' website that the user's
 * browser gets redirected to. At that URL they'll be able to sign in and grant
 * Ablii access to their data, such as invoices, contacts, and bank accounts.
 *
 * This is the 'quick' service, which is not served. It is accessed via a web
 * agent. This needs to be a web agent because we need a URL that QuickBooks can
 * redirect to when giving us the API access information.
 */
public class QuickService implements WebAgent {
  public void execute(X x) {
    /*
    Info:   Function to access the QuickBooks API to sign in and valid user information in QuickBooks
    Input:  x: The context to allow access to services that will store the information obtained when contacting QuickBooks
    */
    Logger              logger       = (Logger) x.get("logger");

    try {
      HttpServletRequest  req          = x.get(HttpServletRequest.class);
      HttpServletResponse resp         = x.get(HttpServletResponse.class);
      DAO                 store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
      User                user         = (User) x.get("user");
      DAO                 userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
      QuickOauth          auth         = (QuickOauth) x.get("quickAuth");
      Group               group        = user.findGroup(x);
      AppConfig           app          = group.getAppConfig(x);
      DAO                 configDAO    = ((DAO) x.get("quickConfigDAO")).inX(x);
      QuickConfig         config       = (QuickConfig) configDAO.find(app.getUrl());
      QuickTokenStorage   tokenStorage = (QuickTokenStorage) store.find(user.getId());

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
        QuickClientFactory factory = new QuickClientFactory();
        factory.init(x);

        // Set the portal redirect URL on the object.
        tokenStorage = (QuickTokenStorage) store.find(user.getId());
        tokenStorage.setPortalRedirect("#" + (SafetyUtil.isEmpty(redirect) ? "" : redirect));
        store.put(tokenStorage);

        // Redirect to the QuickBooks API so the user can grant Ablii access to
        // their information.
        resp.sendRedirect(tokenStorage.getAppRedirect());
      } else {
        // This is QuickBooks' API accessing the service.

        // On the return point. Checks the company is the same as it returns.
        if ( tokenStorage.getCsrf().equals(state) ) {

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
    DAO                     store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    User                    user         = (User) x.get("user");
    QuickTokenStorage       tokenStorage = (QuickTokenStorage) store.find(user.getId());
    DAO                     notification = ((DAO) x.get("notificationDAO")).inX(x);
    NewQuickIntegrationService quickSign    = (NewQuickIntegrationService) x.get("quickSignIn");

    try {

      // Sync all invoices, contacts, and bank accounts.
      ResultResponse res = quickSign.syncSys(x);
      if ( ! res.getResult() ) {
        throw new Throwable(res.getReason());
      }

      // Check if the user has any bank accounts. If they do, send them to the
      // bank account matching screen so they can specify if any accounts they
      // added in Ablii are the same as any accounts imported from QuickBooks.
      // If the user doesn't have any bank accounts in Ablii, just redirect to
      // whatever page they were on before.
      long count = ((Count) (((DAO) x.get("localAccountDAO")).inX(x))
        .where(
          AND(
            INSTANCE_OF(BankAccount.getOwnClassInfo()),
            EQ(BankAccount.OWNER, user.getId())
          )
        )
        .select(new Count())).getValue();

      if ( count != 0 ) {
        response.sendRedirect("/#sme.bank.matching");
      } else {
        response.sendRedirect("/" + (SafetyUtil.isEmpty(tokenStorage.getPortalRedirect()) ? "" : tokenStorage.getPortalRedirect()));
      }
    } catch ( Throwable e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error(e);

      if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        try {
          response.sendRedirect("/service/quick");
        } catch ( IOException e1 ) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occurred while trying to sync with QuickBooks: " + e.getMessage());
          notification.put(notify);
          response.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch ( IOException e1 ) {
          logger.error(e1);
        }
      }
    }
  }
}
