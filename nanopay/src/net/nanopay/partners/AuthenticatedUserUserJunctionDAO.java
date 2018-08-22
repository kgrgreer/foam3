package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

/**
 * Authenticate userUserJunctionDAO
 *
 * Features:
 *  - only allow access to records where the user id matches the source or
 *    target id of the record
 */
public class AuthenticatedUserUserJunctionDAO
  extends ProxyDAO
{
  public final static String GLOBAL_USER_USER_JUNCTION_READ = "userUserJunction.read.x";
  public final static String GLOBAL_USER_USER_JUNCTION_UPDATE = "userUserJunction.update.x";
  public final static String GLOBAL_USER_USER_JUNCTION_DELETE = "userUserJunction.delete.x";

  public AuthenticatedUserUserJunctionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  private void checkOwnership(X x, FObject obj, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    UserUserJunction entity = (UserUserJunction) obj;

    if ( entity == null ) {
      throw new RuntimeException("Entity is null");
    }

    boolean hasGlobalPermission = auth.check(x, permission);

    boolean ownsObject =
        user.getId() == (long) entity.getSourceId() ||
        user.getId() == (long) entity.getTargetId();

    if ( ! hasGlobalPermission && ! ownsObject) {
      throw new AuthorizationException();
    }
  }

  private DAO getFilteredDAO(X x, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    if ( auth.check(x, permission) ) return getDelegate();
    return getDelegate().where(OR(
      EQ(UserUserJunction.SOURCE_ID, user.getId()),
      EQ(UserUserJunction.TARGET_ID, user.getId())));
  }

  private User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AuthenticationException();
    }
    return user;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    checkOwnership(x, obj, GLOBAL_USER_USER_JUNCTION_UPDATE);
    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject result = super.find_(x, id);
    if ( result != null ) {
      checkOwnership(x, result, GLOBAL_USER_USER_JUNCTION_READ);
    }
    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, GLOBAL_USER_USER_JUNCTION_READ);
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    checkOwnership(x, obj, GLOBAL_USER_USER_JUNCTION_DELETE);
    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, GLOBAL_USER_USER_JUNCTION_DELETE);
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
