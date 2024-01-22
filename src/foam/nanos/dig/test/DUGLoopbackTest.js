/**
 * Copyright
 * @license 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.test',
  name: 'DUGLoopbackTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'static foam.mlang.MLang.TRUE',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.nanos.dig.DIG',
    'foam.nanos.dig.DUGLoopback',
    'foam.nanos.jetty.HttpServer',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      documentation: 'long time to support debugger debugging',
      name: 'requestTimeout',
      class: 'Long',
      value: 360000
    },
    {
      name: 'dugData',
      class: 'FObjectProperty'
    }
  ],

  javaCode: `
    protected Object lock_ = new Object();
  `,

  methods: [
    {
      name: 'runTest',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      User user = null;
      Group group = null;
      Session session = null;
      List<Region> regions = new ArrayList();
      List<GroupPermissionJunction> junctions = new ArrayList();
      DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
      DAO dugLoopbackDAO = (DAO) x.get("dugLoopbackDAO");
      dugLoopbackDAO.listen(new Sink() {
        public void put(Object obj, Detachable sub) {
          DUGLoopback loopback = (DUGLoopback) obj;
          String data = loopback.getData();
          if ( ! SafetyUtil.isEmpty(data) ) {
            // TODO: thread local parser
            synchronized ( lock_ ) {
              setDugData((FObject) new JSONParser().parseString(data));
              lock_.notify();
            }
          }
        }
        public void remove(Object obj, Detachable sub) {}
        public void eof() {}
        public void reset(Detachable sub) {}
      }, TRUE);

      try {
        // pull http from context to ensure it's started.
        test ( x.get("http") != null, "http initialized" );
        test ( x.get("dugLoopback") != null, "dugLoopback initialized");

        user = new User();
        user.setId(129469309L);
        user.setSpid("test");
        user.setFirstName("loopback");
        user.setLastName("bucket");
        user.setEmail("dug-loopback-bucket@foam.foam");
        user.setUserName("dug-loopback-bucket");
        user.setGroup("test-api");
        user.setEmailVerified(true);
        user.setLifecycleState(LifecycleState.ACTIVE);
        user = (User) ((DAO)x.get("userDAO")).put(user);

        session = new Session();
        session.setUserId(user.getId());
        session = (Session) ((DAO) x.get("sessionDAO")).put(session);

        GroupPermissionJunction gpj = null;
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("service.regionDAO");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.read.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.create");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.update.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.remove.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));
        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("language.read.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));

        String name = "Test1";

        DAO regionDAO = (DAO) x.get("regionDAO");

        DIG client = new DIG.Builder(x)
          .setDaoKey("regionDAO")
          .setSessionId(session.getId())
          .setRequestTimeout(getRequestTimeout())
          .build();

        Region region = new Region();
        region.setCode("ZZ-T1");
        region.setCountryId("ZZ");
        region.setName(name);
        regions.add(region);

        Region r = (Region) client.put(region);
        r = (Region) client.find(region.getId());
        test ( r != null && name.equals(r.getName()), "Region name "+name+ " "+r.getName());
        Region dugR = (Region) getDUGContent(x);
        test ( dugR != null && name.equals(dugR.getName()), "DUG Region name "+name+" "+(dugR == null ? null : dugR.getName()));

        // NOTE: client.finds added after each put to give DUG rule time to run.
        // Without this, or an arbitrary sleep, results will be random

        name = "Test2";
        r.setName(name);
        r = (Region) regionDAO.put(r).fclone();
        r = (Region) client.find(r.getId());
        test ( r != null && name.equals(r.getName()), "Region name "+name+ " "+r.getName());
        dugR = (Region) getDUGContent(x);
        test ( dugR != null && name.equals(dugR.getName()), "DUG Region name "+name+" "+(dugR == null ? null : dugR.getName()));

        name = "Test3";
        r.setName(name);
        r = (Region) regionDAO.put(r).fclone();
        r = (Region) client.find(r.getId());
        test ( r != null && name.equals(r.getName()), "Region name "+name+ " "+r.getName());
        dugR = (Region) getDUGContent(x);
        test ( dugR != null && name.equals(dugR.getName()), "DUG Region name "+name+" "+(dugR == null ? null : dugR.getName()));

        // create another region
        name = "Test4";
        region = new Region();
        region.setCode("ZZ-T2");
        region.setCountryId("ZZ");
        region.setName(name);
        regions.add(region);
        r = (Region) client.put(region);
        r = (Region) client.find(r.getId());
        test ( r != null && name.equals(r.getName()), "Region name "+name+ " "+r.getName());
        dugR = (Region) getDUGContent(x);
        test ( dugR != null && name.equals(dugR.getName()), "DUG Region name "+name+" "+(dugR == null ? null : dugR.getName()));

        name = "Test5";
        r.setName(name);
        r = (Region) regionDAO.put(r).fclone();
        r = (Region) client.find(r.getId());
        test ( r != null && name.equals(r.getName()), "Region name "+name+ " "+r.getName());
        dugR = (Region) getDUGContent(x);
        test ( dugR != null && name.equals(dugR.getName()), "DUG Region name "+name+" "+(dugR == null ? null : dugR.getName()));

      } finally {
        for ( Region region : regions ) {
          ((DAO) x.get("regionDAO")).remove(region);
        }
        ((DAO) x.get("userDAO")).remove(user);
        ((DAO) x.get("sessionDAO")).remove(session);
        // ((DAO) x.get("groupDAO")).remove(group);
        for ( GroupPermissionJunction junction : junctions ) {
          groupPermissionJunctionDAO.remove(junction);
        }
      }
     `
    },
    {
      name: 'getDUGContent',
      args: 'X x',
      type: 'FObject',
      javaCode: `
      long waited = 0L;
      long waitTime = 100L;
      long maxWaitTime = 1000L;

      FObject data = null;
      synchronized ( lock_ ) {
        while ( data == null ) {
          data = getDugData();
          if ( data != null ) {
            DUG_DATA.clear(this);
            break;
          }
          try {
            if ( waited >= maxWaitTime ) {
              Loggers.logger(x, this).warning("DUG data not received in time");
              break;
            }
            lock_.wait(waitTime);
            waited += waitTime;
          } catch (InterruptedException e) {
            break;
          }
        }
      }
      return data;
      `
    }
  ]
})
