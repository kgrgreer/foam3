package net.nanopay.account;

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
import net.nanopay.contacts.Contact;

import static foam.mlang.MLang.EQ;

public class AuthenticatedAccountDAO
    extends ProxyDAO
{
  public final static String GLOBAL_ACCOUNT_READ = "account.read.*";
  public final static String GLOBAL_ACCOUNT_UPDATE = "account.update.*";
  public final static String GLOBAL_ACCOUNT_DELETE = "account.delete.*";
  public final static String GLOBAL_ACCOUNT_CREATE = "account.create";

  public AuthenticatedAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    Account newAccount = (Account) obj;
    AuthService auth = (AuthService) x.get("auth");
    DAO userDAO_ = (DAO) x.get("bareUserDAO");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    Account oldAccount = (Account) getDelegate().find_(x, obj);
    boolean isUpdate = oldAccount != null;

    if ( isUpdate ) {
      boolean ownsAccount = newAccount.getOwner() == user.getId() && oldAccount.getOwner() == user.getId();

      if (
        ! ownsAccount &&
        ! auth.check(x, GLOBAL_ACCOUNT_UPDATE) &&
        ! ownsContactThatOwnsAccount(x, newAccount) &&
        ! ownsContactThatOwnsAccount(x, oldAccount)
      ) {
        throw new AuthorizationException("You do not have permission to update that account.");
      }
    } else if (
      newAccount.getOwner() != user.getId() &&
      ! auth.check(x, "account.create") &&
      ! ownsContactThatOwnsAccount(x, newAccount)
    ) {
      throw new AuthorizationException("You do not have permission to create an account for another user.");
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    Account account = (Account) super.find_(x, id);

    if ( account == null ) return null;

    if (
      account.getOwner() == user.getId() ||
      auth.check(x, GLOBAL_ACCOUNT_READ) ||
      ownsContactThatOwnsAccount(x, account)
    ) {
      return account;
    }

    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    boolean global = auth.check(x, GLOBAL_ACCOUNT_READ);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.OWNER, user.getId()));
    return dao.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    Account account = (Account) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if (
      account != null &&
      account.getOwner() != user.getId() &&
      ! auth.check(x, GLOBAL_ACCOUNT_DELETE) &&
      ! ownsContactThatOwnsAccount(x, account)
    ) {
      throw new AuthorizationException("Unable to delete bank account due to insufficient permissions.");
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

    boolean global = auth.check(x, GLOBAL_ACCOUNT_DELETE);
    DAO dao = global ? getDelegate() : getDelegate().where(EQ(Account.OWNER, user.getId()));
    dao.removeAll_(x, skip, limit, order, predicate);
  }

  /**
   * Check if the user in the context owns a contact that owns the given account.
   * @param x The user context.
   * @param account The account to check.
   * @return true if the given account is owned by a contact that the user owns.
   */
  public boolean ownsContactThatOwnsAccount(X x, Account account) {
    User user = (User) x.get("user");
    User owner = account.findOwner(x);
    return owner instanceof Contact && ((Contact) owner).getOwner() == user.getId();
  }

}
