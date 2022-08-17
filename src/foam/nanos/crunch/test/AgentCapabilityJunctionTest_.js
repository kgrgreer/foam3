/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.test',
  name: 'AgentCapabilityJunctionTest',
  extends: 'foam.nanos.test.Test',
  documentation: `
  Test cases for AgentCapabilityJunctions.

  This test exists because of the odd nature of ACJs,
  they add a third dimension to the many:many relationship.

  UCJs are user -> spid.
  ACJs are user -> spid, effectiveUser

  ACJs/UCJs both use GUIDs at their heart so the tests should
  and will pass.
  `,
  javaImports: [
    'java.util.function.Consumer',
    'java.util.Arrays',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',

    'static foam.mlang.MLang.*'
  ],
  methods: [
    {
      name: 'runTest',
      javaCode: `

      DAO ucjDAO = (DAO)x.get("userCapabilityJunctionDAO");

      testOneUserMultipleRepresentatives(ucjDAO);
      // testMultipleUsersSameRepresentative(ucjDAO);
      // testOneUserOneRepresentative(ucjDAO);
      `
    },
    {
      name: 'testOneUserMultipleRepresentatives',
      args: 'DAO ucjDao',
      javaCode: `
      CrunchService crunchService = (CrunchService)x.get("crunchService");

      // crunch.onboarding.signing-officer-information
      AgentCapabilityJunction acjA = new AgentCapabilityJunction();
      acjA.setSourceId(9100);
      acjA.setTargetId("test");
      acjA.setLifecycleState(LifecycleState.ACTIVE);
      acjA.setEffectiveUser(1);

      putAndCleanUpAfterwards( ucjDao, acjA, uAcjA -> {
        AgentCapabilityJunction acjB = new AgentCapabilityJunction();
        acjB.setSourceId(9100);
        acjB.setTargetId("test");
        acjB.setLifecycleState(LifecycleState.ACTIVE);
        acjB.setEffectiveUser(5);
        putAndCleanUpAfterwards( ucjDao, acjB, uAcjB -> {
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



          // public UserCapabilityJunction getJunctionForSubject(
          // X x, String capabilityId, Subject subject

        });
      });
      `
    },
    {
      name: 'testMultipleUsersSameRepresentative',
      args: 'DAO ucjDao',
      javaCode: `
      AgentCapabilityJunction acjA = new AgentCapabilityJunction();
      acjA.setSourceId(9100);
      acjA.setTargetId("test");
      acjA.setLifecycleState(LifecycleState.ACTIVE);
      acjA.setEffectiveUser(1);

      putAndCleanUpAfterwards( ucjDao, acjA, uAcjA -> {
        AgentCapabilityJunction acjB = new AgentCapabilityJunction();
        acjB.setSourceId(9101);
        acjB.setTargetId("test");
        acjB.setLifecycleState(LifecycleState.ACTIVE);
        acjB.setEffectiveUser(1);
        putAndCleanUpAfterwards( ucjDao, acjB, uAcjB -> {
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
      `
    },
    {
      name: 'testOneUserOneRepresentative',
      args: 'DAO ucjDao',
      javaCode: `
      AgentCapabilityJunction acjA = new AgentCapabilityJunction();
      acjA.setSourceId(9100);
      acjA.setTargetId("test");
      acjA.setLifecycleState(LifecycleState.ACTIVE);
      acjA.setEffectiveUser(1);

      putAndCleanUpAfterwards( ucjDao, acjA, uAcjA -> {
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

      putAndCleanUpAfterwards( ucjDao, acjB, uAcjB -> {
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
      `
    },
    {
      name: 'putAndCleanUpAfterwards',
      args: 'DAO dao, AgentCapabilityJunction acj, Consumer<AgentCapabilityJunction> andThen',
      javaCode: `
      AgentCapabilityJunction updatedAcj = (AgentCapabilityJunction)ucjDao.put(acj);
      try {
        andThen.accept(updatedAcj);
      } finally {
        updatedAcj.setLifecycleState(LifecycleState.DELETED);
        ucjDao.put(updatedAcj);
      }
      `
    }
  ]
});
