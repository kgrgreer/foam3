package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.account.CurrentBalance;

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
    DAO currentBalanceDAO = (DAO) getX().get("localCurrentBalanceDAO");

    if ( currentBalanceDAO.find(result.getId()) == null ) {
      CurrentBalance currentBalance = new CurrentBalance();
      currentBalance.setId(result.getId());
      currentBalance.setBalance(0);
      currentBalanceDAO.put(currentBalance);
    }

    return result;
  }
}
