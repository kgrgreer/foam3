/**
 * Copyright
 * @license 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.test',
  name: 'GroupURLSessionTest',
  extends: 'foam.nanos.test.Test',

  documentation: 'Test session has correct url from group parent chain.',

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

      String childURL = "child";
      String parentURL = "parent";

      DAO groupDAO = (DAO) x.get("groupDAO");
      Group parent = (Group) groupDAO.find("test-api").fclone();
      String savedURL = parent.getUrl();
      try {
        parent.setUrl(parentURL);
        parent = (Group) groupDAO.put(parent);

        Group group = new Group();
        group.setId(this.getClass().getSimpleName());
        group.setParent(parent.getId());
        group = (Group) ((DAO) x.get("groupDAO")).put(group);

        User user = new User();
        user.setId(107595951L);
        user.setSpid("test");
        user.setFirstName("session");
        user.setMiddleName("group");
        user.setLastName("url");
        user.setEmail("test-session-group-url@nanopay.net");
        user.setUserName("test-session-group-url");
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
        // test ( u != null, "(1) Find successful");

        // session applyContext not available yet
        u = (User) client.find(user.getId());
        // test ( u != null, "(2) Find successful");

        session = (Session) ((DAO) x.get("sessionDAO")).find(session.getId());
        X applyContext = session.getApplyContext();
        // test ( applyContext != null, "(1) ApplyContext found");
        AppConfig cfg = (AppConfig) applyContext.get("appConfig");
        test ( parentURL.equals(cfg.getUrl()), "AppConfig has parent url  "+parentURL+ " "+cfg.getUrl());

        // Set child url
        group = (Group) group.fclone();
        group.setUrl(childURL);
        group = (Group) groupDAO.put(group);
        test ( childURL.equals(group.getUrl()), "Child group url updated");

        u = (User) client.find(user.getId());
        // test ( u != null, "(4) Find successful");

        session = (Session) ((DAO) x.get("sessionDAO")).find(session.getId());
        applyContext = session.getApplyContext();
        // test ( applyContext != null, "(3) ApplyContext found");
        cfg = (AppConfig) applyContext.get("appConfig");
        test ( childURL.equals(cfg.getUrl()), "AppConfig has child url  "+childURL+ " "+cfg.getUrl());
      } finally {
        parent = (Group) parent.fclone();
        parent.setUrl(savedURL);
        groupDAO.put(parent);
      }
      `
    }
  ]
})
