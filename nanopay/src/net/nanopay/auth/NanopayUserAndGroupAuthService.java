package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.UserAndGroupAuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.session.Session;
import foam.util.Password;
import foam.util.SafetyUtil;
import net.nanopay.model.Business;

import java.util.Calendar;

/**
 * We need a nanopay-specific extension of the FOAM UserAndGroupAuthService so
 * that we can use bareUserDAO, which contains extensions of the User model such
 * as Business. If we don't make this change, then when a User acts as a Business,
 * auth.check will return false because it can't find the business when it does
 * the lookup in userDAO_. This happens because FOAM doesn't have the bareUserDAO,
 * so it won't find the Business and will therefore return false.
 * Therefore we need to replace localUserDAO with bareUserDAO so when it does
 * the lookup it will be able to find the Business.
 */
public class NanopayUserAndGroupAuthService extends UserAndGroupAuthService {

  // pattern used to check if password has only alphanumeric characters
  java.util.regex.Pattern alphanumeric = java.util.regex.Pattern.compile("[^a-zA-Z0-9]");

  public NanopayUserAndGroupAuthService(X x) {
    super(x);
  }

  @Override
  public void start() {
    super.start();
    userDAO_ = (DAO) getX().get("bareUserDAO");
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
      user = (User) x.get("agent");;
    }

    if ( user == null ) {
      throw new AuthenticationException("User not found");
    }

    // check if user enabled
    if ( ! user.getEnabled() ) {
      throw new AuthenticationException("User disabled");
    }

    // check if user group enabled
    Group group = (Group) groupDAO_.find(user.getGroup());
    if ( group != null && ! group.getEnabled() ) {
      throw new AuthenticationException("User group disabled");
    }

    int length = newPassword.length();
    if ( length < 7 || length > 32 ) {
      throw new RuntimeException("Password must be 7-32 characters long");
    }

    if ( newPassword.equals(newPassword.toLowerCase()) ) {
      throw new RuntimeException("Password must have one capital letter");
    }

    if ( ! newPassword.matches(".*\\d+.*") ) {
      throw new RuntimeException("Password must have one numeric character");
    }

    if ( alphanumeric.matcher(newPassword).matches() ) {
      throw new RuntimeException("Password must not contain: !@#$%^&*()_+");
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
    user.setPasswordLastModified(Calendar.getInstance().getTime());
    user.setPreviousPassword(user.getPassword());
    user.setPassword(Password.hash(newPassword));
    // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
    user.setPasswordExpiry(null);
    user = (User) userDAO_.put(user);
    session.setContext(session.getContext().put("user", user));
    return user;
  }
}
