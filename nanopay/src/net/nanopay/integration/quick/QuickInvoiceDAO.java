package net.nanopay.integration.quick;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.lib.json.Outputter;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.quick.model.*;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.List;

public class QuickInvoiceDAO
  extends ProxyDAO {
  protected DAO userDAO_;

  public QuickInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localContactDAO");
  }
  public FObject put_(X x, FObject obj) {
    DAO                     accountDAO      = (DAO) x.get("localAccountDAO");
    DAO                     transactionDAO  = (DAO) x.get("localTransactionDAO");
    Invoice                 invoice         = (Invoice) obj;
    QuickIntegrationService quick           = (QuickIntegrationService) x.get("quickSignIn");
    User                    user            = (User) x.get("user");

    if ( ! (invoice instanceof QuickInvoice) ) {
      return getDelegate().put_(x, obj);
    }

    if(! (net.nanopay.invoice.model.InvoiceStatus.PENDING == invoice.getStatus() || net.nanopay.invoice.model.InvoiceStatus.IN_TRANSIT == invoice.getStatus()) ) {
      return getDelegate().put_(x, obj);
    }

    if ( SafetyUtil.isEmpty(invoice.getPaymentId()) ) {
      return getDelegate().put_(x, obj);
    }

    Transaction transaction = (Transaction) transactionDAO.find(invoice.getPaymentId());
    Account account = (Account) accountDAO.find(transaction.getSourceAccount());

    if ( ! (account instanceof BankAccount) ) {
      return getDelegate().put_(x, obj);
    }

    BankAccount bankAccount = (BankAccount) account;
    ResultResponse signedIn = quick.isSignedIn(x);
    if ( ! signedIn.getResult() ) {
      ((QuickInvoice) invoice).setDesync(true);
      return getDelegate().put_(x, obj);
    }
    List<AccountingBankAccount> accountingList = quick.pullBanks(x);
    if ( accountingList.isEmpty() ) {
      throw new RuntimeException("No bank accounts found in Quick");
    }
    int i;
    AccountingBankAccount intBank;
    boolean foundBank = false;

    for ( i = 0; i < accountingList.size(); i++ ) {
      intBank = accountingList.get(i);
      if ( bankAccount.getIntegrationId().equals(intBank.getAccountingId()) ) {
        foundBank = true;
        break;
      }
    }
    if ( ! foundBank ) {
      throw new RuntimeException("No bank accounts synchronised to Quick");
    }

    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = (DAO) x.get("quickConfigDAO");
    DAO store = (DAO) x.get("quickTokenStorageDAO");
    QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());
    QuickConfig config = (QuickConfig) configDAO.find(app.getUrl());
    Logger logger = (Logger) x.get("logger");

    HttpClient httpclient = HttpClients.createDefault();
    HttpPost httpPost;
    Outputter outputter = new Outputter(foam.lib.json.OutputterMode.NETWORK);
    outputter.setOutputClassNames(false);
    QuickContact sUser;
    try {
      if (transaction.getPayerId() == user.getId()) {
        sUser = (QuickContact) userDAO_.find(transaction.getPayeeId());
        QuickLineItem[] lineItem = new QuickLineItem[1];
        QuickLinkTxn[] txnArray = new QuickLinkTxn[1];

        BigDecimal amount = new BigDecimal(transaction.getAmount());
        amount = amount.movePointLeft(2);

        QuickPostPayment payment = new QuickPostPayment();
        QuickQueryNameValue customer = new QuickQueryNameValue();

        customer.setName(sUser.getOrganization());
        customer.setValue("" + sUser.getQuickId());

        QuickLinkTxn txn = new QuickLinkTxn();
        txn.setTxnId(((QuickInvoice) invoice).getQuickId());
        txn.setTxnType("Invoice");
        txnArray[0] = txn;

        QuickLineItem item = new QuickLineItem();
        item.setAmount(amount.doubleValue());
        item.setLinkedTxn(txnArray);
        lineItem[0] = item;

        payment.setCustomerRef(customer);
        payment.setLine(lineItem);
        payment.setTotalAmt(amount.doubleValue());
        httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + tokenStorage.getRealmId() + "/payment");
        httpPost.setHeader("Authorization", "Bearer " + tokenStorage.getAccessToken());
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setHeader("Api-Version", "alpha");
        httpPost.setHeader("Accept", "application/json");
        String body = outputter.stringify(payment);
        httpPost.setEntity(new StringEntity(body));
        System.out.println(body);
      } else {

        sUser = (QuickContact) userDAO_.find(transaction.getPayerId());
        QuickLineItem[] lineItem = new QuickLineItem[1];
        QuickLinkTxn[] txnArray = new QuickLinkTxn[1];

        BigDecimal amount = new BigDecimal(transaction.getAmount());
        amount = amount.movePointLeft(2);

        QuickPostBillPayment payment = new QuickPostBillPayment();
        QuickPayment cPayment = new QuickPayment();
        //Get Account Data from QuickBooks

        QuickQueryNameValue customer = new QuickQueryNameValue();
        customer.setName(sUser.getOrganization());
        customer.setValue("" + sUser.getQuickId());

        QuickLinkTxn txn = new QuickLinkTxn();
        txn.setTxnId(((QuickInvoice) invoice).getQuickId());
        txn.setTxnType("Bill");

        txnArray[0] = txn;
        QuickLineItem item = new QuickLineItem();
        item.setAmount(amount.doubleValue());
        item.setLinkedTxn(txnArray);
        lineItem[0] = item;

        payment.setVendorRef(customer);
        payment.setLine(lineItem);
        payment.setTotalAmt(amount.doubleValue());
        payment.setPayType("Check");
        QuickQueryNameValue bInfo = new QuickQueryNameValue();

        bInfo.setName(accountingList.get(i).getName());
        bInfo.setValue(""+accountingList.get(i).getId());

        cPayment.setBankAccountRef(bInfo);
        payment.setCheckPayment(cPayment);
        httpPost = new HttpPost(config.getIntuitAccountingAPIHost() + "/v3/company/" + tokenStorage.getRealmId() + "/billpayment");
        httpPost.setHeader("Authorization", "Bearer " + tokenStorage.getAccessToken());
        httpPost.setHeader("Content-Type", "application/json");
        httpPost.setHeader("Api-Version", "alpha");
        httpPost.setHeader("Accept", "application/json");
        String body = outputter.stringify(payment);
        httpPost.setEntity(new StringEntity(body));
        System.out.println(body);
      }
      try {
        HttpResponse response = httpclient.execute(httpPost);
        BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
        String str = rd.readLine();
        System.out.println(str);
      } catch (Exception e) {
        e.printStackTrace();
        logger.error(e.getMessage());
        ((QuickInvoice) invoice).setDesync(true);
      }

    }catch (Exception e){
      e.printStackTrace();
      logger.error(e.getMessage());
      ((QuickInvoice) invoice).setDesync(true);
    }
    return getDelegate().put_(x, obj);
  }
}
