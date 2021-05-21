package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.*;
import foam.nanos.session.Session;
import foam.util.Password;
import org.mindrot.jbcrypt.BCrypt;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.OR;
import static foam.mlang.MLang.CLASS_OF;

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
  public User login(X x, String identifier, String password) throws AuthenticationException {
    try {
      return super.login(x, identifier, password);
    } catch (Throwable t) {
      User user = (User) userDAO_
        .find(
          EQ(User.EMAIL, identifier.toLowerCase())
          // Future: when username fully implemented
          // AND(
          //   OR(
          //     EQ(User.EMAIL, identifier.toLowerCase()),
          //     EQ(User.USER_NAME, identifier)
          //   ),
          //   CLASS_OF(User.class)
          // )
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
      Subject subject = new Subject.Builder(x).setUser(user).build();
      session.setContext(session.getContext().put("subject", subject));
      sessionDAO_.put(session);
      return user;
    }
  }
}
