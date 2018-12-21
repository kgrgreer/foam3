package net.nanopay.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import net.nanopay.admin.model.AccountStatus;

public class UserToPublicUserInfoDAO
  extends ProxyDAO
{
  public UserToPublicUserInfoDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  private class DecoratedSink extends foam.dao.ProxySink {
    public DecoratedSink(X x, Sink delegate) {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      User user = (User) obj;
      if ( isPublic(user) ) {
        obj = new PublicUserInfo(user);
        getDelegate().put(obj, sub);
      }
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) getDelegate().find_(x, id);
    return isPublic(user) ? new PublicUserInfo(user) : null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink decoratedSink = new DecoratedSink(x, sink);
    getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
    return sink;
  }

  /**
   * Conditions under which a user should be considered public.
   * @param user The user to check.
   * @return True if the user should be searchable by anyone querying publicUserDAO.
   */
  private boolean isPublic(User user) {
    return user != null && user.getStatus() == AccountStatus.ACTIVE;
  }
}
