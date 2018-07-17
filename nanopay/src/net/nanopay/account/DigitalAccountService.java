package net.nanopay.account;

import foam.core.ContextAwareSupport;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;

import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.DigitalAccountInterface;

import java.util.List;

public class DigitalAccountService
  extends ContextAwareSupport
  implements DigitalAccountInterface, NanoService {

  public DigitalAccount getDefault(Long userId, String denomination) {
    Logger logger = (Logger) getX().get("logger");
    logger.info(this.getClass().getSimpleName(), "getDefault");

    DAO userDAO = (DAO) getX().get("localUserDAO");
    User user = (User) userDAO.find(userId);

    DigitalAccount account = null;
    if ( user != null ) {
      synchronized(user) {

        String currency = denomination;
        if ( foam.util.SafetyUtil.isEmpty(denomination) ) {
          currency = "CAD";
        }
        DAO dao = (DAO) getX().get("localAccountDAO");
        List accounts = ((ArraySink) dao.where(
                                               AND(
                                                   EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
                                                   EQ(Account.OWNER, userId),
                                                   EQ(Account.DENOMINATION, currency),
                                                   EQ(Account.IS_DEFAULT, true)
                                                   )
                                               ).select(new ArraySink())).getArray();
        if ( accounts.size() == 1 ) {
          account = (DigitalAccount) accounts.get(0);
        } else if ( accounts.size() == 0 ) {
          account = new DigitalAccount();
          account.setOwner(userId);
          account.setDenomination(currency);
          account.setIsDefault(true);
          account = (DigitalAccount) dao.put(account);
          logger.debug(this.getClass().getSimpleName(), "getDefault", "user", userId, "denomination", currency, account.toString());
          return account;
        } else {
          logger.warning(this.getClass().getSimpleName(), "getDefault", "user", userId, "multiple default accounts found for denomination", currency,                       " Using first found.");
          account = (DigitalAccount) accounts.get(0);
        }
      }
    } else {
      logger.warning(this.getClass().getSimpleName(), "getDefault", "user", userId, "not found.");
    }

    return account;
  }

  public void start() {
  }
}
