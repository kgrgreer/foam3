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
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;

/**
 * RejectTransactionNotificationDAO used to sent email to users when transactions are rejected by EFT
 * services
 */

public class RejectTransactionNotificationDAO
    extends ProxyDAO {
  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO invoiceDAO_;
  protected DAO bankAccountDAO_;

  public RejectTransactionNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getUserDAO() {
    if ( userDAO_ == null ) {
      userDAO_ = (DAO) getX().get("localUserDAO");
    }
    return userDAO_;
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
    Transaction oldTxn = (Transaction) getDelegate().find(obj);
    FObject ret = super.put_(x, obj);
    if ( transaction.getType().equals(TransactionType.CASHIN) && oldTxn != null ) {
      if ( oldTxn.getStatus().equals(TransactionStatus.COMPLETED)
          && transaction.getStatus().equals(TransactionStatus.DECLINED) ) {
        User payer = (User) getUserDAO().find(transaction.getPayerId());
        sendCashInRejectEmail(x, payer.getEmail(), payer, transaction);
      }
    }
    if ( transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT && oldTxn != null ) {
      if ( oldTxn.getStatus().equals(TransactionStatus.COMPLETED)
          && transaction.getStatus().equals(TransactionStatus.DECLINED) ) {
        //pay others by bank account directly
        User payer = (User) getUserDAO().find(transaction.getPayerId());
        User payee = (User) getUserDAO().find(transaction.getPayeeId());
        sendPaymentRejectEmail(x, payer.getEmail(), payer, transaction);
        sendPaymentRejectEmail(x, payee.getEmail(), payee, transaction);
      }
    }
    return ret;
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

}
