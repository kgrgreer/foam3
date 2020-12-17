package net.nanopay.accounting.xero;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.xero.api.OAuthAccessToken;
import com.xero.api.OAuthAuthorizeToken;
import com.xero.api.OAuthRequestToken;
import com.xero.api.XeroClient;

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
public class XeroWebAgent
  implements WebAgent {

  private XeroToken isValidToken(X x) {
    /*
    Info:   Function to check if the User has used Xero before
    Input:  x: The context to allow access to the xeroTokenDAO to view if there's an entry for the user
    Output: Returns the Class that contains the users Tokens to properly access Xero. If using Xero for the first time will create an empty Class to load the data in
    */
    DAO tokenDAO = ((DAO) x.get("xeroTokenDAO")).inX(x);
    User user = ((Subject) x.get("subject")).getUser();
    XeroToken token = (XeroToken) tokenDAO.find(user.getId());

    // If the user has never tried logging in to Xero before
    if ( token == null ) {
      token = new XeroToken();
      token.setId(user.getId());
      token.setToken(" ");
      token.setTokenSecret(" ");
      token.setTokenTimestamp("0");
      token.setPortalRedirect(" ");
    }
    return (XeroToken) token.fclone();
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
      DAO                 tokenDAO     = ((DAO) x.get("xeroTokenDAO")).inX(x);
      User                user         = ((Subject) x.get("subject")).getUser();
      DAO                 userDAO      = ((DAO) x.get("localUserDAO")).inX(x);
      XeroToken           token        = isValidToken(x);
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
        token.setToken(requestToken.getTempToken());
        token.setTokenSecret(requestToken.getTempTokenSecret());
        if ( ! SafetyUtil.isEmpty(redirect) ) {
          token.setPortalRedirect("#" + redirect);
        }
        //Build the Authorization URL and redirect User
        OAuthAuthorizeToken authToken = new OAuthAuthorizeToken(config, requestToken.getTempToken());
        tokenDAO.put(token);
        resp.sendRedirect(authToken.getAuthUrl());
      } else {

        // Authenticates accessToken
        OAuthAccessToken accessToken = new OAuthAccessToken(config);
        accessToken.build(verifier, token.getToken(), token.getTokenSecret()).execute();

        // Check if your Access Token call successful
        if ( ! accessToken.isSuccess() ) {

          //Resets tokens
          token.setToken("");
          token.setTokenSecret("");
          token.setTokenTimestamp("0");
          tokenDAO.put(token);
          resp.sendRedirect("/service/xeroWebAgent");
        } else {

          //Store access token and move to the synchronizing code
          token.setTokenSecret(accessToken.getTokenSecret());
          token.setToken(accessToken.getToken());
          token.setTokenTimestamp(accessToken.getTokenTimestamp());
          XeroClient client = getClient(x,accessToken);
          tokenDAO.put(token);
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

  public XeroClient getClient(X x, OAuthAccessToken token) {
    User user = ((Subject) x.get("subject")).getUser();
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    client.setOAuthToken(token.getToken(), token.getTokenSecret());
    return client;
  }

  public void sync(X x, HttpServletResponse response) {
    try {
        response.sendRedirect("/#sme.bank.matching");
    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
    }
  }
}
