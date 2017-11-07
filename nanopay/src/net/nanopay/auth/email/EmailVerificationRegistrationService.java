package net.nanopay.auth.email;

import foam.core.X;
import foam.nanos.auth.User;
import foam.nanos.register.ProxyRegistrationService;
import foam.nanos.register.RegistrationService;

public class EmailVerificationRegistrationService
    extends ProxyRegistrationService
{
  public EmailVerificationRegistrationService(X x, RegistrationService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public User register(User user) {
    EmailTokenService emailToken = (EmailTokenService) getX().get("emailToken");
    User result = super.register(user);
    if ( result != null ) {
      emailToken.generateToken(result);
    }
    return result;
  }
}