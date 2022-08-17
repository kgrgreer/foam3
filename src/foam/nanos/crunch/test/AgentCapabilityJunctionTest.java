/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package  foam.nanos.crunch.test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.Consumer;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Subscription;
import foam.nanos.auth.LifecycleAware;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.crunch.AgentCapabilityJunction;
import foam.nanos.test.Test;
import net.nanopay.model.Business;

import static foam.mlang.MLang.*;
import static foam.mlang.MLang.EQ;

/**
 * Test cases for AgentCapabilityJunctions.
 *
 * This test exists because of the odd nature of ACJs,
 * they add a third dimension to the many:many relationship.
 * UCJs are user -> spid.
 * ACJs are user -> spid, effectiveUser
 */

//
public class AgentCapabilityJunctionTest extends Test {
  private static final String SPID_NAME = "test-spid";

  private static final long BASE_USERID = 999988840;

  private static final long USER_A_ID = BASE_USERID + 1;

  private static final long USER_B_ID = BASE_USERID + 2;

  private static final long BUSINESS_A_ID = BASE_USERID + 10;

  private static final long BUSINESS_B_ID = BASE_USERID + 11;


  public void runTest(foam.core.X x) throws Throwable {
    User userA = new User.Builder(x)
      .setId(USER_A_ID)
      .setSpid(SPID_NAME)
      .setFirstName("Testuser")
      .setLastName("A")
      .build();

    User userB = new User.Builder(x)
      .setId(USER_B_ID)
      .setSpid(SPID_NAME)
      .setFirstName("Testuser")
      .setLastName("B")
      .build();

    Business businessA = new Business.Builder(x)
      .setId(BUSINESS_A_ID)
      .setSpid(SPID_NAME)
      .setFirstName("Testbusiness")
      .setLastName("A")
      .build();

    Business businessB = new Business.Builder(x)
      .setId(BUSINESS_B_ID)
      .setSpid(SPID_NAME)
      .setFirstName("Testbusiness")
      .setLastName("B")
      .build();

    DAO userDao = (DAO)x.get("userDAO");
    putMultipleAndRemoveAfter(Arrays.asList(userA,userB,businessA,businessB), userDao, ()->{
      testOneUserMultipleRepresentatives(x);
      // testMultipleUsersSameRepresentative(ucjDAO);
      // testOneUserOneRepresentative(ucjDAO);
    });
  }

  public void testOneUserMultipleRepresentatives(X x) {
    DAO userDao = (DAO)x.get("userDAO");
    DAO ucjDao = (DAO)x.get("userCapabilityJunctionDAO");

    User userA = (User)userDao.find(USER_A_ID);
//    User businessA = (User)userDAO.find(BUSINESS_A_ID);

    Subject subject = new Subject.Builder(x)
      .setUser(userA)
      .setRealUser(userA)
      .build();

    // crunch.onboarding.signing-officer-information
    AgentCapabilityJunction acjA = new AgentCapabilityJunction();
    acjA.setSourceId(USER_A_ID);
    acjA.setTargetId("crunch.onboarding.signing-officer-information");
    acjA.setLifecycleState(LifecycleState.ACTIVE);
    acjA.setEffectiveUser(1);

    putAndRemoveAfter( acjA, ucjDao, uAcjA -> {
      AgentCapabilityJunction acjB = new AgentCapabilityJunction();
      acjB.setSourceId(USER_A_ID);
      acjB.setTargetId("crunch.onboarding.signing-officer-information");
      acjB.setLifecycleState(LifecycleState.ACTIVE);
      acjB.setEffectiveUser(5);
      putAndRemoveAfter( acjB, ucjDao, uAcjB -> {
        // --- make sure that the ACJs have been stored ---
        ArraySink sink = new ArraySink();
        ucjDao.where(
          AND(
            EQ(AgentCapabilityJunction.SOURCE_ID,9100),
            EQ(AgentCapabilityJunction.TARGET_ID,"test"),
            EQ(AgentCapabilityJunction.LIFECYCLE_STATE,LifecycleState.ACTIVE)
          )
        ).select(sink);
        var acjsReadBack = sink.getArray();

        // conditions to pass:
        // size must be 2
        // both acjA / acjB must be found in the list
        expect( acjsReadBack.size(), 2, "testOneUserMultipleRepresentatives: two ACJs were read back");
        test( acjsReadBack.contains(uAcjA), "testOneUserMultipleRepresentatives: first ACJ (sourceid=9100/targetId=test) was present");
        test( acjsReadBack.contains(uAcjB), "testOneUserMultipleRepresentatives: second ACJ (sourceid=9100/targetId=test) was present");

        // --- check how getJunctionForSubject() behaves --
        // capability to check is: crunch.onboarding.signing-officer-information


      });
    });

  }

  public void testMultipleUsersSameRepresentative(DAO ucjDao) {

    AgentCapabilityJunction acjA = new AgentCapabilityJunction();
    acjA.setSourceId(9100);
    acjA.setTargetId("test");
    acjA.setLifecycleState(LifecycleState.ACTIVE);
    acjA.setEffectiveUser(1);

    putAndRemoveAfter( ucjDao, acjA, uAcjA -> {
      AgentCapabilityJunction acjB = new AgentCapabilityJunction();
      acjB.setSourceId(9101);
      acjB.setTargetId("test");
      acjB.setLifecycleState(LifecycleState.ACTIVE);
      acjB.setEffectiveUser(1);
      putAndRemoveAfter( ucjDao, acjB, uAcjB -> {
        // conditions to pass: same as above
        ArraySink sink = new ArraySink();
        ucjDao.where(
          AND(
            OR(
              EQ(AgentCapabilityJunction.SOURCE_ID,9100),
              EQ(AgentCapabilityJunction.SOURCE_ID,9101)
            ),
            EQ(AgentCapabilityJunction.TARGET_ID,"test"),
            EQ(AgentCapabilityJunction.LIFECYCLE_STATE,LifecycleState.ACTIVE)
          )
        ).select(sink);
        var acjsReadBack = sink.getArray();

        expect( acjsReadBack.size(), 2, "testOneUserMultipleRepresentatives: two ACJs were read back");
        test( acjsReadBack.contains(uAcjA), "testOneUserMultipleRepresentatives: first ACJ (sourceid=9100/targetId=test) was present");
        test( acjsReadBack.contains(uAcjB), "testOneUserMultipleRepresentatives: second ACJ (sourceid=9100/targetId=test) was present");
      });
    });

  }

  public void testOneUserOneRepresentative(DAO ucjDao) {

    AgentCapabilityJunction acjA = new AgentCapabilityJunction();
    acjA.setSourceId(9100);
    acjA.setTargetId("test");
    acjA.setLifecycleState(LifecycleState.ACTIVE);
    acjA.setEffectiveUser(1);

    putAndRemoveAfter( ucjDao, acjA, uAcjA -> {
      ArraySink sink = new ArraySink();
      ucjDao.where(
        AND(
          EQ(AgentCapabilityJunction.SOURCE_ID,9100),
          EQ(AgentCapabilityJunction.TARGET_ID,"test"),
          EQ(AgentCapabilityJunction.LIFECYCLE_STATE,LifecycleState.ACTIVE)
        )
      ).select(sink);
      var acjsReadBack = sink.getArray();
      expect( acjsReadBack.size(), 1, "testOneUserMultipleRepresentatives: acjA search returned one result");
      test( acjsReadBack.contains(uAcjA), "testOneUserMultipleRepresentatives: acjA search returned acjA");
    });

    AgentCapabilityJunction acjB = new AgentCapabilityJunction();
    acjB.setSourceId(9101);
    acjB.setTargetId("test");
    acjB.setLifecycleState(LifecycleState.ACTIVE);
    acjB.setEffectiveUser(2);

    putAndRemoveAfter( ucjDao, acjB, uAcjB -> {
      ArraySink sink = new ArraySink();
      ucjDao.where(
        AND(
          EQ(AgentCapabilityJunction.SOURCE_ID,9101),
          EQ(AgentCapabilityJunction.TARGET_ID,"test"),
          EQ(AgentCapabilityJunction.LIFECYCLE_STATE,LifecycleState.ACTIVE)
        )
      ).select(sink);
      var acjsReadBack = sink.getArray();
      expect( acjsReadBack.size(), 1, "testOneUserMultipleRepresentatives: acjB search returned one result");
      test( acjsReadBack.contains(uAcjB), "testOneUserMultipleRepresentatives: acjB search returned acjA");
    });

  }

  public <T extends FObject> void putMultipleAndRemoveAfter(List<T> objs, DAO dao, Runnable andThen) {
    // as long as we have items
    // take one off the list and keep recurring until all have been put
    // once andThen returns we're already in the finally block
    // and remove() will get called from then on
    if ( !objs.isEmpty() ) {
      List<T> copy = new ArrayList<>(objs);
      T obj = copy.remove(0);
      putAndRemoveAfter(obj, dao, a -> putMultipleAndRemoveAfter(copy, dao, andThen));
    } else {
      andThen.run();
    }
  }

  public <T extends FObject,
    U extends FObject> void putAndRemoveAfter(T fobj, DAO dao, Consumer<U> andThen) {
    // object returned from DAO is never guaranteed
    // to be the same going out as what came in
    U updated = (U)dao.put(fobj);
    System.out.println("--> "+fobj.toString());
    try {
      andThen.accept(updated);
    } finally {
      // this code isn't functionally correct for all DAOs,
      // it assumes the object that comes out is the one we put in.

      System.out.println("<-- "+fobj.toString());
      if ( updated instanceof LifecycleAware) {
        ((LifecycleAware) updated).setLifecycleState(LifecycleState.DELETED);
        dao.put(updated);
      } else {
        dao.remove(updated);
      }
    }
  }


}
