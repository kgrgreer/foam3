/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.test',
  name: 'RenewableTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.*',
    'foam.core.*',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.*',
    'foam.nanos.crunch.*',
    'foam.time.TimeUnit',
    'foam.util.Auth'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
    DAO capabilityDAO = (DAO) x.get("localCapabilityDAO");
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    String name = "renewable-test";

      DAO userDAO = (DAO) x.get("localUserDAO");
      User user = (User) userDAO.find(EQ(User.USER_NAME, name));
      if ( user == null ) {
        user = new User();
        user.setUserName(name);
        user.setFirstName(name);
        user.setLastName("Test");
        user.setEmail(name+"@test.com");
        user.setEmailVerified(true);
        user.setSpid("test");
        user.setGroup("test");
      } else if ( user.getLifecycleState() == LifecycleState.DELETED ) {
        user = (User) user.fclone();
        user.setLifecycleState(LifecycleState.ACTIVE);
      }
      user = (User) userDAO.put_(x, user);

      GroupPermissionJunction gpj = new GroupPermissionJunction();
      gpj.setSourceId(user.getGroup());
      gpj.setTargetId("rule.read.*");
      ((DAO) x.get("groupPermissionJunctionDAO")).put(gpj);
      gpj = new GroupPermissionJunction();
      gpj.setSourceId(user.getGroup());
      gpj.setTargetId("service.crunchService.updateUserContext");
      ((DAO) x.get("groupPermissionJunctionDAO")).put(gpj);

    Capability c = new Capability.Builder(x)
      .setId(name)
      .setGrantMode(CapabilityGrantMode.MANUAL)
      .setExpiryPeriod(10)
      .setExpiryPeriodTimeUnit(TimeUnit.MILLISECOND)
      .setGracePeriod(10)
      .setGracePeriodTimeUnit(TimeUnit.MILLISECOND)
      .build();
    c = (Capability) capabilityDAO.put(c);

      gpj = new GroupPermissionJunction();
      gpj.setSourceId(user.getGroup());
      gpj.setTargetId("capability.read."+c.getId());
      ((DAO) x.get("groupPermissionJunctionDAO")).put(gpj);

    UserCapabilityJunction ucjC = new UserCapabilityJunction.Builder(x)
      .setSourceId(user.getId())
      .setTargetId(c.getId())
      .setStatus(CapabilityJunctionStatus.ACTION_REQUIRED)
      .build();

    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucjC);

    test ( ucjC.getStatus() == CapabilityJunctionStatus.ACTION_REQUIRED, "UCJ action required "+ucjC.getStatus());
    test ( ucjC.getExpiry() == null, "UCJ expiry not set "+ucjC.getExpiry());
    test ( ucjC.getIsRenewable() == false, "UCJ not yet renewable");

    CrunchService service = (CrunchService) x.get("crunchService");
    ucjC = service.updateJunctionFor(x, c.getId(), null, CapabilityJunctionStatus.PENDING, user, user);
    ucjC = service.updateJunctionFor(x, c.getId(), null, CapabilityJunctionStatus.GRANTED, user, user);

    test ( ucjC.getStatus() == CapabilityJunctionStatus.GRANTED, "UCJ granted "+ucjC.getStatus());

    // query as rules are after rules
    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucjC.getId());
    test ( ucjC.getExpiry() != null, "UCJ expiry set");
    test ( ucjC.getIsRenewable() == true, "UCJ now renewable");
    test ( ucjC.isInRenewalPeriod(x) == true, "UCJ in renewal period");
    test ( ucjC.isInGracePeriod(x) == false, "UCJ not in grace period");

    // wait expiry 
    Thread.sleep(10L);
    test ( ucjC.getStatus() == CapabilityJunctionStatus.GRANTED, "UCJ istill granted");
    test ( ucjC.getIsRenewable() == true, "UCJ still renewable");
    test ( ucjC.isInRenewalPeriod(x) == false, "UCJ not in renewal period");
    test ( ucjC.isInGracePeriod(x) == true, "UCJ in grace period");

    // wait grace period
    Thread.sleep(10L);
    test ( ucjC.getIsRenewable() == false, "UCJ no longer renewable");
    test ( ucjC.isInRenewalPeriod(x) == false, "UCJ not in renewal period");
    test ( ucjC.isInGracePeriod(x) == false, "UCJ not in grace period");

    // a put or cron job is required for this
    test ( ucjC.getStatus() == CapabilityJunctionStatus.EXPIRED, "UCJ iexpired");
    `
    }
  ]
})
