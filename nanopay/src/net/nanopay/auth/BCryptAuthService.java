package net.nanopay.auth;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.ProxyAuthService;
import foam.nanos.auth.User;
import foam.nanos.session.Session;
import foam.util.Password;
import org.mindrot.jbcrypt.BCrypt;

import javax.naming.AuthenticationException;

import static foam.mlang.MLang.EQ;

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
    sessionDAO_ = (DAO) getX().get("sessionDAO");
  }

  @Override
  public User login(X x, long userId, String password) throws AuthenticationException {
    try {
      return super.login(x, userId, password);
    } catch (Throwable t) {
      User user = (User) userDAO_.inX(x).find(userId);
      if ( user == null ) {
        throw new AuthenticationException("User not found");
      }

      if ( ! BCrypt.checkpw(password, user.getPassword()) ) {
        throw new AuthenticationException("Incorrect password");
      }

      // hash using new method and update
      user.setPassword(Password.hash(password));
      user = (User) userDAO_.put(user);

      // create session
      Session session = x.get(Session.class);
      session.setUserId(user.getId());
      session.setContext(session.getContext().put("user", user));
      sessionDAO_.put(session);
      return (User) Password.sanitize(user);
    }
  }

  @Override
  public User loginByEmail(X x, String email, String password) throws AuthenticationException {
    try {
      return super.loginByEmail(x, email, password);
    } catch (Throwable t) {
      User user = (User) userDAO_.inX(x).find(EQ(User.EMAIL, email.toLowerCase()));
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
      return (User) Password.sanitize(user);
    }
  }
}