package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.dao.ReadOnlyDAO;

public class AuthenticatedPublicUserDAO
  extends ProxyDAO
{
  public AuthenticatedPublicUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("Unsupported operation: put_");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("Unsupported operation: remove_");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("Unsupported operation: removeAll_");
  }
}
