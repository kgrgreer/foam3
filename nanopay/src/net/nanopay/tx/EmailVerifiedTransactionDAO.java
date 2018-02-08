package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;

public class EmailVerifiedTransactionDAO
    extends ProxyDAO
{
  public EmailVerifiedTransactionDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    if ( user == null ) {
      throw new RuntimeException("User is not logged in");
    }

    if ( ! user.getEmailVerified() ) {
      throw new RuntimeException("You must verify your email to send money");
    }

    return super.put_(x, obj);
  }
}