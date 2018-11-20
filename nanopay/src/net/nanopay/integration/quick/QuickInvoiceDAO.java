package net.nanopay.integration.quick;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import net.nanopay.integration.quick.model.*;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;


public class QuickInvoiceDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public QuickInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("bareUserDAO");
  }


  @Override
  public FObject put_(X x, FObject obj) {

    Transaction transaction =(Transaction) obj;
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    System.out.println( invoiceDAO.find(transaction.getInvoiceId()).getClassInfo().toString());
    FObject invoice = invoiceDAO.find(transaction.getInvoiceId());
    if ( ! (invoice instanceof QuickInvoice) ) {
      return getDelegate().put_(x, obj);
    }

    QuickInvoice newInvoice = (QuickInvoice) invoice;
    QuickInvoice oldInvoice = (QuickInvoice) invoice;

    // If there wasn't an entry before then there is nothing to update for quick
    if (oldInvoice == null) {
      newInvoice.setQuickUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If being called from quick update. Skip calling quick
    if (newInvoice.getQuickUpdate()) {
      newInvoice.setQuickUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If the system is coming from being synced then don't try syncing it again
    if (oldInvoice.getDesync() != newInvoice.getDesync()) {
      return getDelegate().put_(x, obj);
    }
    if (!(net.nanopay.invoice.model.InvoiceStatus.PAID == newInvoice.getStatus())) {
      return getDelegate().put_(x, obj);
    }

    QuickConfig config = (QuickConfig) x.get("quickConfig");
    User user = (User) x.get("user");
    DAO store = (DAO) x.get("quickTokenStorageDAO");
    QuickTokenStorage ts = (QuickTokenStorage) store.find(user.getId());
    HttpClient httpclient = HttpClients.createDefault();
    HttpPost httpPost;
    Outputter outputter = new Outputter(foam.lib.json.OutputterMode.NETWORK);
    outputter.setOutputClassNames(false);
    QuickContact sUser;
    //TODO: add new invoice flow
    return getDelegate().put_(x, obj);

  }
}
