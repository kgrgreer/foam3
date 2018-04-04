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
      add("Request");
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

    Transaction oldTxn = (Transaction) getDelegate().find(obj);

    // don't perform balance transfer if status in blacklist
    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) ) {
      return super.put_(x, obj);
    }

    if ( oldTxn != null ) return super.put_(x, obj);

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

  /** Sorts array of transfers. **/
  FObject lockAndExecute(X x, Transaction txn, Transfer[] ts, int i) {
    // sort to avoid deadlock
    java.util.Arrays.sort(ts);

    return lockAndExecute_(x, txn, ts, i);
  }

  /** Lock each trasnfer's account then execute the transfers. **/
  FObject lockAndExecute_(X x, Transaction txn, Transfer[] ts, int i) {
    if ( i > ts.length-1 ) {
      return  execute(x, txn, ts);
    } else {
      synchronized ( ts[i].getLock() ) {
        return lockAndExecute_(x, txn, ts, i+1);
      }
    }
  }

  /** Called once all locks are locked. **/
  FObject execute(X x, Transaction txn, Transfer[] ts) {
    for ( int i = 0 ; i < ts.length ; i++ ) {
      ts[i].validate(x);
    }

    for ( int i = 0 ; i < ts.length ; i++ ) {
      ts[i].execute(x);
    }

    return getDelegate().put_(x, txn);
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