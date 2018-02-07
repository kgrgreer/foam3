package net.nanopay.fx.interac;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import net.nanopay.fx.interac.model.PayoutOptions;

public class AuthenticatedPayoutOptionsDAO
  extends ProxyDAO
{

  public AuthenticatedPayoutOptionsDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public AuthenticatedPayoutOptionsDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if( ! checkAuth(x) )
      throw new RuntimeException("User is not logged in");

    return getDelegate().put_(x,obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    if( ! checkAuth(x) )
      throw new RuntimeException("User is not logged in");

    return getDelegate().remove_(x,obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    if( ! checkAuth(x) )
      throw new RuntimeException("User is not logged in");

    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }

  @Override
  public FObject find_(X x, Object id) throws RuntimeException {
    if( ! checkAuth(x) )
      throw new RuntimeException("User is not logged in");

    PayoutOptions c = (PayoutOptions) getDelegate().find_(x, id);

    return c;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
      throws RuntimeException
  {
    if( ! checkAuth(x) )
      throw new RuntimeException("User is not logged in");

    return getDelegate().select_(x, sink, skip, limit, order, predicate);
  }

  private Boolean checkAuth(X x) {
    User user = (User) x.get("user");

    if ( user == null )
      return false;

    return true;
  }
}
