/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.auth.test;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.*;
import foam.nanos.logger.Logger;
import foam.util.Auth;

import java.util.ArrayList;
import java.util.List;

public class UserUserDAOPrivilegeEscalationTest
  extends foam.nanos.test.Test {

  DAO bareUserDAO;
  DAO userDAO;
  DAO groupDAO;
  DAO localPermissionDAO;
  DAO permissionDAO;
  DAO groupPermissionJunctionDAO;
  Group testGroup = null;
  User testUser = null;
  Logger logger = null;
  String TEST_MESSAGE = "";
  String spid_ = "";

  @Override
  public void runTest(X x) {
    bareUserDAO = (DAO) x.get("bareUserDAO");
    userDAO = (DAO) x.get("userDAO");
    groupDAO = (DAO) x.get("groupDAO");
    localPermissionDAO = (DAO) x.get("localPermissionDAO");
    permissionDAO = (DAO) x.get("permissionDAO");
    groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
    testGroup = null;
    testUser = null;
    logger = new foam.nanos.logger.PrefixLogger(new Object[] {"PreventPriviledgeEscalation"}, (Logger) x.get("logger"));
    spid_ = generateId();
    ((DAO) x.get("localServiceProviderDAO")).put(new ServiceProvider.Builder(x).setId(spid_).build());

    // Run the tests.

    try {
      createGroupWithoutPermissionThrows(x);
      addNewPermissionThrows(x);
      addGroupWithAdminParentThrows(x);
      updateGroupWithoutPermissionThrows(x);
      updateGroupParentToAdminThrows(x);
      createUserInAdminGroupThrows(x);
      updateUserGroupToAdminThrows(x);
      updateOwnGroupThrows(x);
      createPermissionWithoutPermissionThrows(x);
      updatePermissionWithoutPermissionThrows(x);
      deletePermissionWithoutPermissionThrows(x);
      deleteGroupWithoutPermissionThrows(x);
      removePermissionFromGroupWithoutPermissionThrows(x);
    } catch (Throwable e) {
      logger.error(e);
      e.printStackTrace();
      test(false, "An unexpected exception was thrown. Some tests might not have been executed. "+e.getMessage());
    }
  }
  String generateId() {
    return java.util.UUID.randomUUID().toString().split("-")[0];
  }

  // Generate a test user and a group with the given permissions for them to be in.
  X generateTestUser(X x, List<String> permissionIds) {
    String groupId = generateId();
    Group group = new Group.Builder(x)
      .setId(groupId)
      .setParent("basicUser")
      .build();

    groupDAO.where(foam.mlang.MLang.EQ(Group.ID, groupId)).removeAll();
    groupDAO.put(group);

    groupPermissionJunctionDAO.where(foam.mlang.MLang.EQ(GroupPermissionJunction.SOURCE_ID, groupId)).removeAll();

    permissionIds.add("serviceprovider.read."+spid_);

    for ( String id : permissionIds ) {
      permissionDAO.where(foam.mlang.MLang.EQ(Permission.ID, id)).removeAll();
      permissionDAO.put(new Permission.Builder(x).setId(id).build());
      GroupPermissionJunction junction = new GroupPermissionJunction.Builder(x)
        .setSourceId(groupId)
        .setTargetId(id)
        .build();
      groupPermissionJunctionDAO.put(junction);
    }

    // Create a test user to sudo to.
    bareUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "ppet@example.com")).removeAll();
    User user = new User.Builder(x)
      .setEmail("ppet@example.com")
      .setGroup(groupId)
      .setSpid(spid_)
      .build();
    user = (User) bareUserDAO.put(user);
    return Auth.sudo(x, user);
  }

  void cleanUp(X testContext) {
    Group g = (Group) testContext.get("group");

    // Remove the permissions.
    groupPermissionJunctionDAO.where(foam.mlang.MLang.EQ(GroupPermissionJunction.SOURCE_ID, g.getId())).removeAll();

    // Remove the group.
    groupDAO.remove(g);

    // Remove the user.
    testUser = ((Subject) testContext.get("subject")).getUser();
    bareUserDAO.remove(testUser);
  }

  // Try to create a group when you don't have the 'create' permission.
  void createGroupWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"createGroupWithoutPermissionThrows"});
    // Create a group for the user to put.
    String groupId = generateId();
    Group g = new Group.Builder(x).setId(groupId).build();

    // Create a test user.
    List permissionIds = new ArrayList();
    X userContext = generateTestUser(x, permissionIds);

    try {
      // Try to create the group.
      g = (Group) groupDAO.inX(userContext).put(g);

      // If the put didn't throw, then this test failed.
      test(false, "Users cannot create a group without the 'group.create.<id>' permission.");

      // Clean up.
      groupDAO.remove(g);
    } catch (AuthorizationException e) {
      test(e.getMessage().equals("You do not have permission to create this group."), "Users cannot create a group without the 'group.create.<id>' permission.");
    }

    cleanUp(userContext);
  }

  // Try to add a permission you don't have to a group.
  void addNewPermissionThrows(X x) {
    logger.info(new Object[] {"addNewPermissionThrows"});
    // Create a group for the user to put.
    String groupId = generateId();
    Group g = new Group.Builder(x).setId(groupId).build();

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.create.*");
    X userContext = generateTestUser(x, permissionIds);

    // Create the group.
    g = (Group) groupDAO.inX(userContext).put(g);

    try {
      // Try to add a permission to the group that the user doesn't have.
      g.getPermissions(userContext).add(new Permission.Builder(userContext).setId("*").build());

      // If the put didn't throw, then this test failed.
      test(false, "Users cannot add a permission that they don't have to a group.");

      // Clean up.
      groupDAO.remove(g);
    } catch (AuthorizationException e) {
      test(e.getMessage().equals("You do not have permission to update that group."), "Users cannot add a permission that they don't have to a group.");
    }

    cleanUp(userContext);
  }


  // Try to create a group with "admin" as the parent.
  void addGroupWithAdminParentThrows(X x) {
    logger.info(new Object[] {"addGroupWithAdminParentThrows"});
    // Create a group for the user to put.
    String groupId = generateId();
    Group g = new Group.Builder(x)
      .setId(groupId)
      .setParent("admin")
      .build();

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.create.*");
    X userContext = generateTestUser(x, permissionIds);

    try {
      // Try to create the group.
      g = (Group) groupDAO.inX(userContext).put(g);

      // If the put didn't throw, then this test failed.
      test(false, "Users cannot set the parent of a group to a group containing a permission that isn't implied by one they already have.");

      // Clean up.
      groupDAO.remove(g);
    } catch (AuthorizationException e) {
      test(e.getMessage().equals("Permission denied. You cannot change the parent of a group."), "Users cannot set the parent of a group to a group containing a permission that isn't implied by one they already have.");
    }

    cleanUp(userContext);
  }


  // Try to update a group without permission.
  void updateGroupWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"updateGroupWithoutPermissionThrows"});
    // Create a group for the user to put.
    String groupId = generateId();
    Group g = new Group.Builder(x)
      .setId(groupId)
      .build();

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.create.*");
    X userContext = generateTestUser(x, permissionIds);

    // Create the group.
    g = (Group) groupDAO.inX(userContext).put(g);

    try {
      // Try to update the group.
      g = (Group) g.fclone();
      g.setParent("basicUser");
      g = (Group) groupDAO.inX(userContext).put(g);

      // If the put didn't throw, then this test failed.
      test(false, "Users cannot update groups unless they have the appropriate update permission.");

      // Clean up.
      groupDAO.remove(g);
    } catch (AuthorizationException e) {
      test(e.getMessage().equals("You don't have permission to update that group."), "Users cannot update groups unless they have the appropriate update permission.");
    }

    cleanUp(userContext);
  }


  // Try to update a group's parent to admin.
  void updateGroupParentToAdminThrows(X x) {
    logger.info(new Object[] {"updateGroupParentToAdminThrows"});
    // Create a group for the user to put.
    String groupId = generateId();
    Group g = new Group.Builder(x)
      .setId(groupId)
      .build();

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.create.*");
    permissionIds.add("group.update." + groupId);
    X userContext = generateTestUser(x, permissionIds);

    // Create the group.
    g = (Group) groupDAO.inX(userContext).put(g);

    try {
      // Try to update the group's parent to admin.
      g = (Group) g.fclone();
      g.setParent("admin");
      g = (Group) groupDAO.inX(userContext).put(g);

      // If the put didn't throw, then this test failed.
      test(false, "Users cannot update the parent of a group to a group containing a permission that isn't implied by one they already have.");

      // Clean up.
      groupDAO.remove(g);
    } catch (AuthorizationException e) {
      test(e.getMessage().equals("Permission denied. You cannot change the parent of a group."), "Users cannot set the parent of a group to a group containing a permission that isn't implied by one they already have.");
    }

    cleanUp(userContext);
  }

  // Try to create a user in the admin group.
  void createUserInAdminGroupThrows(X x) {
    logger.info(new Object[] {"createUserInAdminGroupThrows"});
    TEST_MESSAGE = "Users cannot create users in a group to a group containing a permission that isn't implied by one they already have.";

    // Create a user for the test user to put.
    User u = new User.Builder(x)
      .setGroup("admin")
      .setSpid(spid_)
      .setEmail("ppet+admin@example.com")
      .setDesiredPassword("!@#$ppet1234")
      .build();

    // Create a test user.
    List permissionIds = new ArrayList();
    X userContext = generateTestUser(x, permissionIds);

    try {
      // Try to create a user in the admin group.
      u = (User) userDAO.inX(userContext).put(u);

      print(String.valueOf(u.getId()));

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);

      // Clean up.
      bareUserDAO.remove(u);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("You do not have permission to set that user's group to 'admin'.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    test(null == bareUserDAO.find(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, "ppet+admin@example.com")), "User was not created with that email address.");
    cleanUp(userContext);
  }

  // Try to update a user's group to "admin".
  void updateUserGroupToAdminThrows(X x) {
    logger.info(new Object[] {"updateUserGroupToAdminThrows"});
    TEST_MESSAGE = "Users cannot update another user's group to a group containing a permission that isn't implied by one they already have.";

    // Create a user for the test user to put.
    User u = new User.Builder(x)
      .setGroup("basicUser")
      .setSpid(spid_)
      .setEmail("ppet+admin@example.com")
      .setFirstName("ppet")
      .setLastName("ppet")
      .setDesiredPassword("!@#$ppet1234")
      .build();

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.update.basicUser");
    permissionIds.add("user.update.*");
    X userContext = generateTestUser(x, permissionIds);

    // Create a user in the basicUser group.
    u = (User) userDAO.inX(userContext).put(u);

    try {
      // Try to update the user's group to "admin".
      u = (User) u.fclone();
      u.setGroup("admin");
      u = (User) userDAO.inX(userContext).put(u);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("You do not have permission to change that user's group to 'admin'.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    bareUserDAO.remove(u);
    cleanUp(userContext);
  }

  // Try to update your own group.
  void updateOwnGroupThrows(X x) {
    logger.info(new Object[] {"updateOwnGroupThrows"});
    TEST_MESSAGE = "Users cannot update their own group.";

    // Create a test user.
    List permissionIds = new ArrayList();
    X userContext = generateTestUser(x, permissionIds);

    try {
      // Try to update the user's group to "admin".
      User u = (User) ((Subject) userContext.get("subject")).getUser().fclone();
      u.setGroup("admin");
      u = (User) userDAO.inX(userContext).put(u);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("You cannot change your own group.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    cleanUp(userContext);
  }

  // Try to create a permission without permission to do so.
  void createPermissionWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"createPermissionWithoutPermissionThrows"});
    TEST_MESSAGE = "Cannot create permissions without the appropriate 'create' permission.";

    // Create a test user.
    List permissionIds = new ArrayList();
    X userContext = generateTestUser(x, permissionIds);

    // Create a permission for the test user to put.
    Permission p = new Permission.Builder(x)
      .setId("ppet")
      .build();

    try {
      // Try to create a permission.
      p = (Permission) permissionDAO.inX(userContext).put(p);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);

      // Clean up.
      permissionDAO.remove(p);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("Permission denied.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    cleanUp(userContext);
  }


  // Try to update a permission without permission to do so.
  void updatePermissionWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"updatePermissionWithoutPermissionThrows"});
    TEST_MESSAGE = "Cannot update permissions without the appropriate 'update' permission.";

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("permission.create");
    X userContext = generateTestUser(x, permissionIds);

    // Create a permission for the test user to update.
    Permission p = new Permission.Builder(x)
      .setId("ppet")
      .build();

    permissionDAO.remove(p);
    // Create the permission.
    p = (Permission) permissionDAO.inX(userContext).put(p).fclone();

    try {
      // Try to update the permission.
      p.setDescription("Updated");
      p = (Permission) permissionDAO.inX(userContext).put(p);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("Permission denied.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    permissionDAO.remove(p);
    cleanUp(userContext);
  }


  // Try to delete a permission without permission to do so.
  void deletePermissionWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"deletePermissionWithoutPermissionThrows"});
    TEST_MESSAGE = "Cannot delete permissions without the appropriate 'delete' permission.";

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("permission.create");
    X userContext = generateTestUser(x, permissionIds);

    // Create a permission for the test user to update.
    Permission p = new Permission.Builder(x)
      .setId("ppet")
      .build();

    permissionDAO.remove(p);
    // Create the permission.
    p = (Permission) permissionDAO.inX(userContext).put(p).fclone();

    try {
      // Try to delete the permission.
      permissionDAO.inX(userContext).remove(p);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("Permission denied.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    permissionDAO.remove(p);
    cleanUp(userContext);
  }


  // Try to delete a group without permission to do so.
  void deleteGroupWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"deleteGroupWithoutPermissionThrows"});
    TEST_MESSAGE = "Cannot delete a group without the appropriate 'delete' permission.";

    // Create a test user.
    List permissionIds = new ArrayList();
    permissionIds.add("group.create.ppet");
    X userContext = generateTestUser(x, permissionIds);

    // Create a permission for the test user to update.
    Group g = new Group.Builder(x)
      .setId("ppet")
      .build();

    groupDAO.remove(g);
    // Create the group.
    g = (Group) groupDAO.inX(userContext).put(g).fclone();

    try {
      // Try to delete the group.
      groupDAO.inX(userContext).remove(g);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("You don't have permission to delete that group.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    groupDAO.remove(g);
    cleanUp(userContext);
  }


  // Try to remove a permission from a group without permission.
  void removePermissionFromGroupWithoutPermissionThrows(X x) {
    logger.info(new Object[] {"removePermissionFromGroupWithoutPermissionThrows"});
    TEST_MESSAGE = "Cannot remove permissions from groups without the appropriate permissions.";

    // Create a test user.
    List permissionIds = new ArrayList();
    X userContext = generateTestUser(x, permissionIds);

    try {
      // Try to remove "*" from "admin".
      GroupPermissionJunction j = new GroupPermissionJunction.Builder(x)
        .setSourceId("admin")
        .setTargetId("*")
        .build();
      groupPermissionJunctionDAO.inX(userContext).remove(j);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("You do not have permission to update that group.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    cleanUp(userContext);

    // Do it a second time but with permission to update the group this time, but
    // not the permission we're trying to remove. You should need both.

    // Create a test user.
    permissionIds = new ArrayList();
    permissionIds.add("group.update.admin");
    userContext = generateTestUser(x, permissionIds);

    try {
      // Try to remove "*" from "admin".
      GroupPermissionJunction j = new GroupPermissionJunction.Builder(x)
        .setSourceId("admin")
        .setTargetId("*")
        .build();
      groupPermissionJunctionDAO.inX(userContext).remove(j);

      // If the put didn't throw, then this test failed.
      test(false, TEST_MESSAGE);
    } catch (AuthorizationException e) {
      Boolean passed = e.getMessage().equals("Permission denied. You cannot add or remove a permission that you do not have.");
      test(passed, TEST_MESSAGE);
      if ( ! passed ) {
        print("Error message mismatch. Actual was: " + e.getMessage());
      }
    }

    // Clean up.
    cleanUp(userContext);
  }
}
