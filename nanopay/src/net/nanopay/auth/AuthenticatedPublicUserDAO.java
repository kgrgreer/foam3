package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import java.security.AccessControlException;
import net.nanopay.auth.PublicUserInfo;

public class AuthenticatedPublicUserDAO
  extends ProxyDAO
{
  public final static String GLOBAL_PUBLIC_USER_READ   = "publicUserInfo.read.x";
  public final static String GLOBAL_PUBLIC_USER_UPDATE = "publicUserInfo.update.x";
  public final static String GLOBAL_PUBLIC_USER_DELETE = "publicUserInfo.delete.x";

  protected DAO userDAO_;
  protected DAO publicUserDAO_;

  public AuthenticatedPublicUserDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
    publicUserDAO_ = (DAO) x.get("publicUserDAO");
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
    User        user    = (User) x.get("user");
    AuthService auth    = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    // check if current user has permission to delete
    PublicUserInfo toRemove = (PublicUserInfo) obj;
    if ( toRemove != null &&
        ! auth.check(x, GLOBAL_PUBLIC_USER_DELETE) ) {
      throw new AccessControlException("Unable to delete user");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    // check if logged in
    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    if ( ! auth.check(x, GLOBAL_PUBLIC_USER_DELETE) ) {
      // delete all users in system
      throw new AccessControlException("Unable to remove users");
    }

    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
