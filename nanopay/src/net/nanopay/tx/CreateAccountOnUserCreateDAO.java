package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.model.Account;

// TODO: I don't think this is required anymore
public class CreateAccountOnUserCreateDAO
  extends ProxyDAO
{
  public CreateAccountOnUserCreateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User result    = (User) super.put_(x, obj);
    DAO accountDAO = (DAO) getX().get("localAccountDAO");

    if ( accountDAO.find(result.getId()) == null ) {
      Account account = new Account();
      account.setId(result.getId());
      account.setBalance(0);
      accountDAO.put(account);
    }

    return result;
  }
}
