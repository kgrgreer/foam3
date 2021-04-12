/**
 * nanopay CONFIDENTIAL
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
  package: 'net.nanopay.partner.treviso.test',
  name: 'TrevisoOnboardingSupport',
  extends: 'net.nanopay.test.AbliiOnboardingSupport',
  documentation: `Helper methods for client side onboarding tests`,

  methods: [
    {
      name: 'createUser',
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
      type: 'foam.nanos.auth.User',
      code: async function(x, userName, password, group) {
        const E = foam.mlang.ExpressionsSingleton.create();
        let email = userName+'@nanopay.net';
        var u = await this.client(x, 'userDAO', foam.nanos.auth.User).find(E.OR(
          E.EQ(foam.nanos.auth.User.USER_NAME, userName),
          E.EQ(foam.nanos.auth.User.EMAIL, email)
        ));
        if ( ! u ) {
          u = await this.client(x, 'userDAO', foam.nanos.auth.User).put_(x, foam.nanos.auth.User.create({
            spid: 'treviso',
            email: email,
            userName: userName,
            firstName: userName,
            lastName: userName,
            desiredPassword: password,
            group: group || 'sme',
            emailVerified: true,
            phoneNumber: '9055551212',
            birthday: new Date(0),
            address: {
              class: 'foam.nanos.auth.Address',
              structured: true,
              countryId: 'BR',
              regionId: 'BR-SP',
              streetNumber: '1',
              streetName: 'Grand',
              city: 'Sao Paulo',
              postalCode: '01310000'
            }
          }, x));
          if ( ! u ||
               ! u.id ) {
            throw 'User not created ('+userName+')';
          }
        }
        return u;
      }
    },
    {
      name: 'trevisoTermsAndConditions',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-25';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.TrevisoUnlockPaymentTermsAndConditions.create({
            user: user.id,
            agreement: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'generalAdmission',
      code: async function(x, user) {
        // GeneralAdmission-Treviso
        var id = '242B00F8-C775-4899-AEBA-F287EC54E901';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'trevisoUserUtilityBill',
      code: async function(x, user) {
        var id;
        var ucj;

        // UtilityBill - Signing Officer.
        id = '85cee1de-db32-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'trevisoUserIdentification',
      code: async function(x, user) {
        var id;
        var ucj;
        // Date of Issue
        id = '8ad3c898-db232-1ea-87d0-0242ac130z0';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.DateOfIssue.create({
            reviewed: true,
            dateOfIssue: new Date(now.getFullYear() - 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }

        // Identification
        id = '8ad3c898-db32-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
            reviewed: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'trevisoUserCPF',
      code: async function(x, user) {
        var id;
        var ucj;

        // CPF
        id = 'fb7d3ca2-62f2-4caf-a84c-860392e4676b';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
            var cap = net.nanopay.country.br.CPF.create({
              birthday: new Date('1970-01-01'),
              data: '10786348070',
              cpfName: 'Mock Legal User',
              verifyName: true
            });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'signingOfficerQuestion',
      code: async function(x, user) {
        var id;
        var ucj;

        // SigningOfficerPrivilegesRequested
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-0';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap =  net.nanopay.crunch.onboardingModels.SigningOfficerQuestion.create({
            isSigningOfficer: true,
            signgingOfficerEmail: 's-'+user.email,
            userEmail: user.email
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'signingOfficerPersonalData',
      code: async function(x, user, business) {
        var id;
        var ucj;

        id = '777af38a-8225-87c8-dfdf-eeb15f71215f-123';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap =  net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.create({
            address: user.address,
            jobTitle: 'Treasury Manager',
            phoneNumber: user.phoneNumber,
            fatca: true,
            hasSignedContratosDeCambio: true,
            businessId: business.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'trevisoBusinessIdentificationNumbers',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '688cb7c6-7316-4bbf-8483-fb79f8fdeaaf';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.country.br.BrazilBusinessInfoData.create({
            nire: '12345678901234',
            cnpj: '06990590000123',
            verifyName: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessOfficeConsumptionDocument',
      code: async function(x, business) {
        var id;
        var ucj;

        id = 'b5f2b020-db0f-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
//            documents: Array(1).fill(foam.nanos.fs.File.create({ aid: '971d0fe5-4e69-311f-87c1-5a06866620b7' })),
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessNatureOfBusiness',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '4c46cdb8-06b2-11eb-adc1-0242ac120002';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.country.br.NatureBusinessRelationship.create({
            NatureOfBusinessRelationship: 'Intermediação Brokerage'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessAnnualFinancialStatement',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '7e2739cc-db32-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'targetCountryCapabilityBR',
      code: async function(x, business) {
        var id = '63049307-8db4-2437-5c02-b71d6878263c';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessInformationData',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eebsdf3225y-4';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessTypeAndSector.create({
            businessTypeId: 1,
            businessSectorId: 1,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessCapitalAndEquity',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '9d4d667c-04c3-11eb-adc1-0242ac120002';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.TrevisoCurrencyAmountInformation.create({
            capital: {
              class: 'net.nanopay.model.CurrencyAmount',
              currency: 'BRL',
              amount: 100
            },
            equity: {
              class: 'net.nanopay.model.CurrencyAmount',
              currency: 'BRL',
              amount: 100
            },
            monthlyRevenue: {
              class: 'net.nanopay.model.CurrencyAmount',
              currency: 'BRL',
              amount: 100
            }
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessAccountData',
      code: async function(x, business) {
        var id;
        var ucj;
        id = 'af3d9c28-0674-11eb-adc1-0242ac120002';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.TrevisoBusinessAccountData.create({
            capitalSource: 'Mixed',
            capitalType: 'Mixed',
            customers: [
              {
                class: 'net.nanopay.crunch.onboardingModels.CustomerBasicInformation',
                name: 'Customer',
                telephone: '9055551212'
              }
            ],
            suppliers: [
              {
                class: 'net.nanopay.crunch.onboardingModels.CustomerBasicInformation',
                name: 'Supplier',
                telephone: '9055551212'
              }
            ]
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'sourceCountryCapabilityBR',
      code: async function(x) {
        var id = '520a4120-3bc6-cef9-6635-c32af8219a6a';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'corridor',
      code: async function(x) {
        var id = 'f9c7ce45-c076-4f55-93d2-867c011ee6ca';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'createBRBankAccount',
      type: 'net.nanopay.bank.BankAccount',
      code: async function(x, user) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var b = await this.client(x, 'accountDAO', net.nanopay.account.Account).find(
          E.AND(
            E.EQ(net.nanopay.account.Account.OWNER, user.id),
            E.INSTANCE_OF(net.nanopay.bank.BRBankAccount)
          )
        );
        if ( ! b ) {
          b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, net.nanopay.bank.BRBankAccount.create({
            owner: user.id,
            name: 'savings',
            accountType: 'Savings',
            accountOwnerType: 'Individual',
            accountNumber: '12345678',
            institutionNumber: '12345',
            branchId: '12345'
          }, x));

          this.sudoStore(x);
          try {
            var y = this.sudoAdmin(x);
            b = b.clone();
            b.status = 1;
            b.verifiedBy = 'API';
            b = await this.client(y, 'accountDAO', net.nanopay.account.Account).put_(y, b);

            this.sudoRestore(x);

            let cap = net.nanopay.partner.treviso.onboarding.BRBankAccountData.create({
              hasBankAccount: true
            });
            await this.crunchService.updateJunction(x, '7b41a164-29bd-11eb-adc1-0242ac120002', cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
          } catch (e) {
            this.sudoRestore(x);
            throw e;
          }
          return b;
        }
      }
    },
    {
      name: 'brazilOnboardingReviewed',
      code: async function(x, user) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-49';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessDirectorsData',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-6-5';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.onboarding.BusinessDirectorsData.create({
            //needDirector: false,
            businessTypeId: 3,
            businessDirectors: []
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'businessOwnershipData',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-7-br';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.onboarding.BRBusinessOwnershipData.create({
            ownersSelectionsValidated: true,
            amountOfOwners: 0,
            haveLowShares: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'getAFEXUser',
      code: async function(x, business) {
        const E = foam.mlang.ExpressionsSingleton.create();
        return await this.client(x, 'afexUserDAO', net.nanopay.fx.afex.AFEXUser).find(
          E.EQ(net.nanopay.fx.afex.AFEXUser.USER, business.id)
        );
      }
    },
    {
      name: 'getApprovalRequest',
      code: async function(x, daoKey, objId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        return await this.client(x, 'approvalRequestDAO', net.nanopay.fx.afex.AFEXUser).find(E.AND(
          E.EQ(foam.nanos.approval.ApprovalRequest.DAO_KEY, daoKey),
          E.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, objId)
        ));
      }
    },
  ]
});
