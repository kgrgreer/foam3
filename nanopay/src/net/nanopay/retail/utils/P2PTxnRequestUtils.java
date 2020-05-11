package net.nanopay.retail.utils;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.Subject;
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
    return users.getArray().size() != 0 ? (User) users.getArray().get(0) : null;
  }

  public static User getCurrentUser(X x) {
    User user = ((Subject) x.get("subject")).getUser();

    if ( user == null ) {
      throw new AccessControlException("User is not logged in");
    }
    return user;
  }

  public static boolean isPartner(X x, User user1, User user2) {
    DAO partnerJunctionDAO = (DAO) x.get("partnerJunctionDAO");

    Count count = (Count) partnerJunctionDAO.where(
      MLang.OR(
        MLang.AND(
                MLang.EQ(UserUserJunction.SOURCE_ID, user1.getId()),
                MLang.EQ(UserUserJunction.TARGET_ID, user2.getId())
        ),
        MLang.AND(
                MLang.EQ(UserUserJunction.SOURCE_ID, user2.getId()),
                MLang.EQ(UserUserJunction.TARGET_ID, user1.getId())
        )
      )
    ).select(new Count());

    return count.getValue() != 0;
  }
}
