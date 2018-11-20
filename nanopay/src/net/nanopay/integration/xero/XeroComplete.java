package net.nanopay.integration.xero;

import com.xero.api.ApiClient;
import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;

import static foam.mlang.MLang.*;

import com.xero.api.client.AccountingApi;
import com.xero.model.*;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.util.SafetyUtil;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.xero.model.XeroContact;
import net.nanopay.integration.xero.model.XeroInvoice;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;


public class XeroComplete
  implements WebAgent {

  public void execute(X x) {
    /*
    Info:   Function to fill in information from xero into Nano portal
    Input:  nano: The object that will be filled in
            xero: The Xero object to be used
    Output: Returns the Nano Object after being filled in from Xero portal
    */
    HttpServletResponse resp         = x.get(HttpServletResponse.class);
    DAO                 store        = (DAO) x.get("xeroTokenStorageDAO");
    DAO                 notification = (DAO) x.get("notificationDAO");
    User                user         = (User) x.get("user");
    XeroTokenStorage    tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group               group        = user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    DAO                 configDAO    = (DAO) x.get("xeroConfigDAO");
    XeroIntegrationService xeroSign = (XeroIntegrationService) x.get("xeroSignIn");
    XeroConfig          config       = (XeroConfig)configDAO.find(app.getUrl());

    try {
      ResultResponse res = xeroSign.syncSys(x , user);
      if (res.getResult())
      {
        resp.sendRedirect("/" + ( (tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect() ) );
      }
      new Throwable( res.getReason() );

    } catch ( Exception e ) {
      Logger logger =  (Logger) x.get("logger");
      logger.error(e);
      if (e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired")) {
        try {
          resp.sendRedirect("/service/xero");
        } catch (IOException e1) {
          e1.printStackTrace();
        }
      } else {
        try {
          Notification notify = new Notification();
          notify.setUserId(user.getId());
          notify.setBody("An error occured while trying to sync the data: " + e.getMessage());
          notification.put(notify);
          resp.sendRedirect("/" + ((tokenStorage.getPortalRedirect() == null) ? "" : tokenStorage.getPortalRedirect()));
        } catch (IOException e1) {
          logger.error(e1);
        }
      }
    }
  }
}
