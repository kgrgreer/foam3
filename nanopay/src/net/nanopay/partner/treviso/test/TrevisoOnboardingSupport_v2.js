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
  name: 'TrevisoOnboardingSupport_v2',
  extends: 'net.nanopay.test.AbliiOnboardingSupport_v2',
  documentation: `Helper methods for client side onboarding tests.
  Function names use:
  var functonIdNameParser= function(id) { let st = id.replaceAll('-','_'); return '_'+st; }
  `,

  imports: [
    'crunchService'
  ],

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
        this.user = u;
        return u;
      }
    },
    {
      name: 'crunch_onboarding_br_treviso_unlock_payments_terms',
      code: async function(x, user) {
        var id = 'crunch.onboarding.br.treviso-unlock-payments-terms';
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
      name: 'crunch_onboarding_treviso_general_admission',
      code: async function(x, user) {
        // GeneralAdmission-Treviso
        var id = 'crunch.onboarding.treviso.general-admission';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_register_business_submit',
      code: async function(x, user) {
        var id = 'crunch.onboarding.register-business.submit';
        var ucj = await this.crunchService.getJunction(x, id);
        // note: !ucj not needed (anywhere)
        if ( ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          let bHolder = foam.core.RequiredBooleanHolder.create({ value: true });
          ucj = await this.crunchService.updateJunction(x, id, bHolder, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_document_utility_bills',
      code: async function(x, user) {
        // UtilityBill - Signing Officer.
        var id = 'crunch.onboarding.document.utility-bills';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'crunch_onboarding_document_identification',
      code: async function(x, user) {
        // Identification
        var id = 'crunch.onboarding.document.identification';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'crunch_onboarding_document_date_of_issue',
      code: async function(x, user) {
        // Date of Issue
        var id = 'crunch.onboarding.document.date-of-issue';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.DateOfIssue.create({
            reviewed: true,
            dateOfIssue: new Date(now.getFullYear() - 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_cpf',
      code: async function(x, user) {
        // CPF
        var id = 'crunch.onboarding.br.cpf';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.country.br.CPF.create({
            birthday: new Date('1970-01-01'),
            data: '10786348070',
            cpfName: 'Mock Legal User',
            verifyName: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_signing_officer_question',
      code: async function(x, user) {
        // SigningOfficerPrivilegesRequested
        var id = 'crunch.onboarding.signing-officer-question';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'crunch_onboarding_signing_officer_information',
      code: async function(x, business) {
        var id = 'crunch.onboarding.signing-officer-information';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var addr = foam.nanos.auth.Address.create({
              city: 'Copacabana',
              countryId: 'BR',
              postalCode: '22021-020',
              regionId: 'BR-RJ',
              streetName: 'Atlantica',
              streetNumber: '5'
            })
          var cap =  net.nanopay.partner.treviso.SigningOfficerPersonalDataTreviso.create({
            address: addr,
            jobTitle: 'Treasury Manager',
            phoneNumber: '1234567890',
            fatca: true,
            pephiorelated: true,
            hasSignedContratosDeCambio: true,
            businessId: business.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_business_identification',
      code: async function(x, business) {
        var id = 'crunch.onboarding.br.business-identification';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.country.br.BrazilBusinessInfoData.create({
            nire: '12345678901234',
            cnpj: '06990590000123',
            cnpjName: 'Mock Legal User',
            verifyName: true
          }, x);
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_document_office_consumption',
      code: async function(x, business) {
        var id = 'crunch.onboarding.document.office-consumption';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            isRequired: false,
//            documents: Array(1).fill(foam.nanos.fs.File.create({ aid: '971d0fe5-4e69-311f-87c1-5a06866620b7' })),
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          }, x);
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_nature_of_business',
      code: async function(x, business) {
        var id = 'crunch.onboarding.br.nature-of-business';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.country.br.NatureBusinessRelationship.create({
            NatureOfBusinessRelationship: 'Intermediação Brokerage'
          }, x);
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_document_annual_financial_statements',
      code: async function(x, business) {
        var id = 'crunch.onboarding.document.annual-financial-statements';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'payment_target_country_br',
      code: async function(x, business) {
        var id = 'payment.target.country.br';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_business_type_sector',
      code: async function(x, business) {
        // cap name: Business Details
        var id = 'crunch.onboarding.business-type-sector';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'crunch_onboarding_br_currency_amount_information',
      code: async function(x, business) {
        // cap name: Capital, Equity and Revenue
        var id = 'crunch.onboarding.br.currency-amount-information';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'crunch_onboarding_br_business_account',
      code: async function(x, business) {
        // cap name: Business Account Information
        var id = 'crunch.onboarding.br.business-account';
        var ucj = await this.crunchService.getJunction(x, id);
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
      name: 'payment_source_country_br',
      code: async function(x) {
        // cap name: Source Country Capability BR
        // cap type: CountryCapability
        var id = 'payment.source.country.br';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'paymentprovidercorridor_treviso_br_us',
      code: async function(x) {
        // cap name: BR-USD Corridor - Treviso
        // cap type: PaymentProviderCorridor
        var id = 'paymentprovidercorridor.treviso.br-us';
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
            await this.crunchService.updateJunction(x, 'crunch.onboarding.br.add-bank-account', cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
          } catch (e) {
            this.sudoRestore(x);
            throw e;
          }
          return b;
        }
      }
    },
    {
      name: 'crunch_onboarding_br_add_bank_account',
      code: async function(x, user) {
        // cap name: Brazil Bank Account
        var id = 'crunch.onboarding.br.add-bank-account';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var b = net.nanopay.bank.BRBankAccount.create({
              owner: user.id,
              name: 'savings',
              accountType: 'Savings',
              accountOwnerType: 'Individual',
              accountNumber: '12345678',
              institutionNumber: '12345',
              branchId: '12345'
            }, x);
          let cap = net.nanopay.partner.treviso.onboarding.BRBankAccountData.create({
            bankAccount: b
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_brazil_onboarding',
      code: async function(x, user) {
        // cap name: Brazil Onboarding
        var id = 'crunch.onboarding.br.brazil-onboarding';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_business_directors',
      code: async function(x, business) {
        // cap name: Information from Administrators and Legal Representatives
        var id = 'crunch.onboarding.business-directors';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.partner.treviso.onboarding.BusinessDirectorsData.create({
            skipDirectors: true,
            businessTypeId: 3
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_business_ownership',
      code: async function(x, business) {
        // cap name: Business ownership
        var id = 'crunch.onboarding.br.business-ownership';
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
      name: 'crunch_onboarding_br_business_prerequisites',
      code: async function(x, business) {
        // cap name: Business Prerequisites for Brazil
        var id = 'crunch.onboarding.br.business-prerequisites';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }
        return ucj;
      }
    },
    {
      name: 'AFEX',
      code: async function(x, business) {
        // cap name: Business Prerequisites for Brazil
        var id = 'AFEX';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.PENDING);
        }
        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_international_payments',
      code: async function(x, business) {
        // cap name: International payments onboarding
        var id = 'crunch.onboarding.br.international-payments';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED);
        }

        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_parent_international_payments',
      code: async function(x, business) {
        // cap name: International payments
        var id = 'crunch.onboarding.br.parent.international-payments';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.PENDING);
        }

        return ucj;
      }
    },
    {
      name: 'crunch_onboarding_br_registering_payment_provider',
      code: async function(x, business) {
        // cap name: Registering with Payment Provider(BR International)
        var id = 'crunch.onboarding.br.registering-payment-provider';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.PENDING);
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
