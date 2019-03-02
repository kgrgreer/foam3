package net.nanopay.partners;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;

/**
 * Set the partnerId property to the appropriate value. PublicUserInfoDAO will
 * use it to put the info for that user on the partnerInfo property.
 */
public class PartnerInfoDAO
  extends ProxyDAO
{
  public PartnerInfoDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  /** Used to apply the replacement logic to each item returned by a select */
  private class DecoratedSink extends foam.dao.ProxySink {
    private User user_;
    public DecoratedSink(X x, Sink delegate) {
      super(x, delegate);
      user_ = (User) x.get("user");
      if ( user_ == null ) {
        throw new AuthenticationException();
      }
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      UserUserJunction junc = (UserUserJunction) obj;
      junc = setIdProperties(user_, junc);
      getDelegate().put(junc, sub);
    }
  }

  // NOTE: put_() isn't supported for now because if this decorator comes after
  // PublicUserInfoDAO, then find and select work but put doesn't. If this
  // decorator comes before PublicUserInfoDAO though, then put works and the
  // other two don't. Having find and select work seems a lot more useful for
  // our current use cases so that's why I'm going with leaving put out for now.

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    UserUserJunction junc = (UserUserJunction) getDelegate().find_(x, id);
    junc = this.setIdProperties(user, junc);
    return junc;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink decoratedSink = new DecoratedSink(x, sink);
    getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
    return sink;
  }

  private UserUserJunction setIdProperties(User user, UserUserJunction junc) {
    if ( user == null ) {
      throw new AuthenticationException();
    } else if ( junc != null ) {
      junc = (UserUserJunction) junc.fclone();
      if ( user.getId() == junc.getSourceId() ) {
        junc.setPartnerId(junc.getTargetId());
        junc.setYourId(junc.getSourceId());
      } else {
        junc.setPartnerId(junc.getSourceId());
        junc.setYourId(junc.getTargetId());
      }
    }
    return junc;
  }
}
