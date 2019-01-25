package net.nanopay.auth;

import foam.core.X;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.UserAndGroupAuthService;
import foam.nanos.session.Session;
import foam.util.Password;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;
import net.nanopay.auth.passwordutil.PasswordEntropy;


public class NanopayUserAndGroupAuthService extends UserAndGroupAuthService {

  // pattern used to check if password has only alphanumeric characters
  java.util.regex.Pattern alphanumeric = java.util.regex.Pattern.compile("[^a-zA-Z0-9]");

  public NanopayUserAndGroupAuthService(X x) {
    super(x);
  }

  /**
   * Given a context with a user, validate the password to be updated
   * and return a context with the updated user information.
   * If it is a businessUser, replace user with agent.
   */
  @Override
  public User updatePassword(foam.core.X x, String oldPassword, String newPassword) throws AuthenticationException {
    if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
      throw new RuntimeException("Invalid parameters");
    }

    Session session = x.get(Session.class);
    if ( session == null || session.getUserId() == 0 ) {
      throw new AuthenticationException("User not found");
    }

    User user = (User) userDAO_.find(session.getUserId());

    // This case is for business user of sme
    if ( user instanceof Business) {
      user = (User) x.get("agent");
    }

    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // check if user group enabled
    Group group = (Group) groupDAO_.find(user.getGroup());
    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }

    // old password does not match
    if ( ! Password.verify(oldPassword, user.getPassword()) ) {
      throw new RuntimeException("Old password is incorrect");
    }

    // new password is the same
    if ( Password.verify(newPassword, user.getPassword()) ) {
      throw new RuntimeException("New password must be different");
    }

    // store new password in DAO and put in context
    user = (User) user.fclone();
    user.setDesiredPassword(newPassword);
    // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
    user.setPasswordExpiry(null);
    user = (User) userDAO_.put(user);
    session.setContext(session.getContext().put("user", user));
    return user;
  }

  @Override
  public void validatePassword(String newPassword) {
    PasswordEntropy passwordEntropy   = (PasswordEntropy) getX().get("passwordEntropyService");

    if ( SafetyUtil.isEmpty(newPassword) ) {
      throw new RuntimeException("Password is required");
    }

    if ( passwordEntropy.getPasswordStrength(newPassword) < 3 ) {
      throw new RuntimeException("Password is not strong enough.");
    }
  }
}
