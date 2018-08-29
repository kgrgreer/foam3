package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;

public class EmailVerifiedTransactionDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public EmailVerifiedTransactionDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    User user = null;
    Account account = (Account) transaction.findSourceAccount(x);
    if ( account != null ) {
      user = (User) ((DAO)x.get("localUserDAO")).find_(x, account.getOwner());
    } else {
      Logger logger = (Logger) x.get("logger");
      logger.warning(this.getClass().getSimpleName(), "Account not found:", transaction.getSourceAccount(), "transaction", transaction);
    }

    if ( user == null || ! user.getEmailVerified() ) {
      switch ( transaction.getType() ) {
        case CASHIN:
          throw new AuthorizationException("You must verify your email to top up.");
        case CASHOUT:
          throw new AuthorizationException("You must verify your email to cash out.");
        case VERIFICATION:
          throw new AuthorizationException("You must verify your email to verify a bank account.");
        default:
          throw new AuthorizationException("You must verify your email to send money.");
      }
    }

    return super.put_(x, obj);
  }
}
