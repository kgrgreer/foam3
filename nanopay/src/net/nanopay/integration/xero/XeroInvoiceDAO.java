package net.nanopay.integration.xero;

import com.xero.api.XeroApiException;
import com.xero.api.XeroClient;
import com.xero.model.Invoice;
import com.xero.model.InvoiceStatus;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.integration.xero.model.XeroInvoice;

import java.math.BigDecimal;
import java.util.Calendar;
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
      return getDelegate().put_(x, obj);
    }

    DAO         invoiceDAO = (DAO) x.get("invoiceDAO");
    XeroInvoice newInvoice = (XeroInvoice) obj;
    XeroInvoice oldInvoice = (XeroInvoice) invoiceDAO.find(newInvoice.getId());

    if ( oldInvoice == null ) {
      return getDelegate().put_(x, obj);
    }
    if ( oldInvoice.getDesync() != newInvoice.getDesync() )
    {
      return getDelegate().put_(x, obj);
    }
    User         user         = (User) x.get("user");
    DAO          store        = (DAO) x.get("tokenStorageDAO");
    TokenStorage tokenStorage = (TokenStorage) store.find(user.getId());
    XeroConfig   config       = new XeroConfig();
    XeroClient   client       = new XeroClient(config);
    try {
      client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
      List<Invoice> xeroInvoiceList = client.getInvoices();
      for ( int i = 0; i < xeroInvoiceList.size(); i++ ) {
        com.xero.model.Invoice xeroInvoice = xeroInvoiceList.get(i);
        if ( ! xeroInvoice.getInvoiceID().equals(newInvoice.getInvoiceNumber()) ) {
          continue;
        }
        xeroInvoice.setAmountDue( new BigDecimal(newInvoice.getAmount()));
        Calendar due = Calendar.getInstance();
        due.setTime(newInvoice.getDueDate());
        xeroInvoice.setDueDate(due);
        switch (newInvoice.getStatus()) {
          case "Void":  { xeroInvoice.setStatus(InvoiceStatus.VOIDED); break; }
          case "Paid":  { xeroInvoice.setStatus(InvoiceStatus.PAID)  ; break; }
          case "Draft": { xeroInvoice.setStatus(InvoiceStatus.DRAFT) ; break; }
        }
        xeroInvoiceList.add( i, xeroInvoice );
        break;
      }
    } catch (XeroApiException e) {
      if (e.getMessage().contains("token_rejected")) {
        newInvoice.setDesync(true);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return getDelegate().put_(x, newInvoice);
  }
}
