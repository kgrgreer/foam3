package net.nanopay.account;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;

import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.DigitalAccountInterface;

import java.util.List;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountInterface {

  public DigitalAccount getDefault(X x, String denomination) {
    //X x = getX();
    Logger logger = (Logger) x.get("logger");

    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) x.get("user");
    foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
    logger.info("auth", auth);
    if ( auth != null ) {
      try {
      User u = auth.getCurrentUser(x);
      if ( u != null ) {
        logger.info("auth user", u.getId());
      }
      } catch (javax.naming.AuthenticationException e) {
        logger.error(e);
      }
    }
    logger.info(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "find");
    return user.findDigitalAccount(x, denomination);
    // DigitalAccount account = null;
    // if ( user != null ) {
    //   synchronized(user) {

    //     String currency = denomination;
    //     if ( foam.util.SafetyUtil.isEmpty(denomination) ) {
    //       currency = "CAD";
    //     }
    //     DAO dao = (DAO) x.get("localAccountDAO");
    //     List accounts = ((ArraySink) dao.where(
    //                                            AND(
    //                                                INSTANCE_OF(DigitalAccount.class),
    //                                                EQ(Account.OWNER, user.getId()),
    //                                                EQ(Account.DENOMINATION, currency),
    //                                                EQ(Account.IS_DEFAULT, true)
    //                                                )
    //                                            ).select(new ArraySink())).getArray();
    //     if ( accounts.size() == 1 ) {
    //       account = (DigitalAccount) accounts.get(0);
    //       logger.debug(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "denomination", currency, account.toString(), "found");
    //     } else if ( accounts.size() == 0 ) {
    //       account = new DigitalAccount();
    //       account.setOwner(user.getId());
    //       account.setDenomination(currency);
    //       account.setIsDefault(true);
    //       account = (DigitalAccount) dao.put_(x, account);
    //       logger.debug(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "denomination", currency, account.toString(), "created");
    //       return account;
    //     } else {
    //       logger.warning(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "multiple default accounts found for denomination", currency, "Using first found.");
    //       account = (DigitalAccount) accounts.get(0);
    //     }
    //   }
    // } else {
    //   logger.warning(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "not found.");
    // }

    // return account;
  }
}
