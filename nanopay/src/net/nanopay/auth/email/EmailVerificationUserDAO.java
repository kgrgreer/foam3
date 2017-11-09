package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;

public class EmailVerificationUserDAO
    extends ProxyDAO
{
  public EmailVerificationUserDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) obj;
    EmailTokenService emailToken = (EmailTokenService) getX().get("emailToken");
    boolean newUser = ( getDelegate().find(user.getId()) == null );

    User result = (User) super.put_(x, obj);
    // send email verification if new user
    if ( result != null && newUser ) {
      emailToken.generateToken(result);
    }
    return result;
  }
}