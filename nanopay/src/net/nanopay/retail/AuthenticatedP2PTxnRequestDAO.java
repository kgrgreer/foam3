package net.nanopay.retail;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import java.security.AccessControlException;

import net.nanopay.retail.model.P2PTxnRequest;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.getCurrentUser;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail;

public class AuthenticatedP2PTxnRequestDAO
  extends ProxyDAO
{
  public final static String GLOBAL_P2PTxnRequest_READ = "p2pTxnRequest.read.*";

  public AuthenticatedP2PTxnRequestDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) throws RuntimeException {
    User user = getCurrentUser(x);

    if ( obj == null ) {
      throw new RuntimeException("Request can't be null");
    }

    P2PTxnRequest request = (P2PTxnRequest) obj;

    if ( ! isUserAssociatedWithRequest(user, request) ) {
      throw new RuntimeException("Invalid Request.");
    }
    if ( ! checkIfUsersExist(x, request) ) {
      throw new RuntimeException("User does not exist.");
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    P2PTxnRequest request = (P2PTxnRequest) getDelegate().find_(x, id);
    User currentUser = getCurrentUser(x);
    AuthService auth = (AuthService) x.get("auth");

    if ( request != null && ! isUserAssociatedWithRequest(currentUser, request) && ! auth.check(x, GLOBAL_P2PTxnRequest_READ) ) {
      return null;
    }
    return (FObject) request;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User currentUser = getCurrentUser(x);
    AuthService auth = (AuthService) x.get("auth");

    boolean hasGlobalRead = auth.check(x, GLOBAL_P2PTxnRequest_READ);

    DAO secureDAO = hasGlobalRead ? getDelegate() : getDelegate().where(OR(
      EQ(P2PTxnRequest.REQUESTEE_EMAIL, currentUser.getEmail()),
      EQ(P2PTxnRequest.REQUESTOR_EMAIL, currentUser.getEmail())));

    return secureDAO.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    // don't remove any request.
    return null;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    // don't remove any request.
  }

  private boolean isUserAssociatedWithRequest(User user, P2PTxnRequest request) {

    if ( SafetyUtil.isEmpty(request.getRequestorEmail()) ||
    SafetyUtil.isEmpty(request.getRequestorEmail()) ) {
      return false;
    }

    if ( SafetyUtil.compare(request.getRequestorEmail(), user.getEmail()) != 0 &&
    SafetyUtil.compare(request.getRequesteeEmail(), user.getEmail()) != 0 ) {
      return false;
    }
    return true;
  }

  private boolean checkIfUsersExist(X x, P2PTxnRequest request) {

    // NOTE: Change the condition when Requestee is allowed to not exist on the system.
    if ( getUserByEmail(x, request.getRequesteeEmail()) == null ||
      getUserByEmail(x, request.getRequestorEmail()) == null ) {
      return false;
    }
    return true;
  }
}
