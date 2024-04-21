/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.session.Session;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
  Helper methods to aid in defining auth logic that allow the system to recognizes and create various auth states.
  These utility methods are usually to be applied after some layer of authorization has occured or for testing purposes.
 */
public class Auth {
  /**
    Applies provided user into session and context (Does not save the session.)
    @param user user to be applied(logged in) to context and session.
  */
  public static X sudo(X x, User user) {
    return sudo(x, user, null);
  }

  /**
    Applies the provided id related user into session and context
    @param id used to find the user which will be applied(logged in) to context and session.
  */
  
  public static X sudo(X x, Object id) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(id));
  }

  /**
    Applies the provided email related user into session and context
    @param email used to find the user which will be applied(logged in) to context and session.
  */
  public static X sudo(X x, String email) {
    return sudo(x, (User) ((DAO) x.get("userDAO")).inX(x).find(AND(
      EQ(User.EMAIL, email),
      EQ(User.LOGIN_ENABLED, true)
    )));
  }

  /**
    Applies user acting as another user within the context provided. user and realuser of context' subject would be typically different.
    @param user User that will be the "user" within context' subject (You can think of it as the main user of the session)
    @param realUser User that will be acting as the @param user. References realUser within context' subject.
   */
  public static X sudo(X x, User user, User realUser) {
    if ( user == null ) throw new RuntimeException("Unknown user");
    boolean hasAgent = realUser != null && user.getId() != realUser.getId();

    Session session = new Session();
    session.setUserId(user.getId());
    if ( hasAgent ) session.setAgentId(realUser.getId());

    X y = session.applyTo(x);
    if ( user.getId() == User.SYSTEM_USER_ID ) {
      // Session.applyTo does not setup subject when user is System.
      y = y.put("subject", new Subject(user));
    }
    session.setContext(y);
    y = y.put(Session.class, session);

    return y;
  }

  /**
   * Simple create group helper method
   * @param groupId identifier of the group being created.
   * returns group.
   */
  public static Group createGroup(X x, String groupId) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    return (Group) groupDAO.put(new Group.Builder(x).setId(groupId).build());
  }

  /**
   * Simple create group helper method
   * @param groupId identifier of the group being created.
   * @param parentId identifier of the groups parent.
   * returns group.
   */
  public static Group createGroup(X x, String groupId, String parentId) {
    DAO groupDAO = (DAO) x.get("groupDAO");
    return (Group) groupDAO.put(new Group.Builder(x).setId(groupId).setId(parentId).build());
  }

  /**
   * Applies permission to the provided group' permission list.
   * @param String groupId to apply the permission to (String ID)
   * @param String permission to be granted to group found with @param groupId
   */
  public static void applyPermissionToGroup(X x, String groupId, String permission) {
    DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
    groupPermissionJunctionDAO.put(
      new GroupPermissionJunction.Builder(x)
        .setSourceId(groupId)
        .setTargetId(permission)
        .build()
    );
  }

  /**
   * Applies permission to the provided group' permission list.
   * @param String groupId associate to group to apply @param permissions to.
   * @param String[] permissions to be granted to group with @param groupId.
  */
  public static void applyPermissionToGroup(X x, String groupId, String[] permissions) {
    for ( String permission : permissions ) {
      applyPermissionToGroup(x, groupId, permission);
    }
  }
}
