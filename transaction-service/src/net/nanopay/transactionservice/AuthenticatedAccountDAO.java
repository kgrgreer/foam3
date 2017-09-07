package net.nanopay.transactionservice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;

public class AuthenticatedAccountDAO
  extends ProxyDAO
{
  public AuthenticatedAccountDAO(DAO delegate) {
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    //TODO: After demo, restrict properly
    //Right now only allowing accounts to be created from the transaction service
    return null;
  }

  @Override
  public FObject find_(X x, Object id) throws RuntimeException {
    User user = (User) x.get("user");

    if ( user == null || user.getId() != (long) id ) {
      throw new RuntimeException("User is not logged in");
    }

    return super.find_(x, user.getId());
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
    throws RuntimeException
  {
    return null;
  }

  @Override
  public FObject remove(FObject obj) { return null; }

  @Override
  public void removeAll() { return; }

}
