package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;

import java.util.List;
import java.util.stream.Collectors;

import static foam.mlang.MLang.IN;

public class AuthenticatedBalanceDAO
  extends ProxyDAO
{
  public final static String GLOBAL_BALANCE_CREATE = "balance.create";
  public final static String GLOBAL_BALANCE_READ = "balance.read.*";
  public final static String GLOBAL_BALANCE_UPDATE = "balance.update.*";
  public final static String GLOBAL_BALANCE_DELETE = "balance.delete.*";

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
      throw new AuthenticationException();
    }

    Account account = balance.findAccount(x);
    if ( user.getId() != account.getOwner()) {
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
      throw new AuthenticationException();
    }

    Balance balance = (Balance) getDelegate().find_(x, id);

    // fetch balance from delegate and verify user either owns the balance or has global read access
    if ( balance != null ) {
      Account account = balance.findAccount(x);
      if ( user.getId() != account.getOwner() && ! auth.check(x, GLOBAL_BALANCE_READ) ) {
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
      throw new AuthenticationException();
    }

    DAO accountsDAO = user.getAccounts(x);
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
      throw new AuthenticationException();
    }

    if ( balance != null ) {
      Account account = balance.findAccount(x);
      if ( user.getId() != account.getOwner() && ! auth.check(x, GLOBAL_BALANCE_DELETE) ) {
        throw new AuthorizationException("Unable to delete balance due to insufficient permissions.");
      }
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

    DAO accountsDAO = user.getAccounts(x);
    Sink accountSink = new ArraySink();
    accountSink = accountsDAO.select(accountSink);
    List<Account> accounts = ((ArraySink) accountSink).getArray();
    List accountIds = accounts.stream().map(a -> a.getId()).collect(Collectors.toList());

    boolean global = auth.check(x, GLOBAL_BALANCE_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(IN(Balance.ACCOUNT, accountIds));
    dao.removeAll_(x, skip, limit, order, predicate);
  }
}
