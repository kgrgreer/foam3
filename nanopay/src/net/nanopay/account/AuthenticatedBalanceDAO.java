package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import java.security.AccessControlException;

import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.Balance;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class AuthenticatedBalanceDAO
  extends ProxyDAO
{
  public final static String GLOBAL_BALANCE_CREATE = "balance.create.x";
  public final static String GLOBAL_BALANCE_READ = "balance.read.x";
  public final static String GLOBAL_BALANCE_UPDATE = "balance.update.x";
  public final static String GLOBAL_BALANCE_DELETE = "balance.delete.x";

  public AuthenticatedBalanceDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    Balance balance = (Balance) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    Account account = balance.findAccount(x);
    if ( user.getId() != ((Long)account.getOwner()).longValue()) {
      // TODO/REVIEW: Reassign user's accounts?
      // We'll end up with multiple accounts for same currency owned by admin
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

    Balance balance = (Balance) getDelegate().find_(x, id);

    // fetch balance from delegate and verify user either owns the balance or has global read access
    if ( balance != null ) {
      Account account = balance.findAccount(x);
      if ( user.getId() != ((Long)account.getOwner()).longValue() && ! auth.check(x, GLOBAL_BALANCE_READ) ) {
        return null;
      }
    }

    return balance;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    DAO accountsDAO = user.getAccounts();
    Sink accountSink = new ArraySink();
    accountSink = accountsDAO.select(accountSink);
    List<Account> accounts = ((ArraySink) accountSink).getArray();
    List accountIds = accounts.stream().map(a -> a.getId()).collect(Collectors.toList());

    boolean global = auth.check(x, GLOBAL_BALANCE_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(IN(Balance.ACCOUNT, accountIds));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    Balance balance = (Balance) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }

    if ( balance != null ) {
      Account account = balance.findAccount(x);
      if ( user.getId() != ((Long)account.getOwner()).longValue() && ! auth.check(x, GLOBAL_BALANCE_DELETE) ) {
        throw new RuntimeException("Unable to delete balance.");
      }
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

    DAO accountsDAO = user.getAccounts();
    Sink accountSink = new ArraySink();
    accountSink = accountsDAO.select(accountSink);
    List<Account> accounts = ((ArraySink) accountSink).getArray();
    List accountIds = accounts.stream().map(a -> a.getId()).collect(Collectors.toList());

    boolean global = auth.check(x, GLOBAL_BALANCE_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(IN(Balance.ACCOUNT, accountIds));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
