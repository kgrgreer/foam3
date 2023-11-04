/**
 * Copyright
 * @license 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.test',
  name: 'DigJsonDriverTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.dig.DIG',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.net.http.HttpResponse'
  ],

  properties: [
    {
      documentation: 'long time to support debugger debugging',
      name: 'requestTimeout',
      class: 'Long',
      value: 360000
    }
  ],

  methods: [
    {
      name: 'runTest',
      args: 'X x',
      javaCode: `
      // pull http from context to ensure it's started.
      test ( x.get("http") != null, "http initialized" );

      Logger logger = Loggers.logger(x, this);

      User user = new User();
      user.setId(102686180L);
      user.setSpid("test");
      user.setFirstName("test");
      user.setMiddleName("dig");
      user.setLastName("json");
      user.setEmail("test-dig-json-driver@foam.foam");
      user.setUserName("test-dig-json-driver");
      user.setGroup("test");
      user.setEmailVerified(true);
      user.setLifecycleState(LifecycleState.ACTIVE);
      user = (User) ((DAO)x.get("userDAO")).put(user);

      Session session = new Session();
      session.setUserId(user.getId());
      session = (Session) ((DAO) x.get("sessionDAO")).put(session);

      DIG client = new DIG.Builder(x)
        .setDaoKey("userDAO")
        .setSessionId(session.getId())
        .setRequestTimeout(getRequestTimeout())
        .build();

      User u = (User) client.find(user.getId());
      test ( u != null, "User found");

      HttpResponse response = (HttpResponse) client.getLastHttpResponse();
      String body = String.valueOf(response.body());
      test ( body != null && body.startsWith("{"), "Find return {...}");

      Object result = client.submit(x, DOP.SELECT, "q=group=test");
      test ( result != null, "Select results found");
      FObject[] results = (FObject[]) result;
      test ( results.length == 1, "Select size 1 "+results.length);

      response = (HttpResponse) client.getLastHttpResponse();
      body = String.valueOf(response.body());
      test ( body != null && body.startsWith("["), "Select return [...]");

      test_put_return_json_object(x);
      test_put_return_json_array(x);
      `
    },
    {
      name: 'test_put_return_json_object',
      args: 'Context x',
      javaCode: `
        var admin = newUser("test_put_return_json_object-admin");
        admin.setGroup("admin");
        admin = (User) ((DAO)x.get("userDAO")).put(admin);

        var session = createSession(x, admin.getId());
        var client = new DIG.Builder(x)
          .setDaoKey("userDAO")
          .setSessionId(session.getId())
          .setRequestTimeout(getRequestTimeout())
          .build();

        var user = newUser("test_put_return_json_object");
        try {
          user = (User) client.put(user);
          test ( user != null, "User created");

          var response = (HttpResponse) client.getLastHttpResponse();
          var body = String.valueOf(response.body());
          test ( body != null && body.startsWith("{"), "Put return {...}");
        } catch ( Exception e ) {
          test(false, "Failed test_put_return_json_object");
        } finally {
          removeUser(x, admin);
          removeUser(x, user);
        }
      `
    },
    {
      name: 'test_put_return_json_array',
      args: 'Context x',
      javaCode: `
        var admin = newUser("test_put_return_json_array-admin");
        admin.setGroup("admin");
        admin = (User) ((DAO)x.get("userDAO")).put(admin);

        var session = createSession(x, admin.getId());
        var client = new DIG.Builder(x)
          .setDaoKey("userDAO")
          .setSessionId(session.getId())
          .setRequestTimeout(getRequestTimeout())
          .build();

        var user1 = newUser("test_put_return_json_array1");
        var user2 = newUser("test_put_return_json_array2");
        try {
          var result = (FObject[]) client.submit(x, DOP.PUT, "[" +
            client.adapt(x, DOP.PUT, user1) + "," +
            client.adapt(x, DOP.PUT, user2) + "]");

          var created = result != null && result.length == 2;
          if ( created ) {
            user1 = (User) result[0];
            user2 = (User) result[1];
          }
          test ( created, "Two users created" );

          var response = (HttpResponse) client.getLastHttpResponse();
          var body = String.valueOf(response.body());
          test ( body != null && body.startsWith("["), "Put return [...]");
        } catch ( Exception e ) {
          test(false, "Failed test_put_return_json_array");
        } finally {
          removeUser(x, admin);
          removeUser(x, user1);
          removeUser(x, user2);
        }
      `
    },
    {
      name: 'createSession',
      type: 'Session',
      args: 'Context x, Long userId',
      javaCode: `
        var sessionDAO = (DAO) x.get("sessionDAO");
        var session = new Session();
        session.setUserId(userId);
        return (Session) sessionDAO.put(session);
      `
    },
    {
      name: 'removeUser',
      args: 'Context x, User user',
      javaCode: `
        var userDAO = (DAO) x.get("localUserDAO");
        var sessionDAO = (DAO) x.get("localSessionDAO");

        userDAO.remove(user);
        sessionDAO
          .where(EQ(Session.USER_ID, user.getId()))
          .select(new foam.dao.AbstractSink() {
            public void put(Object o, foam.core.Detachable d) {
              sessionDAO.remove((FObject) o);
            }
          });
      `
    },
    {
      name: 'newUser',
      type: 'User',
      args: 'String userName',
      javaCode: `
        var user = new User();
        user.setSpid("test");
        user.setFirstName(userName);
        user.setMiddleName("dig");
        user.setLastName("json");
        user.setEmail(userName + "@foam.foam");
        user.setUserName(userName);
        user.setGroup("test");
        user.setEmailVerified(true);
        user.setLifecycleState(LifecycleState.ACTIVE);
        return user;
      `
    }
  ]
})
