package net.nanopay.auth.email;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.email.EmailTokenService;
import foam.nanos.auth.AuthService;
import foam.mlang.MLang;
import net.nanopay.model.Business;
import net.nanopay.contacts.Contact;

public class EmailVerificationDAO
    extends ProxyDAO
{
  protected EmailTokenService emailToken_;
  protected EmailTokenService inviteToken_;
  public final static String REGISTRATION_EMAIL_ENABLED = "registration.email.enabled";

  public EmailVerificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    emailToken_ = (EmailTokenService) x.get("emailToken");
    inviteToken_ = (EmailTokenService) x.get("inviteToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ((User) obj).getLoginEnabled() ) {
      return super.put_(x, obj);
    }

    boolean newUser = getDelegate().find(((User) obj).getId()) == null;
    AuthService auth = (AuthService) x.get("auth");
    boolean registrationEmailEnabled = auth.check(x, REGISTRATION_EMAIL_ENABLED);
    User result = (User) super.put_(x, obj);

    // Send email verification if new registered user's email enabled
    if ( result != null && newUser && ! result.getEmailVerified() && registrationEmailEnabled ) {
      if ( ! result.getInvited() ) {
        emailToken_.generateToken(x, result);
      }
    }

    return result;
  }
}