/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch.crunchtest;

import foam.core.*;
import foam.dao.*;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;
import foam.nanos.crunch.*;
import foam.nanos.crunch.predicate.*;
import java.util.*;
import static foam.mlang.MLang.*;
import static foam.nanos.crunch.CapabilityJunctionStatus.*;

public class PredicatedPCJDAOTest extends foam.nanos.test.Test {

  DAO capabilityDAO, userCapabilityJunctionDAO, prerequisiteCapabilityJunctionDAO, userDAO;
  User user, admin;
  X testX, userX, adminX;
  Capability cap, prereq, testPrereq, mockSpidPrereq;

  public void runTest(X x) {
    capabilityDAO = (DAO) x.get("capabilityDAO");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    userDAO = (DAO) x.get("localUserDAO");

    user = new User.Builder(x).setId(101L).setSpid("mockSpid").setEmail("user@mock.spid").setUserName("mock_user").setGroup("anonymous").setFirstName("user").setLastName("mock").setLifecycleState(LifecycleState.ACTIVE).build();
    admin = new User.Builder(x).setId(1234L).setSpid("mockSpid").setEmail("admin@mock.spid").setUserName("mock_admin").setGroup("admin").setFirstName("admin").setLastName("mock").setLifecycleState(LifecycleState.ACTIVE).build();
    user = (User) userDAO.put(user);
    admin = (User) userDAO.put(admin);
    userX = x.put("subject", new Subject(user));
    adminX = x.put("subject", new Subject(admin));

    Predicate isTestSpid = new IsSpid.Builder(x).setSpids(new String[]{"test"}).build();
    Predicate isMockSpid = new IsSpid.Builder(x).setSpids(new String[]{"mockSpid"}).build();

    cap = new Capability.Builder(x).setId("cap").setAutoGrantPrereqs(false).build();
    prereq = new Capability.Builder(x).setId("prereq").build();
    testPrereq = new Capability.Builder(x).setId("testPrereq").build();
    mockSpidPrereq = new Capability.Builder(x).setId("mockSpidPrereq").build();
    cap = (Capability) capabilityDAO.put(cap);
    prereq = (Capability) capabilityDAO.put(prereq);
    testPrereq = (Capability) capabilityDAO.put(testPrereq);
    mockSpidPrereq = (Capability) capabilityDAO.put(mockSpidPrereq);
    
    CapabilityCapabilityJunction capToPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("prereq")
      .build();
    CapabilityCapabilityJunction capToTestPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("testPrereq")
      .setPredicate(isTestSpid)
      .build();
    CapabilityCapabilityJunction capTomockSpidPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("mockSpidPrereq")
      .setPredicate(isMockSpid)
      .build();
    prerequisiteCapabilityJunctionDAO.put(capToPrereq);
    prerequisiteCapabilityJunctionDAO.put(capToTestPrereq);
    prerequisiteCapabilityJunctionDAO.put(capTomockSpidPrereq);

    testPredicatedCCJFind();
    testPredicatedCCJSelect();
    testUserUCJGranting(x);

  }

  public void testPredicatedCCJFind() {
    // test user access
    CapabilityCapabilityJunction userFindCTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(userX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "prereq")));
    CapabilityCapabilityJunction userFindCTTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(userX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "testPrereq")));
    CapabilityCapabilityJunction userFindCTNP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(userX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "mockSpidPrereq")));
    test(userFindCTP != null, "user can see ccj[cap, prereq]");
    test(userFindCTTP == null, "user cannot see ccj[cap, testPrereq]");
    test(userFindCTNP != null, "user can see ccj[cap, mockSpidPrereq]");
    // test admin access
    CapabilityCapabilityJunction adminFindCTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "prereq")));
    CapabilityCapabilityJunction adminFindCTTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "testPrereq")));
    CapabilityCapabilityJunction adminFindCTNP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "mockSpidPrereq")));
    test(adminFindCTP != null, "admin can see ccj[cap, prereq]");
    test(adminFindCTTP != null, "admin can see ccj[cap, testPrereq]");
    test(adminFindCTNP != null, "admin can see ccj[cap, mockSpidPrereq]");
  }

  public void testPredicatedCCJSelect() {
    // test user access
    List<CapabilityCapabilityJunction> userSelect = ((ArraySink) prerequisiteCapabilityJunctionDAO.inX(userX).where(EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap")).select(new ArraySink())).getArray();
    test(userSelect.size() == 2, "user select yields 2 prereqs: " + userSelect);
    // test admin access
    List<CapabilityCapabilityJunction> adminSelect = ((ArraySink) prerequisiteCapabilityJunctionDAO.inX(adminX).where(EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap")).select(new ArraySink())).getArray();
    test(adminSelect.size() == 3, "admin select yields 3 prereqs: " + adminSelect);
  }

  public void testUserUCJGranting(X x) {
    // part 1 - test non-admin user - "cap" should become granted for user as long as the user has been granted all the prerequisites 
    // they can see, i.e., mockSpidPrereq
    UserCapabilityJunction n_ucjP = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(prereq.getId()).build();
    UserCapabilityJunction n_ucjTP = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(testPrereq.getId()).build();
    UserCapabilityJunction n_ucjNP = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(mockSpidPrereq.getId()).build();
    UserCapabilityJunction n_ucjC = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId(cap.getId()).build();
    n_ucjP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(userX).put(n_ucjP);
    n_ucjTP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(userX).put(n_ucjTP);
    n_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(userX).put(n_ucjC); 
    // Testing when all prerequisites of "cap" are granted except for the capability satisfied by 
    // the capabilityCapabilityPredicate (user.isSpid=mockSpid) between capability "cap" and capability "mockSpidPrereq".
    // Results in "cap" not being GRANTED.
    test(n_ucjP.getStatus() == GRANTED, "prereq is granted for testUser: " + n_ucjP.getStatus());
    test(n_ucjTP.getStatus() == GRANTED, "testPrereq is granted for testUser: " + n_ucjTP.getStatus());
    test(n_ucjC.getStatus() != GRANTED, "cap is not granted for testUser: " + n_ucjC.getStatus());

    // After adding the missing prerequisite, test if "cap" becomes granted
    n_ucjNP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(userX).put(n_ucjNP);
    test(n_ucjNP.getStatus() == GRANTED, "mockSpidPrereq is granted for testUser: " + n_ucjNP.getStatus());
    n_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(userX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(n_ucjC.getStatus() == GRANTED, "cap is granted for testUser: " + n_ucjC.getStatus());

    // part 2 - test admin user. Since admin users have permission to view all prerequisites, the top-level ucj "cap" will not become GRANTED until all prerequisites are GRANTED
    UserCapabilityJunction a_ucjP = new UserCapabilityJunction.Builder(x).setSourceId(admin.getId()).setTargetId(prereq.getId()).build();
    UserCapabilityJunction a_ucjTP = new UserCapabilityJunction.Builder(x).setSourceId(admin.getId()).setTargetId(testPrereq.getId()).build();
    UserCapabilityJunction a_ucjNP = new UserCapabilityJunction.Builder(x).setSourceId(admin.getId()).setTargetId(mockSpidPrereq.getId()).build();
    UserCapabilityJunction a_ucjC = new UserCapabilityJunction.Builder(x).setSourceId(admin.getId()).setTargetId(cap.getId()).build();
    // Testing when all prerequisites of "cap" are granted except for prerequisite where the predicate returns true for users in 'test' spid
    // if the ucj owner did not have permission "predicatedprerequisite.read.*",
    // this should satisfy the prerequiste requirement for "cap", but since admin users have the permission
    // the prerequisitejunction between cap and testPrereq is also available. 
    // Results in "cap" not being GRANTED until the testPrereq is GRANTED
    a_ucjNP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjNP);
    a_ucjP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjP);
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjC);
    test(a_ucjP.getStatus() == GRANTED, "prereq is granted for admin: " + a_ucjP.getStatus());
    test(a_ucjNP.getStatus() == GRANTED, "mockSpidPrereq is granted for admin: " + a_ucjNP.getStatus());
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, admin.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(a_ucjC.getStatus() != GRANTED, "cap is not granted for admin: " + a_ucjC.getStatus());

    // after granting "testPrereq" for admin user, "cap" becomes granted
    a_ucjTP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjTP);
    test(a_ucjTP.getStatus() == GRANTED, "testPrereq is granted for admin: " + a_ucjTP.getStatus());
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, admin.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(a_ucjC.getStatus() == GRANTED, "cap is granted for admin: " + a_ucjC.getStatus());
  }
}
