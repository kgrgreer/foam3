package net.nanopay.security.pii;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import net.nanopay.security.pii.ViewPIIRequest;

import static foam.mlang.MLang.EQ;

public class AuthenticatedPIIRequestDAO
    extends ProxyDAO
{
  public final static String GLOBAL_PII_REQUEST_CREATE = "pii_request.create";
  public final static String GLOBAL_PII_REQUEST_READ = "pii_request.read.*";
  public final static String GLOBAL_PII_REQUEST_UPDATE = "pii_request.update.*";
  public final static String GLOBAL_PII_REQUEST_DELETE = "pii_request.delete.*";

  public AuthenticatedPIIRequestDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    return getDelegate().put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");
    
    if ( user == null ) {
      throw new AuthenticationException();
    }

    // fetch account from delegate and verify user either owns the account or has global read access
    ViewPIIRequest viewPIIRequest = (ViewPIIRequest) getDelegate().find_(x, id);
    if ( viewPIIRequest != null && viewPIIRequest.getCreatedBy()!= user.getId() && ! auth.check(x, GLOBAL_PII_REQUEST_READ) ) {
      return null;
    }

    return viewPIIRequest;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_PII_REQUEST_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(ViewPIIRequest.CREATED_BY, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    ViewPIIRequest viewPIIRequest = (ViewPIIRequest) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( viewPIIRequest != null && ! auth.check(x, GLOBAL_PII_REQUEST_DELETE) ) {
      throw new AuthorizationException("Unable to delete PII Request due to insufficient permissions.");
    }
    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_PII_REQUEST_DELETE);
    // only admin can delete requests
    if (global) {
      getDelegate().removeAll_(x, skip, limit, order, predicate);
    }
  }
}
