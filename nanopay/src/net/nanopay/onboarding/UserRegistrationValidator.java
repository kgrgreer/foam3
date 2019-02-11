package net.nanopay.onboarding;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;

public class UserRegistrationValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) throws IllegalStateException {
    User user = (User) obj;

    // This decorator is executed when going through smeBusinessRegistrationDAO.
    // which has 2 use cases:
    // One when user is an external user and being added to a business
    // Two when user is an internal user and being added to a business
    // case two does not have user.getDesiredPassword() populated.
    if ( ! SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
      ( (AuthService) x.get("auth") ).validatePassword( user.getDesiredPassword() );
    }
    
    // TODO move all other registration related validation from Ablii front-end ot here.
  }

}
