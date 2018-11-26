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
  
      if ( ! ownsAccount && ! auth.check(x, GLOBAL_ACCOUNT_UPDATE) ) {
        throw new AuthorizationException("You do not have permission to update that account.");
      }
    } else {
      boolean hasCreatePermission = auth.check(x, "account.create");
      boolean ownsAccount = newAccount.getOwner() == user.getId();
      
      // Test if account is owned by a contact being created by user
      boolean ownsAccountThroughContact = false;
      Object potentialContact = userDAO_.find(newAccount.getOwner());
      if ( potentialContact instanceof Contact ) {
        User contactOwner = (User) userDAO_.find(((Contact) potentialContact).getOwner());
        ownsAccountThroughContact = contactOwner.getId() == user.getId(); 
      }

      if ( ! ownsAccount && ! ownsAccountThroughContact && ! hasCreatePermission ) {
        throw new AuthorizationException("You do not have permission to create an account for another user.");
      }
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

    // fetch account from delegate and verify user either owns the account or has global read access
    Account account = (Account) getDelegate().find_(x, id);
    if ( account != null && account.getOwner()!= user.getId() && ! auth.check(x, GLOBAL_ACCOUNT_READ) ) {
      return null;
    }

    return account;
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

    if ( account != null && account.getOwner() != user.getId() && ! auth.check(x, GLOBAL_ACCOUNT_DELETE) ) {
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
}
