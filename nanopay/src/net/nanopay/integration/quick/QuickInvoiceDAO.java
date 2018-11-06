package net.nanopay.integration.quick;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import net.nanopay.integration.quick.model.*;
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

    if ( ! (obj instanceof QuickInvoice) ) {
      return getDelegate().put_(x, obj);
    }

    DAO         invoiceDAO = (DAO) x.get("invoiceDAO");
    QuickInvoice newInvoice = (QuickInvoice) obj;
    QuickInvoice oldInvoice = (QuickInvoice) invoiceDAO.find(newInvoice.getId());

    // If there wasn't an entry before then there is nothing to update for quick
    if ( oldInvoice == null ) {
      newInvoice.setQuickUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If being called from quick update. Skip calling quick
    if ( newInvoice.getQuickUpdate() ) {
      newInvoice.setQuickUpdate(false);
      return getDelegate().put_(x, obj);
    }

    // If the system is coming from being synced then don't try syncing it again
    if ( oldInvoice.getDesync() != newInvoice.getDesync() ) {
      return getDelegate().put_(x, obj);
    }
    if( ! (net.nanopay.invoice.model.InvoiceStatus.PAID == newInvoice.getStatus()) ) {
      return getDelegate().put_(x, obj);
    }
    QuickConfig       config       = (QuickConfig) x.get("quickConfig");
    User              user         = (User) x.get("user");
    DAO               store        = (DAO) x.get("quickTokenStorageDAO");
    QuickTokenStorage ts           = (QuickTokenStorage) store.find(user.getId());
    HttpClient httpclient = HttpClients.createDefault();
    HttpPost httpPost;
    Outputter outputter = new Outputter(foam.lib.json.OutputterMode.NETWORK);
    outputter.setOutputClassNames(false);
    QuickContact sUser;
    try {
//      if (newInvoice.getPayerId() == user.getId()) {
        sUser =(QuickContact) userDAO_.find(newInvoice.getPayeeId());
        QuickLineItem[] lineItem = new QuickLineItem[1];
        QuickLinkTxn[] txnArray = new QuickLinkTxn[1];
        BigDecimal amount = new BigDecimal(newInvoice.getAmount());
        amount = amount.movePointLeft(2);

        QuickPostPayment payment = new QuickPostPayment();

        QuickQueryNameValue customer = new QuickQueryNameValue();
        customer.setName(sUser.getBusinessName());
        customer.setValue(""+sUser.getQuickId());

        QuickLinkTxn txn =  new QuickLinkTxn();
        txn.setTxnId(newInvoice.getQuickId());
        txn.setTxnType("Invoice");
        txnArray[0] = txn;

        QuickLineItem item = new QuickLineItem();
        item.setAmount(amount.doubleValue());
        item.setLinkedTxn(txnArray);
        lineItem[0] = item;

        payment.setCustomerRef(customer);
        payment.setLine(lineItem);
        payment.setTotalAmt(amount.doubleValue());

        httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/payment" );
        httpPost.setHeader("Authorization", "Bearer " + ts.getAccessToken());
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setHeader("Api-Version", "alpha");
        httpPost.setHeader("Accept", "application/json");
        String body = outputter.stringify(payment);
        httpPost.setEntity(new StringEntity(body));
        System.out.println(body);

//      }
//      else {
//        sUser =(QuickContact) userDAO_.find(newInvoice.getPayerId());
//
//        QuickLineItem[] lineItem = new QuickLineItem[1];
//        QuickLinkTxn[] txnArray = new QuickLinkTxn[1];
//        BigDecimal amount = new BigDecimal(newInvoice.getAmount());
//        amount.movePointLeft(2);
//
//        QuickPostBillPayment payment = new QuickPostBillPayment();
//
//        QuickPayment cPayment = new QuickPayment();
//
//        //Get Account Data from QuickBooks
//        QuickQueryNameValue check = new QuickQueryNameValue();
//        check.setName("Check");
//        check.setValue(""+sUser.getQuickId());
//
//        cPayment.setBankAccountRef();
//        payment.setCheckPayment(cPayment);
//
//
//        QuickQueryNameValue customer = new QuickQueryNameValue();
//        customer.setName(sUser.getBusinessName());
//        customer.setValue(""+sUser.getQuickId());
//
//        QuickLinkTxn txn =  new QuickLinkTxn();
//        txn.setTxnId(newInvoice.getQuickId());
//        txn.setTxnType("Bill");
//        txnArray[0] = txn;
//
//        QuickLineItem item = new QuickLineItem();
//        item.setAmount(amount.doubleValue());
//        item.setLinkedTxn(txnArray);
//        lineItem[0] = item;
//
//        payment.setVendorRef(customer);
//        payment.setLine(lineItem);
//        payment.setTotalAmt(amount.doubleValue());
//        httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + ts.getRealmId() + "/billpayment" );
//        httpPost.setHeader("Authorization", "Bearer " + ts.getAccessToken());
//        httpPost.setHeader("Content-Type", "application/json");
//        httpPost.setHeader("Api-Version", "alpha");
//        httpPost.setHeader("Accept", "application/json");
//
//        System.out.println(outputter.stringify(user));
//      }

      try {
        HttpResponse response = httpclient.execute(httpPost);
        BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
        String str = rd.readLine();
        System.out.println(str);
      } catch (Exception e) {
        e.printStackTrace();
        return null;
      }
      return getDelegate().put_(x, obj);
    } catch(Exception e) {
      return getDelegate().put_(x, obj);

    }
  }
}
