package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import net.nanopay.integration.xero.model.XeroInvoice;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class XeroInvoiceDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public XeroInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }


  @Override
  public FObject put_(X x, FObject obj) {
    /*
    Info:   Function to update Xero with changed portal information (if connected)
    Input:  x: the context to use DAOs
            obj: The Invoice with the changes to be implemented
    Output: the object after changes are verified or rejected
    */

    // Skip this decorator if the object isn't a Xero Invoice
    if ( ! (obj instanceof XeroInvoice) ) {
      return getDelegate().put_(x, obj);
    }

    // Casts the 'obj' to a Xero Invoice and retrieves the old version of that invoice if it exists
    DAO         invoiceDAO = (DAO) x.get("invoiceDAO");
    XeroInvoice newInvoice = (XeroInvoice) obj;
    XeroInvoice oldInvoice = (XeroInvoice) invoiceDAO.find(newInvoice.getId());

    // If there wasn't an entry before then there is nothing to update for xero
    if ( oldInvoice == null ) {
      newInvoice.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If being called from xero update. Skip calling xero
    if ( newInvoice.getXeroUpdate() ) {
      newInvoice.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If the system is coming from being synced then don't try syncing it again
    if ( oldInvoice.getDesync() != newInvoice.getDesync() ) {
      return getDelegate().put_(x, obj);
    }

    if( ! InvoiceStatus.PAID.equals(newInvoice.getStatus()) ) {
      return getDelegate().put_(x, obj);
    }
    XeroConfig   config       = (XeroConfig) x.get("xeroConfig");
    User         user         = (User) x.get("user");
    DAO          store        = (DAO) x.get("tokenStorageDAO");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    Boolean      isPayer      = true;
    Group        group        = user.findGroup(x);
    AppConfig    app          = group.getAppConfig(x);
    config.setRedirectUri(app.getUrl() + "/service/xero");
    config.setAuthCallBackUrl(app.getUrl() + "/service/xero");

    XeroClient   client       = new XeroClient(config);
    try {
      client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
      List<Invoice> xeroInvoiceList  = client.getInvoices();
      List<Account> xeroAccountsList = client.getAccounts();
      int i;

      // Find the specific invoice in the xero
      for ( i = 0; i < xeroInvoiceList.size(); i++ ) {
        com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
        if ( ! xeroInvoice.getInvoiceID().equals(newInvoice.getXeroId()) ) {
          continue;
        }
        break;
      }
      int j;

      // Determine if current user is the Payer
      if ( user.getId() == newInvoice.getPayee().getId() ) {
        isPayer = false;
      }

      // Finds the account to be used to show a payment made in the system
      for ( j = 0; j < xeroAccountsList.size(); j++ ) {
        com.xero.model.Account xeroAccount = xeroAccountsList.get(j);

        // If the account doesn't have a code
        if (xeroAccount.getCode() == null){
          continue;
        }

        //Accounts Receivable Code
        if ( xeroAccount.getCode().equals("000") && isPayer == false ) {
          break;
        }

        //Accounts Payable Code
        if ( xeroAccount.getCode().equals("001") && isPayer == true ) {
          break;
        }
      }
      com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
      com.xero.model.Account xeroAccount = xeroAccountsList.get(j);

      // Verify that the invoice is coming from a point in which the status wasn't already PAID
      if ( newInvoice.getStatus().getName().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase()) &&
           ! oldInvoice.getStatus().getName().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase()) ) {

        // Checks to see if the xero invoice was set to Authorized before; if not sets it to authorized
        if ( ! InvoiceStatus.AUTHORISED.equals(xeroInvoice.getStatus()) ) {
          xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
          xeroInvoiceList.add( i, xeroInvoice );
          client.updateInvoice(xeroInvoiceList);
        }

        // Creates a payment for the full amount for the invoice and sets it paid to the dummy account on xero
        Payment payment = new Payment();
        payment.setInvoice(xeroInvoice);
        payment.setAccount(xeroAccount);
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        payment.setDate(cal);
        payment.setAmount(BigDecimal.valueOf(newInvoice.getAmount()/100));
        List<Payment> paymentList = new ArrayList<>();
        paymentList.add(payment);
        client.createPayments(paymentList);

      // If the change to the invoice is not that it was being PAID
      }
    } catch ( XeroApiException e ) {
      System.out.println(e.getMessage());
      e.printStackTrace();

      // If a xero error is thrown set the Desync flag to show that the user wasn't logged in to xerro at time of change
      // and to update xero at time of resynchronization
      if ( e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        newInvoice.setDesync(true);
      }
    } catch ( Exception e ) {
      e.printStackTrace();
    }
    return getDelegate().put_(x, newInvoice);
  }
}
