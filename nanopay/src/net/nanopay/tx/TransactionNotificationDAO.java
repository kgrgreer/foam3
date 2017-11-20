package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class TransactionNotificationDAO
    extends ProxyDAO
{
  protected DAO transactionErrorDAO_;

  public TransactionNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  protected DAO getTransactionErrorDAO() {
    if ( transactionErrorDAO_ == null ) {
      transactionErrorDAO_ = (DAO) getX().get("transactionErrorDAO");
    }
    return transactionErrorDAO_;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      return super.put_(x, obj);
    } catch (Throwable t) {
      getTransactionErrorDAO().put(obj);
      throw t;
    }
  }
}