package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.account.DigitalAccountService;
import net.nanopay.model.Business;

public class CreateDefaultDigitalAccountOnUserCreateDAO
  extends ProxyDAO
{
  public CreateDefaultDigitalAccountOnUserCreateDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // putting the user first so the Id is correct when looking for accounts.
    User user = (User) super.put_(x, obj);
    DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
    service.findDefault(getX().put("user",user), null);
    return user;
  }
}
