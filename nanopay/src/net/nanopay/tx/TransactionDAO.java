package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

import java.text.NumberFormat;
import java.util.*;

import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

public class TransactionDAO
    extends ProxyDAO
{
  // blacklist of status where balance transfer is not performed
  protected final Set<TransactionStatus> STATUS_BLACKLIST =
      Collections.unmodifiableSet(new HashSet<TransactionStatus>() {{
        add(TransactionStatus.REFUNDED);
        add(TransactionStatus.PENDING);
      }});

  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO invoiceDAO_;
  protected DAO bankAccountDAO_;

  public TransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public TransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
  }

  protected DAO getInvoiceDAO() {
    if ( invoiceDAO_ == null ) {
      invoiceDAO_ = (DAO) getX().get("invoiceDAO");
    }
    return invoiceDAO_;
  }

  protected DAO getAccountDAO() {
    if ( accountDAO_ == null ) {
      accountDAO_ = (DAO) getX().get("localAccountDAO");
    }

    return accountDAO_;
  }

  protected DAO getBankAccountDAO() {
    if ( bankAccountDAO_ == null ) {
      bankAccountDAO_ = (DAO) getX().get("localBankAccountDAO");
    }

    return bankAccountDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    ArraySink transactions = new ArraySink();
    Transaction oldTxn = (Transaction) getDelegate().find(obj);

    // don't perform balance transfer if status in blacklist
    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) && transaction.getType() != TransactionType.NONE &&
        transaction.getType() != TransactionType.CASHOUT ) {
      return super.put_(x, obj);
    }

    if ( transaction.getType().equals(TransactionType.CASHIN) || transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
      if ( oldTxn.getStatus().equals(TransactionStatus.COMPLETED)
          && transaction.getStatus().equals(TransactionStatus.DECLINED) ) {
        //pay others by bank account directly
        if ( transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
          paymentFromBankAccountReject(x, transaction);
        } else {
          cashinReject(x, transaction);
        }
      }
    }
    if ( transaction.getType().equals(TransactionType.CASHIN) || transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
      return transaction.getStatus().equals(TransactionStatus.COMPLETED) ?
          executeTransaction(x, transaction) :
          super.put_(x, obj);
    }

    if ( transaction.getType().equals(TransactionType.CASHOUT) ) {
      if ( ! transaction.getStatus().equals(TransactionStatus.DECLINED) ) {
        if ( oldTxn != null ) return super.put_(x, obj);
      } else {
        if ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED ) {
          Transfer refound = new Transfer(transaction.getPayerId(), transaction.getTotal());
          refound.validate(x);
          refound.execute(x);
        }
        return super.put_(x, obj);
      }

    }
    return executeTransaction(x, transaction);
  }

  FObject executeTransaction(X x, Transaction t) {
    Transfer[] ts = t.createTransfers(x);

    // TODO: disallow or merge duplicate accounts
    if ( ts.length != 1 ) {
      validateTransfers(ts);
    }
    return lockAndExecute(x, t, ts, 0);
  }

  void validateTransfers(Transfer[] ts)
      throws RuntimeException
  {
    if ( ts.length == 0 ) return;

    long c = 0, d = 0;
    for ( int i = 0; i < ts.length; i++ ) {
      Transfer t = ts[i];
      if ( t.getAmount() > 0 ) {
        c += t.getAmount();
      } else {
        d += t.getAmount();
      }
    }

    if ( c != - d ) throw new RuntimeException("Debits and credits don't match.");
    if ( c == 0 ) throw new RuntimeException("Zero transfer disallowed.");
  }

  /** Sorts array of transfers. **/
  FObject lockAndExecute(X x, Transaction txn, Transfer[] ts, int i) {
    // sort to avoid deadlock
    java.util.Arrays.sort(ts);

    return lockAndExecute_(x, txn, ts, i);
  }

  /** Lock each trasnfer's account then execute the transfers. **/
  FObject lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {
    if ( i > ts.length - 1 ) return execute(x, txn, ts);

    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, ts, i + 1);
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    for ( int i = 0; i < ts.length; i++ ) {
      ts[i].validate(x);
    }

    for ( int i = 0; i < ts.length; i++ ) {
      ts[i].execute(x);
    }

    if ( txn.getType().equals(TransactionType.NONE) || txn.getType().equals(TransactionType.CASHOUT) )
      txn.setStatus(TransactionStatus.COMPLETED);

    return getDelegate().put_(x, txn);
  }

  public void sendCashInRejectEmail(X x, String emailAddress, User user, Transaction
      transaction) {
    EmailService emailService = (EmailService) x.get("email");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();

    // Loads variables that will be represented in the email received
    args.put("amount", formatter.format(transaction.getAmount() / 100.00));
    args.put("name", user.getFirstName());
    args.put("account", ( (BankAccount) getBankAccountDAO().find(transaction.getBankAccountId()) ).getAccountNumber());

    message.setTo(new String[]{emailAddress});
    try {
      emailService.sendEmailFromTemplate(user, message, "cashin-reject", args);
    } catch ( Throwable t ) {
      ( (Logger) x.get(Logger.class) ).error("Error sending invoice paid email.", t);
    }
  }

  public void sendPaymentRejectEmail(X x, String emailAddress, User user, Transaction
      transaction) {
    EmailService emailService = (EmailService) x.get("email");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    EmailMessage message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();

    // Loads variables that will be represented in the email received
    args.put("amount", formatter.format(transaction.getAmount() / 100.00));
    args.put("name", user.getFirstName());
    args.put("account", ( (BankAccount) getBankAccountDAO().find(transaction.getBankAccountId()) ).getAccountNumber());
    args.put("payerName", ( (User) getUserDAO().find(transaction.getPayerId()) ).getFirstName());
    args.put("payeeName", ( (User) getUserDAO().find(transaction.getPayeeId()) ).getFirstName());

    message.setTo(new String[]{emailAddress});
    try {
      emailService.sendEmailFromTemplate(user, message, "pay-from-bankaccount-reject", args);
    } catch ( Throwable t ) {
      ( (Logger) x.get(Logger.class) ).error("Error sending invoice paid email.", t);
    }
  }

  public void cashinReject(X x, Transaction transaction) {
    Account payerAccount = (Account) getAccountDAO().find(transaction.getPayerId());
    payerAccount.setBalance(payerAccount.getBalance() > transaction.getTotal() ? payerAccount.getBalance() -
        transaction.getTotal() : 0);
    getAccountDAO().put_(x, payerAccount.fclone());
    User user = (User) getUserDAO().find(transaction.getPayerId());
    sendCashInRejectEmail(x, user.getEmail(), user, transaction);
  }

  public void paymentFromBankAccountReject(X x, Transaction transaction) {
    Account payerAccount = (Account) getAccountDAO().find(transaction.getPayeeId());
    payerAccount.setBalance(payerAccount.getBalance() > transaction.getTotal() ? payerAccount.getBalance() -
        transaction.getTotal() : 0);
    getAccountDAO().put_(x, payerAccount.fclone());
    // if it's a transaction for different user, we need notify both
    User payer = (User) getUserDAO().find(transaction.getPayerId());
    User payee = (User) getUserDAO().find(transaction.getPayeeId());
    sendPaymentRejectEmail(x, payer.getEmail(), payer, transaction);
    sendPaymentRejectEmail(x, payee.getEmail(), payee, transaction);
  }


  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return super.find_(x, o);
  }
}
