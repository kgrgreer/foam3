package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.tx.model.Transaction;

public class TransactionAmountCheckDAO
    extends ProxyDAO
{
  protected long amount_;

  public TransactionAmountCheckDAO(X x, DAO delegate) {
    this(x, delegate, 5000000);
  }

  public TransactionAmountCheckDAO(X x, DAO delegate, long amount) {
    setX(x);
    setDelegate(delegate);
    amount_ = amount;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction t = (Transaction) obj;
    if ( t.getTotal() > amount_ ) {
      throw new RuntimeException("Transaction limit exceeded. ");
    }
    return super.put_(x, obj);
  }
}