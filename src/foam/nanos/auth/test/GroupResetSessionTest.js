/**
 * Copyright
 * @license 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'GroupResetSessionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.dig.DIG',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.*',
    'foam.util.Auth'
  ],

  properties: [
    {
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
      Logger logger = Loggers.logger(x, this);

      // pull http from context to ensure it's started.
      test ( x.get("http") != null, "http initialized" );

      String url1 = "original";
      String url2 = "updated";
      String memo = url1;

      Group group = new Group();
      group.setId(this.getClass().getSimpleName());
      group.setParent("test-api");
      group.setUrl(url1);
      group = (Group) ((DAO) x.get("groupDAO")).put(group);

      User user = new User();
      user.setId(131562380L);
      user.setSpid("test");
      user.setFirstName("test");
      user.setMiddleName("session");
      user.setLastName("group");
      user.setEmail("test-session-group@nanopay.net");
      user.setUserName("test-session-group");
      user.setGroup(group.getId());
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
      test ( u != null, "(1) Find successful");

      // session applyContext not available yet
      u = (User) client.find(user.getId());
      test ( u != null, "(2) Find successful");

      session = (Session) ((DAO) x.get("sessionDAO")).find(session.getId());
      X applyContext = session.getApplyContext();
      test ( applyContext != null, "(1) ApplyContext found");
      AppConfig cfg = (AppConfig) applyContext.get("appConfig");
      test ( url1.equals(cfg.getUrl()), "(1) AppConfig url  "+url1+ " "+cfg.getUrl());

      session.setApplyContext(session.getApplyContext().put("memo", memo));

      // Change something other than url
      group = (Group) group.fclone();
      group.setSupportPhone("9055551212");
      group = (Group) ((DAO) x.get("groupDAO")).put(group);

      u = (User) client.find(user.getId());
      test ( u != null, "(3) Find successful");

      session = (Session) ((DAO) x.get("sessionDAO")).find(session.getId());
      applyContext = session.getApplyContext();
      test ( applyContext != null, "(2) ApplyContext found");
      cfg = (AppConfig) applyContext.get("appConfig");
      test ( url1.equals(cfg.getUrl()), "(2) AppConfig url  "+url1+ " "+cfg.getUrl());

      String data = (String) applyContext.get("memo");
      test ( memo.equals(data), "ApplyContext memo found (retained)");

      // Update url - should reset session applyContext
      group = (Group) group.fclone();
      group.setUrl(url2);
      group = (Group) ((DAO) x.get("groupDAO")).put(group);

      u = (User) client.find(user.getId());
      test ( u != null, "(4) Find successful");

      session = (Session) ((DAO) x.get("sessionDAO")).find(session.getId());
      applyContext = session.getApplyContext();
      test ( applyContext != null, "(3) ApplyContext found");
      cfg = (AppConfig) applyContext.get("appConfig");
      test ( url2.equals(cfg.getUrl()), "(3) AppConfig url  "+url2+ " "+cfg.getUrl());
      data = (String) applyContext.get("memo");
      test ( data == null, "ApplyContext memo not found (replaced)");
      `
    }
  ]
})
