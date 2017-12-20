package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.model.Account;

public class CreateAccountOnUserCreateDAO
    extends ProxyDAO
{
  public CreateAccountOnUserCreateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    DAO accountDAO = (DAO) getX().get("localAccountDAO");
    boolean newUser = ( getDelegate().find(user.getId()) == null );

    User result = (User) super.put_(x, obj);
    // create new account if new user
    if ( result != null && newUser ) {
      Account account = new Account();
      account.setOwner(result.getId());
      account.setBalance(0);
      accountDAO.put(account);
    }
    return result;
  }
}