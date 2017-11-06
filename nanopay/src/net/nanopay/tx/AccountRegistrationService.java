package net.nanopay.tx;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.register.ProxyRegistrationService;
import foam.nanos.register.RegistrationService;
import net.nanopay.model.Account;

public class AccountRegistrationService
    extends ProxyRegistrationService
{
  public AccountRegistrationService(X x, RegistrationService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public User register(User user) {
    DAO accountDAO = (DAO) getX().get("accountDAO");
    User result = super.register(user);
    if ( result != null ) {
      Account account = new Account();
      account.setOwner(user.getId());
      account.setBalance(0);
      accountDAO.put(account);
    }
    return result;
  }
}