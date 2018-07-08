package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

import java.util.*;

import foam.nanos.auth.User;
import net.nanopay.account.CurrentBalance;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.account.Balance;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

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
  protected DAO balanceDAO_;

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

  protected DAO getBalanceDAO() {
    if (balanceDAO_ == null ) {
      balanceDAO_ = (DAO) getX().get("localBalanceDAO");
    }

    return balanceDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction  = (Transaction) obj;
    Transaction oldTxn       = (Transaction) getDelegate().find(obj);

    // don't perform balance transfer if status in blacklist
    if ( STATUS_BLACKLIST.contains(transaction.getStatus()) && transaction.getType() != TransactionType.NONE &&
        transaction.getType() != TransactionType.CASHOUT ) {
      return super.put_(x, obj);
    }

    if ( transaction.getType().equals(TransactionType.CASHIN) || transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
      if ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED
        && transaction.getStatus() == TransactionStatus.DECLINED ) {
        //pay others by bank account directly
        if ( transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
          paymentFromBankAccountReject(x, transaction);
        } else {
          cashinReject(x, transaction);
        }
      }
    }
    if ( transaction.getType() == TransactionType.CASHIN || transaction.getType() == TransactionType.BANK_ACCOUNT_PAYMENT ) {
      return transaction.getStatus() == TransactionStatus.COMPLETED ?
        executeTransaction(x, transaction) :
        super.put_(x, obj);
    }

    if ( transaction.getType() == TransactionType.CASHOUT ) {
      if ( transaction.getStatus() != TransactionStatus.DECLINED ) {
        if ( oldTxn != null ) return super.put_(x, obj);
      } else {
        if ( oldTxn != null && oldTxn.getStatus() != TransactionStatus.DECLINED ) {
          Transfer refound = new Transfer(transaction.getPayerId(), transaction.getTotal(), transaction.getCurrencyCode());
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
    if ( i > ts.length - 1 ) return execute(x, txn, ts);

    synchronized ( ts[i].getLock() ) {
      return lockAndExecute_(x, txn, ts, i + 1);
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

    if ( txn.getType().equals(TransactionType.NONE) ) txn.setStatus(TransactionStatus.COMPLETED);

    return getDelegate().put_(x, txn);
  }


  public void cashinReject(X x, Transaction transaction) {
    Balance payerBalance = (Balance) getBalanceDAO().find((AND(EQ(Balance.ACCOUNT_ID, transaction.getPayerId()), EQ(Balance.CURRENCY_CODE, transaction.getCurrencyCode()))));
        payerBalance.setBalance(payerBalance.getBalance() > transaction.getTotal() ? payerBalance.getBalance() -
      transaction.getTotal() : 0);
    getBalanceDAO().put(payerBalance);
  }

  public void paymentFromBankAccountReject(X x, Transaction transaction) {
    Balance payeeBalance = (Balance) getBalanceDAO().find((AND(EQ(Balance.ACCOUNT_ID, transaction.getPayeeId()), EQ(Balance.CURRENCY_CODE, transaction.getCurrencyCode()))));
        payeeBalance.setBalance(payeeBalance.getBalance() > transaction.getTotal() ? payeeBalance.getBalance() -
      transaction.getTotal() : 0);
    getBalanceDAO().put(payeeBalance);
    // if it's a transaction for different user, we need notify both
    User payer = (User) getUserDAO().find(transaction.getPayerId());
    User payee = (User) getUserDAO().find(transaction.getPayeeId());
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
