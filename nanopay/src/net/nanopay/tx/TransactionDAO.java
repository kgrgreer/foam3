package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import java.util.Date;
import java.util.List;
import net.nanopay.model.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import static foam.mlang.MLang.*;

public class TransactionDAO
    extends ProxyDAO
{
  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO invoiceDAO_;

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

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction         = (Transaction) obj;
    TransactionType transactionType = (TransactionType) transaction.getType();
    transaction.setDate(new Date());

    long payeeId = transaction.getPayeeId();
    long payerId = transaction.getPayerId();

    if ( payerId <= 0 ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( payeeId <= 0 ) {
      throw new RuntimeException("Invalid Payee id");
    }

    //For cico transactions payer and payee are the same
    if ( payeeId == payerId ) {
      if ( transactionType != TransactionType.CASHOUT && transactionType != TransactionType.CASHIN ) {
        throw new RuntimeException("PayeeID and PayerID cannot be the same");
      }
    }

    if ( transaction.getTotal() <= 0 ) {
      throw new RuntimeException("Transaction amount must be greater than 0");
    }

    Long firstLock  = payerId < payeeId ? transaction.getPayerId() : transaction.getPayeeId();
    Long secondLock = payerId > payeeId ? transaction.getPayerId() : transaction.getPayeeId();

    synchronized (firstLock) {
      synchronized (secondLock) {
        Sink sink;
        List data;
        Account payeeAccount;
        Account payerAccount;
        User payee = (User) getUserDAO().find(transaction.getPayeeId());
        User payer = (User) getUserDAO().find(transaction.getPayerId());

        if ( payee == null || payer == null ) {
          throw new RuntimeException("Users not found");
        }
        // find payee account
        payeeAccount = (Account) getAccountDAO().find(payee.getId());
        if ( payeeAccount == null ) {
          throw new RuntimeException("Payee account not found");
        }
        // find payer account
        payerAccount = (Account) getAccountDAO().find(payer.getId());
        if ( payerAccount == null ) {
          throw new RuntimeException("Payer account not found");
        }

        // check if payer account has enough balance
        long total = transaction.getTotal();
        // cashin does not require balance checks
        if ( payerAccount.getBalance() < total ) {
          if ( transactionType != TransactionType.CASHIN ) {
            throw new RuntimeException("Insufficient balance to complete transaction.");
          }
        }

        //For cash in, just increment balance, payer and payee will be the same
        if ( transactionType == TransactionType.CASHIN ) {
          payerAccount.setBalance(payerAccount.getBalance() + total);
          getAccountDAO().put(payerAccount);
        }
        //For cash out, decrement balance, payer and payee will be the same
        else if ( transactionType == TransactionType.CASHOUT ) {
          payerAccount.setBalance(payerAccount.getBalance() - total);
          getAccountDAO().put(payerAccount);
        }
        else {
          payerAccount.setBalance(payerAccount.getBalance() - total);
          payeeAccount.setBalance(payeeAccount.getBalance() + total);
          getAccountDAO().put(payerAccount);
          getAccountDAO().put(payeeAccount);
        }

        // find invoice
        if ( transaction.getInvoiceId() != 0 ) {
          Invoice invoice = (Invoice) getInvoiceDAO().find(transaction.getInvoiceId());
          if ( invoice == null ) {
            throw new RuntimeException("Invoice not found");
          }

          invoice.setPaymentId(transaction.getId());
          invoice.setPaymentDate(transaction.getDate());
          invoice.setPaymentMethod(PaymentStatus.CHEQUE);
          getInvoiceDAO().put(invoice);
        }

        return super.put_(x, obj);
      }
    }
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
