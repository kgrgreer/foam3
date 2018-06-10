package net.nanopay.tx;

import foam.dao.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionEntity;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class TransactionEntitiesDAO extends ProxyDAO
{
  protected DAO userDAO_;

  private class DecoratedSink extends foam.dao.ProxySink
  {
    public DecoratedSink(X x, Sink delegate)
    {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub)
    {
      obj = fillEntitiesInfo((FObject) obj);
      getDelegate().put(obj, sub);
    }
  }

  public TransactionEntitiesDAO(X x, DAO delegate)
  {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject find_(X x, Object id)
  {
    FObject obj = getDelegate().find_(x, id);
    if( obj != null ) {
      obj = fillEntitiesInfo(obj);
    }
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
  {
      Sink decoratedSink = new DecoratedSink(x, sink);
      getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
      return sink;
  }


  private FObject fillEntitiesInfo(FObject obj)
  {
    FObject clone = obj.fclone();
    Transaction tx = (Transaction) clone;
    User payer = (User) userDAO_.find(tx.getPayerId());
    User payee = (User) userDAO_.find(tx.getPayeeId());
    TransactionEntity payerEnitity = new TransactionEntity(payer);
    TransactionEntity payeeEnitity = new TransactionEntity(payee);
    tx.setPayee(payeeEnitity);
    tx.setPayer(payerEnitity);
    return clone;
  }
}
