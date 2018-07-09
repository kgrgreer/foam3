package net.nanopay.retail.utils;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import java.security.AccessControlException;

import static foam.mlang.MLang.EQ;

public final class P2PTxnRequestUtils {

  private P2PTxnRequestUtils() {
  }

  public static User getUserByEmail(X x, String emailAddress) {
    DAO userDAO = (DAO) x.get("localUserDAO");

    ArraySink users = (ArraySink) userDAO
      .where(EQ(User.EMAIL, emailAddress))
      .limit(1)
      .select(new ArraySink());
    return users.getArray().size() == 1 ? (User) users.getArray().get(0) : null;
  }

  public static User getCurrentUser(X x) {
    User user = (User) x.get("user");

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }
    return user;
  }

  public static boolean isPartner(X x, User user1, User user2) {
    User user1Clone = (User) user1.fclone();
    user1Clone.setX(x);
    DAO dao = user1Clone.getPartners().getJunctionDAO();

    // when user1 is the source
    UserUserJunction user1Source = createUserUserJunctionObj(x, user1.getId(), user2.getId());
    FObject userJunction = dao.find(user1Source);

    if ( userJunction == null ) {
      // when user2 is the source
      UserUserJunction user2Source = createUserUserJunctionObj(x, user2.getId(), user1.getId());
      userJunction = dao.find(user2Source);
    }

    return userJunction != null;
  }

  private static UserUserJunction createUserUserJunctionObj(X x, long sourceUserId, long targetUserId) {
    UserUserJunction junction = new UserUserJunction.Builder(x)
      .setSourceId(sourceUserId)
      .setTargetId(targetUserId)
      .build();

    return junction;
  }
}
