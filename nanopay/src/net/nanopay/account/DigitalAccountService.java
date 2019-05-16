package net.nanopay.account;

import foam.core.X;
import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
// import foam.nanos.session.Session;

import net.nanopay.account.Account;
// import net.nanopay.account.DigitalAccount;
// import net.nanopay.account.DigitalAccountServiceInterface;
import net.nanopay.model.Business;

import java.util.List;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountServiceInterface {

  public DigitalAccount findDefault(X x, User user, String denomination) {

    // User user = (User) x.get("user");
    if ( user instanceof Business || user.getGroup().equals("sme") ) {
      DAO accountDAO = (DAO) x.get("accountDAO");
      accountDAO = accountDAO.where(INSTANCE_OF(OverdraftAccount.class));
      X y = x.put("accountDAO", accountDAO);
      return OverdraftAccount.findDefault(y, user, denomination);
    } else {
      return DigitalAccount.findDefault(x, user, denomination);
    }
  }
}
