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
  private final String createPermission_ = "contact.create";
  private final String updatePermission_ = "contact.update.*";
  private final String removePermission_ = "contact.remove.*";
  private final String readPermission_ = "contact.read.*";
  private final String deletePermission_ = "contact.delete";

  public AuthenticatedContactDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  public void checkOwnership(X x, FObject obj, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    Contact entity = (Contact) obj;

    if ( entity == null ) {
      throw new RuntimeException("Entity is null");
    }

    boolean hasPermission = auth.check(x, permission);
    boolean ownsObject = user.getId() == entity.getOwner();

    if ( ! hasPermission && ! ownsObject ) {
      throw new AuthorizationException();
    }
  }

  public DAO getFilteredDAO(X x, String permission) {
    User user = getUser(x);
    AuthService auth = (AuthService) x.get("auth");
    if ( auth.check(x, permission) ) return getDelegate();
    return getDelegate().where(OR(EQ(Contact.OWNER, user.getId())));
  }

  public User getUser(X x) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new AuthenticationException();
    }
    return user;
  }

  public void checkPropertyChanges(X x, FObject obj, FObject existingObj) {
    Contact toPut = (Contact) obj;
    Contact existing = (Contact) existingObj;

    if ( toPut.getOwner() != existing.getOwner() ) {
      throw new AuthorizationException("Changing the owner of a contact is not allowed.");
    }
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Object id = obj.getProperty("id");
    FObject existingObj = getDelegate().find_(x, id);
    if ( id == null || existingObj == null ) {
      checkOwnership(x, obj, createPermission_);
    } else {
      checkPropertyChanges(x, obj, existingObj);
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
