package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import java.util.Date;
import net.nanopay.tx.model.Transaction;

/** Set the creation date for Transactions. **/
// TODO: make Transaction implement an interface like CreatedAware and
// then make this decorator generic.
public class SetDateTransactionDAO
    extends ProxyDAO
{
  public SetDateTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction txn = (Transaction) obj;
    Transaction oldTxn = (Transaction) getDelegate().find(obj);
    if ( oldTxn == null )
      txn.setDate(new Date());
    txn.setLatestDate(new Date());
    return super.put_(x, obj);
  }
}
