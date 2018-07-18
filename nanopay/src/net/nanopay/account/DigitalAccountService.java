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
    Logger logger = (Logger) x.get("logger");
    logger.info(this.getClass().getSimpleName(), "getDefault");

    DAO userDAO = (DAO) x.get("localUserDAO");
    User user = (User) x.get("user");

    DigitalAccount account = null;
    if ( user != null ) {
      synchronized(user) {

        String currency = denomination;
        if ( foam.util.SafetyUtil.isEmpty(denomination) ) {
          currency = "CAD";
        }
        DAO dao = (DAO) x.get("localAccountDAO");
        List accounts = ((ArraySink) dao.where(
                                               AND(
                                                   //EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
                                                   EQ(DigitalAccount.IS_DIGITAL_ACCOUNT, true),
                                                   EQ(Account.OWNER, user.getId()),
                                                   EQ(Account.DENOMINATION, currency),
                                                   EQ(Account.IS_DEFAULT, true)
                                                   )
                                               ).select(new ArraySink())).getArray();
        if ( accounts.size() == 1 ) {
          account = (DigitalAccount) accounts.get(0);
        } else if ( accounts.size() == 0 ) {
          account = new DigitalAccount();
          account.setOwner(user.getId());
          account.setDenomination(currency);
          account.setIsDefault(true);
          account = (DigitalAccount) dao.put_(x, account);
          logger.debug(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "denomination", currency, account.toString());
          return account;
        } else {
          logger.warning(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "multiple default accounts found for denomination", currency,                 " Using first found.");
          account = (DigitalAccount) accounts.get(0);
        }
      }
    } else {
      logger.warning(this.getClass().getSimpleName(), "getDefault", "user", user.getId(), "not found.");
    }

    return account;
  }
}
