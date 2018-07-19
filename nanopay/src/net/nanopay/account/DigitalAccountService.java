package net.nanopay.account;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.session.Session;

import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.DigitalAccountInterface;

import java.util.List;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountInterface {

  public DigitalAccount getDefault(X x, String denomination) {
    User user = (User) x.get("user");
    return user.findDigitalAccount(x, denomination);
  }
}
