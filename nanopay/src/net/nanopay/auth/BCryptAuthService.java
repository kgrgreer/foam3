package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.ProxyAuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import foam.util.Password;
import org.mindrot.jbcrypt.BCrypt;

import static foam.mlang.MLang.EQ;

/**
 * BCryptAuthService
 *
 * This auth service is meant to migrate old Bcrypt passwords to our
 * new password hashing method using PKDF2. When a user from the old
 * MintChip platform logs in, their old password will be updated to
 * the new method, effectively migrating them over.
 */
public class BCryptAuthService
    extends ProxyAuthService
    implements NanoService
{
  protected DAO userDAO_;
  protected DAO sessionDAO_;

  public BCryptAuthService(X x, AuthService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
    sessionDAO_ = (DAO) getX().get("localSessionDAO");
  }

  @Override
  public User login(X x, String id, String password) throws AuthenticationException {
    try {
      return super.login(x, id, password);
    } catch (Throwable t) {
      User user = (User) userDAO_
        .find(
          AND(
            OR(
              EQ(User.EMAIL, id.toLowerCase()),
              EQ(User.USER_NAME, id)
            ),
            EQ(User.LOGIN_ENABLED, true)
          )
        );
      if ( user == null ) {
        throw new AuthenticationException("User not found");
      }

      if ( ! BCrypt.checkpw(password, user.getPassword()) ) {
        throw new AuthenticationException("Incorrect password");
      }

      // hash using new method and store
      user.setPassword(Password.hash(password));
      user = (User) userDAO_.put(user);

      // create session
      Session session = x.get(Session.class);
      session.setUserId(user.getId());
      session.setContext(session.getContext().put("user", user));
      sessionDAO_.put(session);
      return user;
    }
  }
}
