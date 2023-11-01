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
      `
    }
  ]
})
