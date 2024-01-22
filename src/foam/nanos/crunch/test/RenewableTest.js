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
    'foam.util.Auth',
    'java.time.*',
    'java.time.temporal.*',
    'java.util.Date'
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

      // A user would not normaly have this permission,
      // but it's required to allow support manual status
      // changes that this test case is trying to step through. 
      gpj = new GroupPermissionJunction();
      gpj.setSourceId(user.getGroup());
      gpj.setTargetId("service.crunchService.unsafeSetStatus");
      ((DAO) x.get("groupPermissionJunctionDAO")).put(gpj);

    Capability c = new Capability.Builder(x)
      .setId(name)
      .setGrantMode(CapabilityGrantMode.MANUAL)
      .setTimeZone(ZoneId.systemDefault().toString())
      .setRenewalPeriod(2)
      .setRenewalPeriodTimeUnit(TimeUnit.SECOND)
      .setExpiryPeriod(6)
      .setExpiryPeriodTimeUnit(TimeUnit.SECOND)
      .setGracePeriod(2)
      .setGracePeriodTimeUnit(TimeUnit.SECOND)
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

    // test Renewable Date calculations
    Renewable ren = (Renewable) ucjC;
    Date now = new Date();
    Date later = ren.calculateDate(x, now, 1, TimeUnit.SECOND);
    test ( later.getTime() - now.getTime() == 1000, "Calculate Date");

    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucjC);

    test ( ucjC.getStatus() == CapabilityJunctionStatus.ACTION_REQUIRED, "UCJ action required "+ucjC.getStatus());
    test ( ucjC.getExpiry() == null, "UCJ expiry not set "+ucjC.getExpiry());
    test ( ucjC.getIsRenewable() == false, "UCJ not yet renewable");

    CrunchService service = (CrunchService) x.get("crunchService");
    ucjC = service.updateJunctionFor(x, c.getId(), null, CapabilityJunctionStatus.PENDING, user, user);
    ucjC = service.updateJunctionFor(x, c.getId(), null, CapabilityJunctionStatus.GRANTED, user, user);

    test ( ucjC.getStatus() == CapabilityJunctionStatus.GRANTED, "UCJ status GRANTED "+ucjC.getStatus());

    // query as rules are after rules
    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucjC.getId());
    test ( ucjC.getExpiry() != null, "UCJ expiry set");
    test ( ucjC.getIsRenewable() == true, "UCJ is renewable");
    test ( ucjC.isInRenewalPeriod(x) == false, "UCJ not in renewal period");
    test ( ucjC.isNotYetInRenewalPeriod(x) == true, "UCJ not yet in renewal period");
    test ( ucjC.isInGracePeriod(x) == false, "UCJ not expired, not in grace period");

    // wait until in renewal period
    Thread.sleep(4000L);
    test ( ucjC.getExpiry() != null, "UCJ expiry still set");
    test ( ucjC.getIsRenewable() == true, "UCJ still renewable");
    test ( ucjC.isInRenewalPeriod(x) == true, "UCJ in renewal period");
    test ( ucjC.isNotYetInRenewalPeriod(x) == false, "UCJ past not yet in renewal period");
    test ( ucjC.isInGracePeriod(x) == false, "UCJ not expired, not yet in grace period");
    test ( ucjC.getStatus() != CapabilityJunctionStatus.EXPIRED, "UCJ status not EXPIRED "+ucjC.getStatus());

    // wait expiry 
    Thread.sleep(2000L);
    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucjC.getId());
    test ( ucjC.getStatus() == CapabilityJunctionStatus.GRANTED, "UCJ istill granted");
    test ( ucjC.getIsRenewable() == true, "UCJ still renewable (2)");
    test ( ucjC.isInRenewalPeriod(x) == false, "UCJ expired, past in renewal period");
    test ( ucjC.isNotYetInRenewalPeriod(x) == false, "UCJ past expiry, past not yet in renewal period");
    test ( ucjC.isInGracePeriod(x) == true, "UCJ in grace period");
    test ( ucjC.getStatus() != CapabilityJunctionStatus.EXPIRED, "UCJ status still not EXPIRED "+ucjC.getStatus());

    // wait grace period
    Thread.sleep(2000L);
    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucjC.getId());
    test ( ucjC.getIsRenewable() == false, "UCJ no longer renewable");
    test ( ucjC.isInRenewalPeriod(x) == false, "UCJ expired, past grace, past renewal period");
    test ( ucjC.isNotYetInRenewalPeriod(x) == false, "UCJ expiry, past grace, past not yet in renewal period");
    test ( ucjC.isInGracePeriod(x) == false, "UCJ past grace period");

    // a put or cron job is required for this
    ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucjC.getId());
    test ( ucjC.getStatus() == CapabilityJunctionStatus.EXPIRED, "UCJ status EXPIRED " + ucjC.getStatus());
    `
    }
  ]
})
