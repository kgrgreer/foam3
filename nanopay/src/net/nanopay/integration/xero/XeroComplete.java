package net.nanopay.integration.xero;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.integration.ResultResponse;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class XeroComplete
  implements WebAgent
{

  public void execute(X x) {
    /*
    Info:   Function to fill in information from xero into Nano portal
    Input:  nano: The object that will be filled in
            xero: The Xero object to be used
    Output: Returns the Nano Object after being filled in from Xero portal
    */
    HttpServletResponse resp        = x.get(HttpServletResponse.class);
    DAO store                       = (DAO) x.get("xeroTokenStorageDAO");
    DAO notification                = (DAO) x.get("notificationDAO");
    User user                       = (User) x.get("user");
    XeroTokenStorage tokenStorage   = (XeroTokenStorage) store.find(user.getId());
    XeroIntegrationService xeroSign = (XeroIntegrationService) x.get("xeroSignIn");

    try {
      ResultResponse res = xeroSign.syncSys(x , user);
      if ( res.getResult() ) {
        resp.sendRedirect("/" + ( (tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect() ) );
      } else {
        throw new Throwable(res.getReason());
      }

    } catch ( Throwable t ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(t);

      String message = t.getMessage();
      if ( ! SafetyUtil.isEmpty(message) && ( message.contains("token_rejected") || message.contains("token_expired") ) ) {
        try {
          resp.sendRedirect("/service/xero");
        } catch (IOException e1) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occurred while trying to sync the data: " + t.getMessage());
          notification.put(notify);
          resp.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch (IOException e1) {
          logger.error(e1);
        }
      }
    }
  }
}
