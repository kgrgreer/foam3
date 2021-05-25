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
  name: 'SigningOfficerInvoiceApprovalTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.RequiredBooleanHolder',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.ServerCrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.lang.NoSuchMethodException',
    'java.lang.reflect.InvocationTargetException',
    'java.lang.reflect.Method',
    'java.util.ArrayList',
    'java.util.Arrays',
    'foam.util.Auth',
    'java.util.Calendar',
    'java.util.Date',
    'java.util.GregorianCalendar',
    'java.util.List',
    'net.nanopay.country.br.CPF',
    'net.nanopay.crunch.acceptanceDocuments.BaseAcceptanceDocumentCapability',
    'net.nanopay.crunch.document.DateOfIssue',
    'net.nanopay.crunch.document.Document',
    'net.nanopay.crunch.onboardingModels.InitialBusinessData',
    'net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData',
    'net.nanopay.crunch.onboardingModels.UserBirthDateData',
    'net.nanopay.crunch.registration.UserRegistrationData',
    'net.nanopay.model.Business',
    'net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso',
    'net.nanopay.partner.treviso.TrevisoUnlockPaymentTermsAndConditions',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'ignoreList',
      class: 'List'
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
        User user = createUser(x, "vasya", "password", "treviso-sme");
        user = (User) ((DAO) x.get("localUserDAO")).put(user);
        // General admission
        crunch_onboarding_treviso_general_admission_test(x, user);

        // Signing officer
        crunch_onboarding_signing_officer_information_test(x, user);
      `
    },
    {
      name: 'createUser',
      type: 'User',
      documentation: 'Helper method to create treviso user',
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
            .setBirthday(new GregorianCalendar(1970, Calendar.JANUARY, 01).getTime())
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
    {
      name: 'grantAll',
      documentation: 'Method for granting capability and all pre required capabilities',
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
      // Find all pre required capabilities and call grantArray to sequantually grant all of then
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
      documentation: 'Method for granting specific capability',
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
        if ( getIgnoreList().contains(capability.getId()) ) return;

        CapabilityJunctionStatus expectedStatus = getExpectedStatuses().get(capability.getId()) == null ?
          CapabilityJunctionStatus.GRANTED :
          (CapabilityJunctionStatus) getExpectedStatuses().get(capability.getId());

        UserCapabilityJunction ucj = null;

        // Find and call method to grant specific capability
        String id = capabilityIdToSupportMethods(capability.getId());
        Logger logger = (Logger) x.get("logger");
        try {
          Class[] cArg = new Class[2];
          cArg[0] = X.class;
          cArg[1] = User.class;
          Method getNameMethod = getClass().getMethod(id, cArg);
          try {
            getNameMethod.invoke(this, x, user);
          } catch ( Exception e ) {
            logger.error(e.getMessage(), e);
          }
        } catch ( NoSuchMethodException e ) {
          logger.error(e.getMessage(), e);
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

        test(ucj.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, id + " granted");
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

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
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
    },
    {
      name: 'crunch_onboarding_signing_officer_information_test',
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
        String id = "crunch.onboarding.signing-officer-information";
        // can not pass CPF validation because SoaCredenciais are empty
        getIgnoreList().add("crunch.onboarding.br.cpf");

        grantAll(x, id, user);

        CrunchService crunchService = ((ServerCrunchService) x.get("crunchService"));
        UserCapabilityJunction ucj1 = crunchService.getJunction(x, "crunch.onboarding.document.utility-bills");
        UserCapabilityJunction ucj2 = crunchService.getJunction(x, "crunch.onboarding.document.date-of-issue");
        UserCapabilityJunction ucj3 = crunchService.getJunction(x, "crunch.onboarding.document.identification");
        UserCapabilityJunction ucj4 = crunchService.getJunction(x, "crunch.onboarding.user-birth-date");

        test(ucj1.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, "crunch.onboarding.document.utility-bills" + "capability granted");
        test(ucj2.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, "crunch.onboarding.document.date-of-issue" + "capability granted");
        test(ucj3.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, "crunch.onboarding.document.identification" + "capability granted");
        test(ucj4.getStatus() == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED, "crunch.onboarding.user-birth-date" + "capability granted");

      `
    },
    {
      name: 'crunch_onboarding_br_cpf',
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
        String id = "crunch.onboarding.br.cpf";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          CPF cap = new CPF.Builder(x)
                          .setBirthday(new GregorianCalendar(1970, Calendar.JANUARY, 01).getTime())
                          .setData("10786348070")
                          .setCpfName("Mock Legal User")
                          .setVerifyName(true)
                          .setUser(user.getId())
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_document_utility_bills',
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
        String id = "crunch.onboarding.document.utility-bills";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          Date today = new Date();
          Date date = new Date(today.getTime() + (1000 * 60 * 60 * 24 * 5));
          Document cap = new Document.Builder(x)
                          .setIsRequired(false)
                          .setExpiry(date)
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_document_date_of_issue',
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
        String id = "crunch.onboarding.document.date-of-issue";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          Date today = new Date();
          Date date = new Date(today.getTime() - (1000 * 60 * 60 * 24 * 5));
          DateOfIssue cap = new DateOfIssue.Builder(x)
                          .setDateOfIssue(date)
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_document_identification',
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
        String id = "crunch.onboarding.document.identification";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          Document cap = new Document.Builder(x)
                          .setReviewed(true)
                          .setIsRequired(false)
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_user_birth_date',
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
        String id = "crunch.onboarding.user-birth-date";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          UserBirthDateData cap = new UserBirthDateData.Builder(x)
                          .setBirthday(user.getBirthday())
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'crunch_onboarding_signing_officer_information',
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
        String id = "crunch.onboarding.signing-officer-information";
        CrunchService crunchService = (ServerCrunchService) x.get("crunchService");
        UserCapabilityJunction ucj = crunchService.getJunction(x, id);

        if ( ucj.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          SigningOfficerPersonalData cap = new SigningOfficerPersonalData.Builder(x)
                          .setAddress(user.getAddress())
                          .setJobTitle("Treasury Manager")
                          .setPhoneNumber(user.getPhoneNumber())
                          .setBusinessId(user.getId() + 1)
                          .build();

          crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
      `
    },
    {
      name: 'capabilityIdToSupportMethods',
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
    }
  ]
});
