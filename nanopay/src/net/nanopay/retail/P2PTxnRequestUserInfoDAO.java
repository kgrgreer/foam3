package net.nanopay.retail;

import static net.nanopay.retail.utils.P2PTxnRequestUtils.getCurrentUser;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.isPartner;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.User;
import net.nanopay.auth.PublicUserInfo;
import net.nanopay.retail.model.P2PTxnRequest;

public class P2PTxnRequestUserInfoDAO
extends ProxyDAO
{
  public P2PTxnRequestUserInfoDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  private class DecoratedSink extends foam.dao.ProxySink {
    public DecoratedSink(X x, Sink delegate) {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      obj = setUsersInfo(getX(), (FObject) obj);
      getDelegate().put(obj, sub);
    }
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink decoratedSink = new DecoratedSink(x, sink);
    getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
    return sink;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    obj = getDelegate().put_(x, obj);
    return setUsersInfo(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject obj = getDelegate().find_(x, id);
    if ( obj != null ) {
      obj = setUsersInfo(x, obj);
    }
    return obj;
  }

  private P2PTxnRequest setUsersInfo(X x, FObject obj) {
    User currentUser = getCurrentUser(x);
    P2PTxnRequest request = (P2PTxnRequest) obj.fclone();

    if ( currentUser.getEmail().equals(request.getRequesteeEmail()) ) {
      // current user is requestee
      request.setRequestee(new PublicUserInfo(currentUser));
      User otherUser = getUserByEmail(x, request.getRequestorEmail());

      if ( otherUser != null && isPartner(x, currentUser, otherUser) ) {
        request.setRequestor(new PublicUserInfo(otherUser));
      }
    } else {
      // current user is requestor
      request.setRequestor(new PublicUserInfo(currentUser));
      User otherUser = getUserByEmail(x, request.getRequesteeEmail());

      if ( otherUser != null && isPartner(x, currentUser, otherUser) ) {
        request.setRequestee(new PublicUserInfo(otherUser));
      }
    }
    return request;
  }
}
