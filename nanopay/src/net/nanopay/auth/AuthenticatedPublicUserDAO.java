package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;

public class AuthenticatedPublicUserDAO
  extends ProxyDAO
{
  public final static String GLOBAL_PUBLIC_USER_UPDATE = "publicUserInfo.update.x";

  public AuthenticatedPublicUserDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    PublicUserInfo toPut = (PublicUserInfo) obj;
    if ( toPut != null && ! auth.check(x, GLOBAL_PUBLIC_USER_UPDATE) ) {
      throw new RuntimeException("Unable to update user");
    }

    return super.put_(x, toPut);
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
