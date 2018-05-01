package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.email.EmailTokenService;

public class EmailVerificationDAO
    extends ProxyDAO
{
  protected EmailTokenService emailToken_;
  protected EmailTokenService inviteToken_;

  public EmailVerificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    emailToken_ = (EmailTokenService) x.get("emailToken");
    inviteToken_ = (EmailTokenService) x.get("inviteToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    boolean newUser = getDelegate().find(((User) obj).getId()) == null;

    // send email verification if new user
    User result = (User) super.put_(x, obj);
    if ( result != null && newUser && ! result.getEmailVerified() ) {
      if ( result.getInvited() ) {
        inviteToken_.generateToken(x, result);
      } else {
        emailToken_.generateToken(x, result);
      }
    }

    return result;
  }
}