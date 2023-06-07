/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.test',
  name: 'AnalyticEventDAOSecurityTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.util.Auth',
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // test open to write, restricted to read/select

        DAO rawAnalyticEventDAO = new MDAO(AnalyticEvent.getOwnClassInfo());

        AuthService auth = (AuthService) x.get("auth");
        ((DAO) x.get("localGroupDAO")).put(new Group.Builder(x).setId("test").build());
        // DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
        // groupPermissionJunctionDAO.where(EQ(GroupPermissionJunction.SOURCE_ID, "test")).removeAll();

        DAO userDAO = new MDAO(User.getOwnClassInfo());

        X y = x.put("userDAO", userDAO);
        y = y.put("localUserDAO", userDAO);

        DAO analyticEventDAO = new foam.nanos.auth.AuthorizationDAO.Builder(y)
           .setDelegate(rawAnalyticEventDAO)
           .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(AnalyticEvent.class.getSimpleName().toLowerCase()))
           .build();
        analyticEventDAO = analyticEventDAO.inX(y);

        User user = new User.Builder(y)
          .setId(99995)
          .setEmail("test@example.com")
          .setFirstName("first")
          .setLastName("last")
          .setGroup("test")
          .setLifecycleState(LifecycleState.ACTIVE)
          .build();
        user = (User) userDAO.put(user);
        y = Auth.sudo(y, user);

        String sessionId = "B9D29B32-A56A-4CD1-8FFA-B4B1984EE063";

        // create analytic event
        AnalyticEvent event = new AnalyticEvent();
        event.setName("test");
        event.setSessionId(sessionId);

        try {
          event = (AnalyticEvent) analyticEventDAO.put(event);
          test ( true, "Regular user can put");
          test (event.getSessionId().equals(sessionId.split("-")[0]), "Session id truncated");
        } catch (Throwable t) {
          test ( false, "Regular user can put. "+t.getMessage());
        }
        // select as admin or without auth
        List<AnalyticEvent> events = (List) ((ArraySink) rawAnalyticEventDAO.select(new ArraySink())).getArray();
        test ( events.size() > 0, "No auth select allowed");

        // attempt to select events
        try {
          events = (List) ((ArraySink) analyticEventDAO.inX(y).select(new ArraySink())).getArray();
          test ( events.size() == 0, "Auth select denied");
        } catch (Throwable t) {
          test ( true, "Auth select denied. "+t.getMessage());
        }

      `
    }
  ]
})
