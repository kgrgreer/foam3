package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class AuthenticatedTransactionDAO
    extends ProxyDAO
{
  public AuthenticatedTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }
  public AuthenticatedTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    User user               = (User) x.get("user");
    Transaction transaction = (Transaction) obj;

    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    if ( transaction.getPayerId() != user.getId() ) {
      throw new RuntimeException("User is not allowed");
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
      throws RuntimeException
  {
    User user = (User) x.get("user");

    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    return getDelegate()
        .where(
            MLang.OR(
                MLang.EQ(Transaction.PAYER_ID, user.getId()),
                MLang.EQ(Transaction.PAYEE_ID, user.getId())
            )
        ).select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove(FObject obj) { return null; }

  @Override
  public void removeAll() { return; }
}
