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
    EmailTokenService emailToken = (EmailTokenService) getX().get("emailToken");
    User user = (User) obj;
    // assume new user if can't find in delegate
    if ( getDelegate().find(user.getId()) == null ) {
      emailToken.generateToken(user);
    }
    return super.put_(x, obj);
  }
}