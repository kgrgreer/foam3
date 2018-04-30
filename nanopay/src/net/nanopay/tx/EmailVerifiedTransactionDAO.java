package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
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
    User user = (User) userDAO_.find_(x, transaction.getPayerId());
    if ( user == null || ! user.getEmailVerified() ) {
      switch ( transaction.getType() ) {
        case CASHIN:
          throw new RuntimeException("You must verify your email to top up");
        case CASHOUT:
          throw new RuntimeException("You must verify your email to cash out");
        case VERIFICATION:
          throw new RuntimeException("You must verify your email to verificate bank account");
        default:
          throw new RuntimeException("You must verify your email to send money");
      }
    }
    return super.put_(x, obj);
  }
}