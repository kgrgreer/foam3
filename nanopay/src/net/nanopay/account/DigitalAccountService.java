package net.nanopay.account;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;

import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.DigitalAccountInterface;

import java.util.List;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountInterface {

  public DigitalAccount getDefault(X x, String denomination) {
    Logger logger = (Logger) x.get("logger");

    User user = (User) x.get("user");
    logger.info(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "denomination", denomination);
    return user.findDigitalAccount(x, denomination);
  }
}
