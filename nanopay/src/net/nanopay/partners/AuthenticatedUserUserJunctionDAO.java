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
 * Authenticate any junction DAO created by a relationship between two users.
 *
 * Features:
 *  - only allow access to records where the user id matches the source or
 *    target id of the record
 */
public class AuthenticatedUserUserJunctionDAO
  extends ProxyDAO
{
  private String createPermission_;
  private String updatePermission_;
  private String removePermission_;
  private String readPermission_;
  private String deletePermission_;

  public AuthenticatedUserUserJunctionDAO(X x, String name, DAO delegate) {
    super(x, delegate);
    createPermission_ = name + ".create.*";
    updatePermission_ = name + ".update.*";
    removePermission_ = name + ".remove.*";
    readPermission_ = name + ".read.*";
    deletePermission_ = name + ".delete.*";
  }

  private void checkOwnership(X x, FObject obj, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    UserUserJunction entity = (UserUserJunction) obj;

    if ( entity == null ) {
      throw new RuntimeException("Entity is null");
    }

    boolean hasPermission = auth.check(x, permission);

    boolean ownsObject =
        user.getId() == (long) entity.getSourceId() ||
        user.getId() == (long) entity.getTargetId();

    if ( ! hasPermission && ! ownsObject) {
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
    Object id = obj.getProperty("id");
    if ( id == null || getDelegate().find_(x, id) == null ) {
      checkOwnership(x, obj, createPermission_);
    } else {
      checkOwnership(x, obj, updatePermission_);
    }
    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject result = super.find_(x, id);
    if ( result != null ) {
      checkOwnership(x, result, readPermission_);
    }
    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, readPermission_);
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    checkOwnership(x, obj, removePermission_);
    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    DAO dao = getFilteredDAO(x, deletePermission_);
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
