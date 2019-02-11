package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;

public class UserRegistrationValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    User user = (User) obj;

    // ( (AuthService) x.get("auth") ).validatePassword( user.getDesiredPassword() );

    // TODO move all other registration related validation from Ablii front-end ot here.
  }

}
