package net.nanopay.integration.xero;

import com.xero.api.XeroClient;
import com.xero.model.InvoiceStatus;
import com.xero.model.Payment;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.xero.model.XeroInvoice;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Currency;
import net.nanopay.tx.model.Transaction;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/*
* Decorater to determine if a Xero invoice is sent back to Xero
* Checks if invoice, bank and payee/payer have valid Xero information and sends the data back.
* If user is not signed into integration platform will set a flag on the invoice and it will reattempt on resynchronising
*/
public class XeroInvoiceDAO
  extends ProxyDAO {

  public XeroInvoiceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  public FObject put_(X x, FObject obj) {

    DAO                    accountDAO      = ((DAO) x.get("localAccountDAO")).inX(x);
    DAO                    transactionDAO  = ((DAO) x.get("localTransactionDAO")).inX(x);
    Invoice                invoice         = (Invoice) obj;
    Invoice                oldInvoice      = (Invoice) getDelegate().find_(x, invoice.getId());
    XeroIntegrationService xero            = (XeroIntegrationService) x.get("xeroSignIn");
    User                   user            = (User) x.get("user");

    if ( ! (invoice instanceof XeroInvoice) ) {
      return getDelegate().put_(x, obj);
    }

    if ( net.nanopay.invoice.model.InvoiceStatus.PENDING != invoice.getStatus() && net.nanopay.invoice.model.InvoiceStatus.IN_TRANSIT != invoice.getStatus() ) {
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

    // Checks if invoice is already paid in both places
    // and is attempting to set synchronise back to false
    if ( oldInvoice != null ) {
      if ( ((XeroInvoice) oldInvoice).getDesync() && ! ((XeroInvoice) invoice).getDesync() ) {
        return getDelegate().put_(x, obj);
      }
    }

    // Checks if bank account is synchronised with one in accounting platform
    BankAccount bankAccount = (BankAccount) account;
    ResultResponse signedIn = xero.isSignedIn(x);
    if ( ! signedIn.getResult() ) {
      ((XeroInvoice) invoice).setDesync(true);
      return getDelegate().put_(x, obj);
    }
    List<AccountingBankAccount> accountingList = xero.pullBanks(x);
    if ( accountingList.isEmpty() ) {
      throw new RuntimeException("No bank accounts found in Xero");
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
      throw new RuntimeException("No bank accounts synchronised to Xero");
    }

    Group               group        = user.findGroup(x);
    AppConfig           app          = group.getAppConfig(x);
    DAO                 configDAO    = ((DAO) x.get("xeroConfigDAO")).inX(x);
    DAO                 store        = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    XeroTokenStorage    tokenStorage = (XeroTokenStorage) store.find(user.getId());
    XeroConfig          config       = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient          client       = new XeroClient(config);
    Logger              logger       = (Logger) x.get("logger");
    DAO                 currencyDAO  = ((DAO) x.get("currencyDAO")).inX(x);
    client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
    try {
      if ( ((XeroInvoice) invoice).getComplete() || ((XeroInvoice) oldInvoice).getComplete() ) {
        return getDelegate().put_(x, obj);
      }
      com.xero.model.Account           xeroAccount     = client.getAccount(bankAccount.getIntegrationId());
      com.xero.model.Invoice           xeroInvoice     = client.getInvoice(((XeroInvoice) invoice).getXeroId());
      List<com.xero.model.Invoice>     xeroInvoiceList = new ArrayList<>();

      // Checks to see if the xero invoice was set to Authorized before; if not sets it to authorized
      if ( ! (InvoiceStatus.AUTHORISED == xeroInvoice.getStatus()) ) {
        xeroInvoice.setStatus(InvoiceStatus.AUTHORISED);
        xeroInvoiceList.add(xeroInvoice);
        client.updateInvoice(xeroInvoiceList);
      }

      // Creates a payment for the full amount for the invoice and sets it paid to the bank account on Xero
      Payment payment = new Payment();
      payment.setInvoice(xeroInvoice);
      payment.setAccount(xeroAccount);
      Calendar cal = Calendar.getInstance();
      cal.setTime(new Date());
      payment.setDate(cal);

      Currency currency = (Currency) currencyDAO.find(account.getDenomination());
      payment.setAmount(BigDecimal.valueOf(transaction.getAmount()).movePointLeft(currency.getPrecision()));
      List<Payment> paymentList = new ArrayList<>();
      paymentList.add(payment);
      client.createPayments(paymentList);
      ((XeroInvoice) invoice).setComplete(true);

      return getDelegate().put_(x, obj);
    } catch ( Throwable e ) {
      e.printStackTrace();
      logger.error(e);
      logger.error(e.getMessage());
      ((XeroInvoice) invoice).setDesync(true);
    }

    // If the put fails or an issue arises lets the invoice process continue
    return getDelegate().put_(x, obj);
  }
}
