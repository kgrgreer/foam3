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
import net.nanopay.fx.interac.model.Corridor;

public class AuthenticatedCorridorDAO
  extends ProxyDAO
{

  public AuthenticatedCorridorDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public AuthenticatedCorridorDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("Cannot put into CorridorDAO");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("Cannot remove from CorridorDAO");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Cannot removeAll from CorridorDAO");
  }

  @Override
  public FObject find_(X x, Object id) throws RuntimeException {
    User user = (User) x.get("user");

    if ( user == null )
      throw new RuntimeException("User is not logged in");

    Corridor c = (Corridor) getDelegate().find_(x, id);

    return c;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate)
      throws RuntimeException
  {
    User user = (User) x.get("user");

    if ( user == null )
      throw new RuntimeException("User is not logged in");

    return getDelegate().select_(x, sink, skip, limit, order, predicate);
  }
}
