package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;

/**
 * Populate a model returned from find or select with a small subset of public
 * user information.
 *
 * Example: A call like
 *
 *   new foam.dao.PublicUserInfoDAO(x, "payerId", "payer", ...)
 *
 * will look for a property named "payerId" on the object being selected and
 * look up the user associated with that id. It will then set the given property
 * ("payer") to the object being returned that contains some public properties
 * of the associated user.
 *
 * Requires both properties to already be defined on the model. For example, on
 * Transaction.js:
 *
 *     ...
 *   },
 *   {
 *    class: 'FObjectProperty',
 *    of: 'net.nanopay.auth.PublicUserInfo',
 *    name: 'payer',
 *    storageTransient: true
 *   },
 *   {
 *    class: 'Long',
 *    name: 'payerId'
 *   },
 *   {
 *     ...
 */
public class PublicUserInfoDAO
  extends ProxyDAO
{
  /**
   * A property of the model that the DAO is 'of' that holds the id of a
   * user
   */
  protected String idProperty_;

  /**
   * A property of the model that the DAO is 'of' that will be replaced with the
   * public user info of the user identified by `idProperty_`
   */
  protected String userProperty_;

  /** A DAO to store user instances */
  protected DAO userDAO_;

  public PublicUserInfoDAO(
      X x,
      String idProperty,
      String userProperty,
      DAO delegate
  ) {
    super(x, delegate);
    idProperty_ = idProperty;
    userProperty_ = userProperty;
    userDAO_ = (DAO) x.get("bareUserDAO");

    // Check if the given properties exist on the model.
    foam.core.ClassInfo classInfo = delegate.getOf();

    if ( classInfo.getAxiomByName(idProperty) == null ) {
      throw new IllegalArgumentException("Property '" + idProperty + "' does not exist on model '" + classInfo.getId() + "'.");
    } else if ( classInfo.getAxiomByName(userProperty) == null ) {
      throw new IllegalArgumentException("Property '" + userProperty + "' does not exist on model '" + classInfo.getId() + "'.");
    }
  }

  /** Used to apply the replacement logic to each item returned by a select */
  private class DecoratedSink extends foam.dao.ProxySink {
    public DecoratedSink(X x, Sink delegate) {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      obj = fillPublicInfo((FObject) obj);
      getDelegate().put(obj, sub);
    }
  }

  @Override
  public FObject put_(X x, FObject obj) {
    obj = fillPublicInfo(obj);
    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject obj = getDelegate().find_(x, id);
    if ( obj != null ) {
      obj = fillPublicInfo(obj);
    }
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink decoratedSink = new DecoratedSink(x, sink);
    getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
    return sink;
  }

  /**
   * Given an object in the DAO, replace one property on that object with some
   * public properties of a user whose id is specified by another property on
   * the object. Both the user property to be replaced and the property holding
   * the id of the user whose info is to be looked up are stored in the class
   * and have been passed into the constructor.
   */
  protected FObject fillPublicInfo(FObject obj) {
    FObject clone = obj.fclone();
    long id = (long) clone.getProperty(idProperty_);
    User user = (User) userDAO_.find(id);

    if ( user == null ) {
      clone.setProperty(userProperty_, null);
    } else {
      PublicUserInfo entity = new PublicUserInfo(user);
      clone.setProperty(userProperty_, entity);
    }

    return clone;
  }
}
