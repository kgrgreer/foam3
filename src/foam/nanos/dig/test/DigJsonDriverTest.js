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
    'foam.core.FOAMException',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.nanos.dig.DIG',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.List',
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
      User user = null;
      Group group = null;
      Session session = null;
      Region[] regions = new Region[2];
      List<GroupPermissionJunction> junctions = new ArrayList();
      DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
      Object result = null;
      FObject[] results = null;
      String body = null;
      HttpResponse response = null;

      try {
        group = new Group();
        group.setId("test-api-dig-json-driver");
        group.setParent("test-api");
        group = (Group) ((DAO) x.get("groupDAO")).put(group);

        user = new User();
        user.setId(102686180L);
        user.setSpid("test");
        user.setFirstName("test");
        user.setMiddleName("dig");
        user.setLastName("json");
        user.setEmail("test-dig-json-driver@foam.foam");
        user.setUserName("test-dig-json-driver");
        user.setGroup(group.getId());
        user.setEmailVerified(true);
        user.setLifecycleState(LifecycleState.ACTIVE);
        user = (User) ((DAO)x.get("userDAO")).put(user);

        session = new Session();
        session.setUserId(user.getId());
        session = (Session) ((DAO) x.get("sessionDAO")).put(session);

        // Permissions to modify region dao
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
        gpj.setTargetId("language.read.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));

        DIG client = new DIG.Builder(x)
          .setDaoKey("regionDAO")
          .setSessionId(session.getId())
          .setRequestTimeout(getRequestTimeout())
          .build();

        Region region = new Region();
        region.setCode("ZZ-T1");
        region.setCountryId("ZZ");
        region.setName("Test1");
        regions[0] = region;

        // Put 1
        try {
          region = (Region) client.put(region);
          test ( false, "Put (create) requires model.create permission");
        } catch (FOAMException e) {
          test ( true, "Put (create) requires model.create permission");
        }

        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.create");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));

        result = client.submit(x, DOP.PUT, client.adapt(x, DOP.PUT, region));
        test ( result instanceof FObject, "Put {} returned FObject");
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("{"), "Put {} returned {...}");

        Region region2 = new Region();
        region2.setCode("ZZ-T2");
        region2.setCountryId("ZZ");
        region2.setName("Test2");
        regions[1] = region2;

        // Put array
        try {
          result = client.submit(x, DOP.PUT, client.adapt(x, DOP.PUT, regions));
          test ( false, "Put (update) requires model.update.* permission");
        } catch (FOAMException e) {
          test ( true, "Put (update) requires model.update.* permission");
        }

        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.update.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));

        result = client.submit(x, DOP.PUT, client.adapt(x, DOP.PUT, regions));
        test ( result instanceof FObject[], "Put [{}] returned FObject[]");
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("["), "PUT [{}] returned [{...}]");

        // Find
        region = (Region) client.find(region.getId());
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("{"), "Find returned {...}");

        // Select all
        result = client.submit(x, DOP.SELECT, null);
        test ( result instanceof FObject[], "Select returned FObject[]");
        results = (FObject[]) result;
        test ( results.length > 1, "Select size > 1 "+results.length);
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("["), "Select size > 1 returned [...]");

        // Select with query should return array
        result = client.submit(x, DOP.SELECT, "q=name=Test2");
        test ( result instanceof FObject[], "Select q returned FObject[]");
        results = (FObject[]) result;
        test ( results.length == 1, "Select size q "+results.length);
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("["), "Select q returned [...]");

        // Select with id should act line Find
        result = client.submit(x, DOP.SELECT, "id=ZZ-T2");
        test ( result instanceof FObject, "Select id returned FObject");
        response = (HttpResponse) client.getLastHttpResponse();
        body = String.valueOf(response.body());
        test ( body != null && body.startsWith("{"), "Select id returned {...}");

        // Remove
        try {
          result = client.remove(region);
          test ( false, "Remove requires model.remove.* permission");
        } catch (FOAMException e) {
          test ( true, "Remove requires model.remove.* permission");
        }

        gpj = new GroupPermissionJunction();
        gpj.setSourceId(user.getGroup());
        gpj.setTargetId("region.remove.*");
        junctions.add((GroupPermissionJunction) groupPermissionJunctionDAO.put(gpj));

        client.remove(region);
        client.remove(region2);
        regions = null;
      } finally {
        if ( regions != null ) {
          for ( Region region : regions ) {
            if ( region != null ) ((DAO) x.get("regionDAO")).remove(region);
          }
        }
        ((DAO) x.get("userDAO")).remove(user);
        ((DAO) x.get("sessionDAO")).remove(session);
        ((DAO) x.get("groupDAO")).remove(group);
        for ( GroupPermissionJunction junction : junctions ) {
          groupPermissionJunctionDAO.remove(junction);
        }
      }
      `
    }
  ]
})
