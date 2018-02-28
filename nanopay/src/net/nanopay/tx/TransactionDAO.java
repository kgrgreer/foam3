package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import java.util.*;
import java.util.Date;
import java.util.List;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;

public class TransactionDAO
  extends ProxyDAO
{
  // blacklist of status where balance transfer is not performed
  protected final Set<String> STATUS_BLACKLIST =
      Collections.unmodifiableSet(new HashSet<String>() {{
        add("Refunded");
      }});

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
    Transaction     transaction     = (Transaction) obj;

    // executeTransaction(x, transaction);
    // TODO: delete all the rest of the code

    TransactionType transactionType = (TransactionType) transaction.getType();
    long            payeeId         = transaction.getPayeeId();
    long            payerId         = transaction.getPayerId();

    if ( payerId <= 0 ) {
      throw new RuntimeException("Invalid Payer id");
    }

    if ( payeeId <= 0 ) {
      throw new RuntimeException("Invalid Payee id");
    }

    if ( transaction.getTotal() <= 0 ) {
      throw new RuntimeException("Transaction amount must be greater than 0");
    }

    // if bank account verification transaction, continue
    if ( transactionType == TransactionType.VERIFICATION ) {
      return super.put_(x, obj);
    }

    //For cico transactions payer and payee are the same
    if ( payeeId == payerId ) {
      if ( transactionType != TransactionType.CASHOUT && transactionType != TransactionType.CASHIN ) {
        throw new RuntimeException("PayeeID and PayerID cannot be the same");
      }
    }

    // don't perform balance transfer if status in blacklist
    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) ) {
      return super.put_(x, obj);
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

        FObject ret = super.put_(x, obj);

        return ret;
      }
    }
  }

  void executeTransaction(X x, Transaction t) {
    Transfer[] ts = t.createTransfers(x);

    // TODO: disallow or merge duplicate accounts
    validateTransfers(ts);
    lockAndExecute(x, t, ts, 0);
  }

  void validateTransfers(Transfer[] ts)
    throws RuntimeException
  {
    long c = 0, d = 0;
    for ( int i = 0 ; i < ts.length ; i++ ) {
      Transfer t = ts[i];
      if ( t.getAmount() > 0 ) {
        c += t.getAmount();
      } else {
        d += t.getAmount();
      }
    }
    if ( c != -d ) throw new RuntimeException("Debits and credits don't match.");
    if ( c == 0  ) throw new RuntimeException("Zero transfer disallowed.");
  }

  /** Lock each trasnfer's account then execute the transfers. **/
  void lockAndExecute(X x, Transaction txn, Transfer[] ts, int i) {
    // sort to avoid deadlock
    java.util.Arrays.sort(ts);

    lockAndExecute_(x, txn, ts, i);
  }

  void lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {
    if ( i > ts.length ) {
      execute(x, txn, ts);
    } else {
      synchronized ( ts[i].getLock() ) {
        lockAndExecute_(x, txn, ts, i+1);
      }
    }
  }

  /** Called once all locks are locked. **/
  void execute(X x, Transaction txn, Transfer[] ts) {
    for ( int i = 0 ; i < ts.length ; i++ ) {
      ts[i].validate(x);
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      ts[i].execute(x);
    }

    getDelegate().put_(x, txn);
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
