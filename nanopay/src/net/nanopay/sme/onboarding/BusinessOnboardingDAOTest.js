/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.onboarding',
  name: 'BusinessOnboardingDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
    'java.util.Date'
  ],

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `

        // Create the mock localUserDAO
        x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
        DAO localUserDAO = (DAO) x.get("localUserDAO");

        // Create the mock localBusinessDAO
        x = x.put("localBusinessDAO", new MDAO(Business.getOwnClassInfo()));
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");

        // Create the mock businessOnboarding
        x = x.put("businessOnboarding", new MDAO(BusinessOnboarding.getOwnClassInfo()));
        DAO onboardService = (DAO) x.get("businessOnboarding");

        User user = new User();
        user.setId(8006);
        user.setFirstName("Unit");
        user.setLastName("Test");
        user.setEmail("henry+test@nanopay.net");
        user.setGroup("nanopayone8006.admin");
        localUserDAO.put(user);

        Address businessAddress = new Address();
        businessAddress.setStreetNumber("905");
        businessAddress.setStreetName("King St");
        businessAddress.setCity("Toronto");
        businessAddress.setRegionId("ON");
        businessAddress.setCountryId("CA");
        businessAddress.setPostalCode("M5C1B2");

        Business business = new Business();
        business.setId(8007);
        business.setAddress(businessAddress);
        localBusinessDAO.put(business);

        isSigningOffer(user, business, onboardService, x);

        localUserDAO.remove_(x, user);
        localBusinessDAO.remove_(x, business);
      `
    },
    {
      name: 'isSigningOffer',
      type: 'Void',
      documentation: `If user is the signing officer`,
      args: [
        { name: 'user', type: 'foam.nanos.auth.User' },
        { name: 'business', type: 'net.nanopay.model.Business' },
        { name: 'onboardService', type: 'foam.dao.DAO' },
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        boolean threw = false;

        Address signingOfficerAddress = new Address();
        signingOfficerAddress.setStreetNumber("905");
        signingOfficerAddress.setStreetName("King St");
        signingOfficerAddress.setCity("Toronto");
        signingOfficerAddress.setRegionId("ON");
        signingOfficerAddress.setCountryId("CA");
        signingOfficerAddress.setPostalCode("M5C1B2");

        BusinessOnboarding onboarding = new BusinessOnboarding();
        onboarding.setUserId(8006);
        onboarding.setBusinessId(8007);

        onboarding.setSigningOfficer(true);
        onboarding.setJobTitle("CEO");
        onboarding.setPhoneNumber("1234567890");
        Date birthday = new Date(1992, 11, 21); 
        onboarding.setBirthday(birthday);
        onboarding.setPEPHIORelated(true);
        onboarding.setThirdParty(true);
        onboarding.setDualPartyAgreement(3);
        onboarding.setAddress(signingOfficerAddress);

        onboarding.setBusinessTypeId(6);
        onboarding.setBusinessSectorId(42311);
        onboarding.setSourceOfFunds("Revenue");
        onboarding.setAnnualRevenue("9656000");
        onboarding.setAnnualDomesticVolume("88560");
        onboarding.setTransactionPurpose("Payables for products and/or services");
        onboarding.setTargetCustomers("Small manufacturing businesses in North America");
        try {
          onboardService.put_(x, onboarding);
        } catch (RuntimeException ex) {
          threw = true;
        }

        ArraySink sink = (ArraySink) onboardService.where(
          EQ(BusinessOnboarding.BUSINESS_ID, business.getId())
        ).select(new ArraySink());

        Boolean testSuccess = ! threw && sink.getArray().size() > 0;
        test( testSuccess, "Save the business onboarding data successfully when user is the signing officer");

        onboardService.remove_(x, onboarding);
      `
    }
  ]
});
