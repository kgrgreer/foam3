/**
 * nanopay CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.invoice.test',
  name: 'SigningOfficerInvoiceApprovalTest_v2',
  extends: 'foam.nanos.test.Test',
  javaImports: [
    'foam.nanos.crunch.test.CrunchTestSupport',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'java.util.Date',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.ServerCrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Arrays',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.Group',
    'net.nanopay.crunch.registration.UserRegistrationData',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
    'net.nanopay.partner.treviso.TrevisoUnlockPaymentTermsAndConditions',
    'foam.core.RequiredBooleanHolder',
    'foam.util.Auth',
    'foam.core.X',
    'foam.nanos.session.Session'
  ],

  properties: [
    {
      name: 'ignoreList',
      class: 'StringArray'
    },
    {
      name: 'expectedStatuses',
      class: 'Map'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // Create user
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = (Group) groupDAO.find("treviso-sme");
        CrunchTestSupport crunchTestSupport = new CrunchTestSupport();
        User user = createUser(x, "vasya", "password", "treviso-sme");
        user = (User) ((DAO) x.get("localUserDAO")).put(user);

        crunch_onboarding_treviso_general_admission_test(x, user);

        X adminContext = Auth.sudo(x, user);
//        Session sessionAdmin = adminContext.get(Session.class);
//        sessionAdmin.setAgentId(user.getId());
//        adminContext = sessionAdmin.applyTo(adminContext);
        crunch_onboarding_register_business_test(adminContext, user);
      `
    },
    {
      name: 'createUser',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userName',
          type: 'String',
        },
        {
          name: 'password',
          type: 'String',
        },
        {
          name: 'group',
          type: 'String',
        }
      ],
      javaCode: `
        String email = userName + "@nanopay.net";
        User u = (User) ((DAO) x.get("localUserDAO")).find(
          OR(
            EQ(foam.nanos.auth.User.USER_NAME, userName),
            EQ(foam.nanos.auth.User.EMAIL, email)
          )
        );

        if ( u == null ) {
          u = new User.Builder(x)
            .setSpid("treviso")
            .setEmail(email)
            .setUserName(userName)
            .setFirstName(userName)
            .setLastName(userName)
            .setDesiredPassword(password)
            .setGroup(group)
            .setEmailVerified(true)
            .setPhoneNumber("9055551212")
            .setBirthday(new Date(1970, 01, 01))
            .setAddress( new Address.Builder(x)
              .setStructured(true)
              .setCountryId("BR")
              .setRegionId("BR-SP")
              .setStreetNumber("1")
              .setStreetName("Grand")
              .setCity("Sao Paulo")
              .setPostalCode("01310000")
              .build()
            ).build();
        }
        return u;
      `
    },
//dfdfdfdf
    {
      name: 'grantAll',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        List grantPath = crunchService.getGrantPath(x, capabilityId);
        grantArray(x, grantPath, user);
      `
    },
    {
      name: 'grantArray',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilities',
          type: 'List'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode: `
        for ( int i = 0 ; i < capabilities.size() ; i++ ) {
          if ( capabilities.get(i) instanceof ArrayList ) {
            grantArray(x, (ArrayList) capabilities.get(i), user);
            continue;
          }
          grantCapability(x, (Capability) capabilities.get(i), user);
        }
      `
    },
    {
      name: 'grantCapability',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capability',
          type: 'Capability'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        if ( Arrays.asList(getIgnoreList()).contains(capability.getId()) ) return;

        CapabilityJunctionStatus expectedStatus = getExpectedStatuses().get(capability.getId()) == null ?
          CapabilityJunctionStatus.GRANTED :
          (CapabilityJunctionStatus) getExpectedStatuses().get(capability.getId());

        UserCapabilityJunction ucj = null;

        switch ( capability.getId() ) {
          case "crunch.onboarding.treviso.general-admission":
            crunch_onboarding_treviso_general_admission(x, user);
            break;
          case "crunch.onboarding.br.treviso-unlock-payments-terms":
            crunch_onboarding_br_treviso_unlock_payments_terms(x, user);
            break;
          case "crunch.onboarding.user-registration":
            crunch_onboarding_user_registration(x, user);
            break;
          case "crunch.onboarding.register-business":
            crunch_onboarding_register_business(x, user);
            break;
          case "crunch.onboarding.register-business.submit":
            crunch_onboarding_register_business_submit(x, user);
            break;
        }
      `
    },
    {
      name: 'capabilityIdToSupportMethod',
      type: 'String',
      args: [
        {
          name: 'capabilityId',
          type: 'String'
        }
      ],
      javaCode: `
        return capabilityId.replaceAll("\\\\.|-", "_");
      `
    },
    {
      name: 'addPending',
      type: 'Void',
      args: [
        {
          name: 'caps',
          type: 'List'
        }
      ],
      code: function addPending(...caps) {
        for ( let cap of caps ) {
          this.expectedStatuses[cap] = this.CapabilityJunctionStatus.PENDING;
        }
      },
      javaCode:`
      // pass
      `
    },
    {
      name: 'addActionRequired',
      type: 'Void',
      args: [
        {
          name: 'caps',
          type: 'List'
        }
      ],
      code: function addActionRequired(...caps){
        for ( let cap of caps ) {
          this.expectedStatuses[cap] = this.CapabilityJunctionStatus.ACTION_REQUIRED;
        }
      },
      javaCode:`
      // pass
      `
    },
    {
      name: 'ignore',
      type: 'Void',
      args: [
        {
          name: 'caps',
          type: 'List'
        }
      ],
      code: function ignore(...caps) {
        this.ignoreList.push(...caps);
      },
      javaCode: `
      // pass
      `
    },
    // fadfsfasdaf
    {
      name: 'crunch_onboarding_treviso_general_admission',
      type: 'UserCapabilityJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.treviso.general-admission";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      `
    },
    {
      name: 'crunch_onboarding_br_treviso_unlock_payments_terms',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.br.treviso-unlock-payments-terms";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          BaseAcceptanceDocumentCapability cap = new TrevisoUnlockPaymentTermsAndConditions.Builder(x)
                            .setUser(user.getId())
                            .setAgreement(true)
                            .build();
          ucj = crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_register_business_submit',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode:`
        String id = "crunch.onboarding.register-business.submit";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          RequiredBooleanHolder cap = new RequiredBooleanHolder.Builder(x)
                               .setValue(true)
                               .build();
          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_user_registration',
      type: 'UserCapabilityJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.user-registration";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          UserRegistrationData urd = new UserRegistrationData.Builder(x)
                                          .setFirstName(user.getFirstName())
                                          .setLastName(user.getLastName())
                                          .setPhoneNumber(user.getPhoneNumber())
                                          .build();
          ucj = crunchService.updateJunction(x, id, urd, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      `
    },
    {
      name: 'crunch_onboarding_treviso_general_admission_test',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.treviso.general-admission";

        grantAll(x, id, user);
        UserCapabilityJunction ucj = ((ServerCrunchService) x.get("crunchService")).getJunction(x, "crunch.onboarding.treviso.general-admission");

        test(ucj.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, id);
      `
    },
    {
      name: 'crunch_onboarding_register_business',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.register-business";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          Address address = new Address.Builder(x)
                                  .setStructured(true)
                                  .setCountryId("BR")
                                  .setRegionId("BR-SP")
                                  .setStreetNumber("1")
                                  .setStreetName("Grand")
                                  .setCity("Sao Paulo")
                                  .setPostalCode("01310000")
                                  .build();
          InitialBusinessData cap = new InitialBusinessData.Builder(x)
                                          .setBusinessName("AA")
                                          .setCompanyPhone("123123")
                                          .setAddress(address)
                                          .setSameAsBusinessAddress(true)
                                          .setMailingAddress(address)
                                          .build();

          UserCapabilityJunction ucjj = crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
          int a = 8;
        }
      `
    },
    {
      name: 'crunch_onboarding_register_business_test',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        String id = "crunch.onboarding.register-business";

        grantAll(x, id, user);
        UserCapabilityJunction ucj = ((ServerCrunchService) x.get("crunchService")).getJunction(x, id);

        test(ucj.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, "crunch.onboarding.register-business capability granted");
      `
    }
  ]
});
