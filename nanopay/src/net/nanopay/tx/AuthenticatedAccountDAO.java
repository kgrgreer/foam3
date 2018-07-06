package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import java.security.AccessControlException;

import foam.util.SafetyUtil;
import net.nanopay.account.CurrentBalance;
import static foam.mlang.MLang.EQ;

public class AuthenticatedAccountDAO
  extends ProxyDAO
{
  public final static String GLOBAL_BALANCE_CREATE = "balance.create.x";
  public final static String GLOBAL_BALANCE_READ = "balance.read.x";
  public final static String GLOBAL_BALANCE_UPDATE = "balance.update.x";
  public final static String GLOBAL_BALANCE_DELETE = "balance.delete.x";

  public AuthenticatedAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    CurrentBalance currentBalance = (CurrentBalance) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    // if current user doesn't have permissions to create or update, force currentBalance's owner to be current user id
    if ( currentBalance.getId() == 0 || ! auth.check(x, GLOBAL_BALANCE_CREATE) || ! auth.check(x, GLOBAL_BALANCE_UPDATE) ) {
      currentBalance.setId(user.getId());
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User        user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    // fetch currentBalance from delegate and verify user either owns the currentBalance or has global read access
    CurrentBalance currentBalance = (CurrentBalance) getDelegate().find_(x, id);
    if ( currentBalance != null && ! SafetyUtil.equals(currentBalance.getId(), user.getId()) && ! auth.check(x, GLOBAL_BALANCE_READ) ) {
      return null;
    }

    return currentBalance;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_BALANCE_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(CurrentBalance.ID, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    CurrentBalance currentBalance = (CurrentBalance) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    if ( currentBalance != null && ! SafetyUtil.equals(currentBalance.getId(), user.getId()) && ! auth.check(x, GLOBAL_BALANCE_DELETE) ) {
      throw new RuntimeException("Unable to delete bank account");
    }

    return super.remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    boolean global = auth.check(x, GLOBAL_BALANCE_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(CurrentBalance.ID, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
