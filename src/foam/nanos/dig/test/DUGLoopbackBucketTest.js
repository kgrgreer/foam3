/**
 * Copyright
 * @license 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.test',
  name: 'DUGLoopbackBucketTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.nanos.dig.DIG',
    'foam.nanos.dig.DUGRule',
    'foam.nanos.dig.DUGLoopbackBucket',
    'foam.nanos.jetty.HttpServer',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.ruler.Rule',
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
      Logger logger = Loggers.logger(x, this);

      // pull http from context to ensure it's started.
      test ( x.get("http") != null, "http initialized" );
      test ( x.get("dugLoopbackBucket") != null, "dugLoopbackBucket initialized");

      User user = new User();
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

      Session session = new Session();
      session.setUserId(user.getId());
      session = (Session) ((DAO) x.get("sessionDAO")).put(session);

      String name = "Test1";

      DAO regionDAO = (DAO) x.get("regionDAO");

      Region region = new Region();
      region.setCode("ZZ-T1");
      region.setCountryId("ZZ");
      region.setName(name);
      region = (Region) regionDAO.put(region);

      DIG client = new DIG.Builder(x)
        .setDaoKey("regionDAO")
        .setSessionId(session.getId())
        .setRequestTimeout(getRequestTimeout())
        .build();

      Region r = (Region) client.find(region.getId());
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
      r = (Region) regionDAO.put(region).fclone();
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
      `
    },
    {
      name: 'getDUGContent',
      args: 'X x',
      type: 'FObject',
      javaCode: `
      DUGLoopbackBucket dug = (DUGLoopbackBucket) x.get("dugLoopbackBucket");
      String content = dug.getContent();
      if ( ! SafetyUtil.isEmpty(content) ) {
        return (FObject) new JSONParser().parseString(content);
      }
      return null;
      `
    }
  ]
})
