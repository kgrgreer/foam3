/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.referral.test',
  name: 'ReferralCodeTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Permission',
    'foam.nanos.auth.User',
    'foam.nanos.referral.ReferralCode',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        User testUser1 = null;
        User testUser2 = null;
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO referralCodeDAO = (DAO) x.get("referralCodeDAO");

        Permission permission = new Permission.Builder(x).setId("rule.read.create-referralCode").build();
        Group group = (Group) ((DAO) x.get("localGroupDAO")).find("anonymous");
        group.getPermissions(x).add(permission);
        permission = new Permission.Builder(x).setId("referralCode.create").build();
        group.getPermissions(x).add(permission);

        testUser1 = new User.Builder(x)
          .setUserName("referralTest1")
          .setEmail("referralTest1@nanopay.net")
          .setGroup("anonymous")
          .build();
        testUser1 = (User) userDAO.put(testUser1);

        ReferralCode refCode = (ReferralCode) ((ArraySink) testUser1.getReferralCodes(x).select(new ArraySink())).getArray().get(0);
        test(refCode != null, "ReferralCode Created");

        testUser2 = new User.Builder(x)
          .setEmail("referralTest2@nanopay.net")
          .setUserName("referralTest2")
          .setReferralCode(refCode.getId())
          .setGroup("anonymous")
          .build();
        testUser2 = (User) userDAO.put(testUser2);
        refCode = (ReferralCode) referralCodeDAO.find(refCode.getId());
        test(((ArraySink)refCode.getReferees(x).select(new ArraySink())).getArray().size() > 0, "Signed up user linked to referralCode");
        refCode = (ReferralCode) ((ArraySink) testUser2.getReferralCodes(x).select(new ArraySink())).getArray().get(0);
        test(refCode != null, "ReferralCode Created for newly signed up user");
      `
    }
  ]
});
