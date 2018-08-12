package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;

public class TransactionAmountCheckDAO
    extends ProxyDAO
{
  protected long amount_;

  public TransactionAmountCheckDAO(X x, DAO delegate) {
    this(x, delegate, 7500000);
  }

  public TransactionAmountCheckDAO(X x, DAO delegate, long amount) {
    setX(x);
    setDelegate(delegate);
    amount_ = amount;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction t = (Transaction) obj;

    if ( t.getAmount() < 0) {
      throw new RuntimeException("Amount cannot be negative");
    }

    if ( t.getAmount() == 0 ) {
      throw new RuntimeException("Zero transfer disallowed.");
    }

    if ( t.getTotal() > amount_ ) {
      throw new RuntimeException("Transaction limit exceeded. ");
    }
    Long balance = (Long) t.findSourceAccount(x).findBalance(x);
    if ( ! (t instanceof CompositeTransaction) && t.getType() == TransactionType.CASHOUT && t.getAmount() > balance || t.getType() == TransactionType.NONE && t.getAmount() > balance ) {
      throw new RuntimeException("Insufficient balance in account " + t.getSourceAccount());
    }
    return super.put_(x, obj);
  }
}
