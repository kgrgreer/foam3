/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.test',
  name: 'UCJEditBehaviourTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.*',
    'foam.core.StringHolder',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.*',
    'foam.nanos.crunch.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // Create user
        String name = "editBehaviour-test";
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
          user.setGroup("test-personal");
        } else if ( user.getLifecycleState() == LifecycleState.DELETED ) {
          user = (User) user.fclone();
          user.setLifecycleState(LifecycleState.ACTIVE);
        }
        user = (User) userDAO.put_(x, user);

        // Get capabilites
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        // Name = OnlyOnboardingEditBehaviour
        UserCapabilityJunction testFullName = crunchService.getJunctionFor(x, "test.onboarding.full-name", user, user);
        // Phone Number = PermissiveEditBehaviour
        UserCapabilityJunction testPhoneNumber = crunchService.getJunctionFor(x, "test.onboarding.phone-number", user, user);
        // Address = NullEditBehaviour
        UserCapabilityJunction testAddress = crunchService.getJunctionFor(x, "test.onboarding.address", user, user);

        // Data
        StringHolder fullNameData = new StringHolder("test name"); 
        StringHolder phoneNumberData = new StringHolder("123456789"); 
        StringHolder addressData = new StringHolder("1337 Test Ave"); 
        StringHolder fullNameData2 = new StringHolder("test name 2");
        StringHolder phoneNumberData2 = new StringHolder("123456788");
        StringHolder addressData2 = new StringHolder("1338 Test Ave");
        
        // 1. Set OnlyOnboardingEditBehaviour
        testFullName = crunchService.updateJunctionFor(x, "test.onboarding.full-name", fullNameData, CapabilityJunctionStatus.GRANTED, user, user);

        // 2. Edit OnlyOnboardingEditBehaviour
        testFullName = crunchService.updateJunctionFor(x, "test.onboarding.full-name", fullNameData2, CapabilityJunctionStatus.GRANTED, user, user);
        test ( testFullName.getData().toString() != fullNameData.getValue(), "OnlyOnboardingEditBehaviour during onboarding" );
  
        // 3. Set phoneNumber(PermissiveEditBehaviour) & address(NullEditBehaviour)
        testPhoneNumber = crunchService.updateJunctionFor(x, "test.onboarding.phone-number", phoneNumberData, CapabilityJunctionStatus.GRANTED, user, user);
        testAddress = crunchService.updateJunctionFor(x, "test.onboarding.address", addressData, CapabilityJunctionStatus.GRANTED, user, user);

        // 4. Grant general capability and try to edit all 3, only PermissiveEditBehaviour should be able to
        var genCapUCJ = crunchService.updateJunctionFor(x, "testOnboarding", null, CapabilityJunctionStatus.GRANTED, user, user);

        testFullName = crunchService.updateJunctionFor(x, "test.onboarding.full-name", fullNameData, CapabilityJunctionStatus.GRANTED, user, user);
        testPhoneNumber = crunchService.updateJunctionFor(x, "test.onboarding.phone-number", phoneNumberData2, CapabilityJunctionStatus.GRANTED, user, user);
        testAddress = crunchService.updateJunctionFor(x, "test.onboarding.address", addressData2, CapabilityJunctionStatus.GRANTED, user, user);

        test ( testFullName.getData().toString() == fullNameData2.getValue(), "OnlyOnboardingEditBehaviour after onboarding" );
        test ( testPhoneNumber.getData().toString() == phoneNumberData2.getValue(), "PermissiveEditBehaviour" );
        test ( testAddress.getData().toString() == addressData.getValue(), "NullEditBehaviour");
      `
    }
  ]
})
