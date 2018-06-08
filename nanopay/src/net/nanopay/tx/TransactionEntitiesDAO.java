package net.nanopay.tx;

import foam.dao.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
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
    Transaction tx =  (Transaction) clone;
    fillPayerInfo(tx, tx.getPayerId());
    fillPayeeInfo(tx, tx.getPayeeId());
    return clone;
  }

  private void fillPayerInfo(Transaction tx, long payerId)
  {
    User payer = (User) userDAO_.find(tx.getPayerId());
    tx.setPayerName(payer.getFirstName());
    tx.setPayerEmail(payer.getEmail());
  }

  private void fillPayeeInfo(Transaction tx, long payerId)
  {
    User payee = (User) userDAO_.find(tx.getPayeeId());
    tx.setPayeeName(payee.getFirstName());
    tx.setPayeeEmail(payee.getEmail());
  }
}
