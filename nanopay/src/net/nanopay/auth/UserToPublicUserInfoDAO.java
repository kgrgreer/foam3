package net.nanopay.auth;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxySink;
import foam.dao.ReadOnlyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.admin.model.AccountStatus;

public class UserToPublicUserInfoDAO
  extends ReadOnlyDAO
{
  public UserToPublicUserInfoDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) getDelegate().find_(x, id);
    return isPublic(user) ? new PublicUserInfo(user) : null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink s = sink != null ? sink : new ArraySink();
    ProxySink proxy = new ProxySink(x, s) {
      public void put(Object o, Detachable d) {
        if ( isPublic((User) o) ) {
          getDelegate().put(o, d);
        }
      }
    };

    getDelegate().select_(x, proxy, skip, limit, order, predicate);
    // Return the proxy's delegate - the caller may explicitly be expecting
    // this array sink they passed.  See foam.dao.RequestResponseClientDAO
    return proxy.getDelegate();
  }

  /**
   * Conditions under which a user should be considered public.
   * @param user The user to check.
   * @return True if the user should be searchable by anyone querying publicUserDAO.
   */
  public boolean isPublic(User user) {
    return user != null &&
      ! SafetyUtil.equals(user.getGroup(), "system") &&
      user.getLoginEnabled() &&
      user.getStatus() == AccountStatus.ACTIVE &&
      user.getIsPublic();
  }
}
