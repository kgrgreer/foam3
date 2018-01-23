package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class TransactionNotificationDAO
  extends ProxyDAO
{
  protected DAO transactionSuccessDAO_;
  protected DAO transactionErrorDAO_;

  public TransactionNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    transactionSuccessDAO_ = (DAO) getX().get("transactionSuccessDAO");
    transactionErrorDAO_ = (DAO) getX().get("transactionErrorDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      FObject result = super.put_(x, obj);
      transactionSuccessDAO_.put(result);
      return result;
    } catch (Throwable t) {
      transactionErrorDAO_.put(obj);
      throw t;
    }
  }
}