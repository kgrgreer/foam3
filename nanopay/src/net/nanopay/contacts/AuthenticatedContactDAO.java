package net.nanopay.contacts;

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
 * Authenticate contactDAO
 *
 * Features:
 *  - only allow access to records where the user id matches the owner id of the
 *    record.
 */
public class AuthenticatedContactDAO
  extends ProxyDAO
{
  private final String createPermission_ = "contacts.create.*";
  private final String updatePermission_ = "contacts.update.*";
  private final String removePermission_ = "contacts.remove.*";
  private final String readPermission_ = "contacts.read.*";
  private final String deletePermission_ = "contacts.delete.*";

  public AuthenticatedContactDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  private void checkOwnership(X x, FObject obj, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    Contact entity = (Contact) obj;

    if ( entity == null ) {
      throw new RuntimeException("Entity is null");
    }

    boolean hasPermission = auth.check(x, permission);
    boolean ownsObject = user.getId() == entity.getOwner();

    if ( ! hasPermission && ! ownsObject) {
      throw new AuthorizationException();
    }
  }

  private DAO getFilteredDAO(X x, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    if ( auth.check(x, permission) ) return getDelegate();
    return getDelegate().where(OR(EQ(Contact.OWNER, user.getId())));
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
