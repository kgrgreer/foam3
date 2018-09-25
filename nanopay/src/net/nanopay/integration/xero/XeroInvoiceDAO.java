package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
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
    if (!(obj instanceof XeroInvoice)) {
      System.out.println("MISS1");
      return getDelegate().put_(x, obj);
    }

    DAO         invoiceDAO = (DAO) x.get("invoiceDAO");
    XeroInvoice newInvoice = (XeroInvoice) obj;
    XeroInvoice oldInvoice = (XeroInvoice) invoiceDAO.find(newInvoice.getId());
    System.out.println(newInvoice.toJSON());
    if ( oldInvoice == null ) {
      newInvoice.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }
    if ( oldInvoice.getDesync() != newInvoice.getDesync() ) {
      return getDelegate().put_(x, obj);
    }
    if ( newInvoice.getXeroUpdate() ){

      newInvoice.setXeroUpdate(false);
      return getDelegate().put_(x, obj);
    }

    User         user         = (User) x.get("user");
    DAO          store        = (DAO) x.get("tokenStorageDAO");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    XeroConfig   config       = new XeroConfig();
    XeroClient   client       = new XeroClient(config);
    Boolean      isPayer      = true;
    try {
     client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
      List<Invoice> xeroInvoiceList = client.getInvoices();
      List<Account> xeroAccountsList = client.getAccounts();
      int i;
      System.out.println("MISS1");

      for ( i = 0; i < xeroInvoiceList.size(); i++ ) {
        com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
        if ( ! xeroInvoice.getInvoiceID().equals(newInvoice.getInvoiceNumber()) ) {
          continue;
        }
        break;
      }

      int j;
      if (user.getId() == newInvoice.getPayee().getId()) { isPayer = false;}
      for ( j = 0; j < xeroAccountsList.size(); j++ ) {
        com.xero.model.Account xeroAccount = xeroAccountsList.get(j);
        //Accounts Recivable
        if (xeroAccount.getCode() == null){
          continue;
        }
        if ( xeroAccount.getCode().equals("880") && isPayer == false ) {
          break;
        //Accounts Payable
        } else if ( xeroAccount.getCode().equals("881") && isPayer == true ) {
          break;
        }
      }
      com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
      com.xero.model.Account xeroAccount = xeroAccountsList.get(j);
      System.out.println(newInvoice.getStatus().getName().toLowerCase());
      System.out.println(InvoiceStatus.PAID.value().toLowerCase());
      System.out.println(oldInvoice.getStatus().getName().toLowerCase());

      if (newInvoice.getStatus().getName().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase()) && ! oldInvoice.getStatus().getName().toLowerCase().equals(InvoiceStatus.PAID.value().toLowerCase())) {
        System.out.println("HIT");
        if ( ! xeroInvoice.getStatus().toString().toLowerCase().equals(InvoiceStatus.AUTHORISED.value().toLowerCase())){
          xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
          xeroInvoiceList.add( i, xeroInvoice );
          client.updateInvoice(xeroInvoiceList);
        }

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
      } else {
        System.out.println("HIT2");

        Calendar due = Calendar.getInstance();
        due.setTime(newInvoice.getDueDate());
        xeroInvoice.setDueDate(due);
        xeroInvoiceList.add( i, xeroInvoice );

        client.updateInvoice(xeroInvoiceList);
      }

    } catch (XeroApiException e) {
      System.out.println(e.getMessage());
      e.printStackTrace();
      if (e.getMessage().contains("token_rejected") || e.getMessage().contains("token_expired") ) {
        System.out.println("HIT");
        newInvoice.setDesync(true);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return getDelegate().put_(x, newInvoice);
  }
}
