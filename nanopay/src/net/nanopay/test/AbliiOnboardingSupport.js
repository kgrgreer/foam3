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
  package: 'net.nanopay.test',
  name: 'AbliiOnboardingSupport',
  documentation: `Helper methods for client side onboarding tests`,

  requires: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.session.Session'
  ],

  imports: [
    'sessionID',
    'crunchService'
  ],
  
  exports: [
    'subject'
  ],
  
  properties: [
    {
      documentation: 'Unique identifier for this Test instance',
      name: 'uid',
      class: 'String',
      factory: function() { return foam.uuid.randomGUID().split('-')[0]; },
      transient: true
    },
    {
      name: 'adminSessionId',
      class: 'String',
      factory: function() { return this.getCurrentSessionId(); },
      transient: true
    },
    {
      name: 'savedSessionId',
      class: 'String',
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'adminSubject',
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      factory: function() { return this.Subject.create({}); },
      transient: true
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'savedSubject',
      transient: true
    },
  ],

  methods: [
    {
      name: 'setup',
      code: function(x) {
        this.sudoAdmin(x);
      }
    },
    {
      name: 'teardown',
      code: function(x) {
        this.sudoAdmin(x);
      }
    },
    {
      name: 'getCurrentSessionId',
      code: function() {
        return this.sessionID;
      }
    },
    {
      name: 'setCurrentSessionId',
      code: function(id) {
        this.sessionID = id;
      }
    },
    {
      name: 'sudo',
      type: 'Context',
      code: function(x, sessionId, realUser, user) {
        console.info('sudo', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(sessionId);
        this.subject = this.Subject.create({
          realUser: realUser,
          user: user
        }, y);
        var y = x.createSubContext({
          subject: this.subject,
          sessionID: sessionId
        });
        this.x = y;
        console.info('sudo', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return y;
      }
    },
    {
      // TODO/REVIEW: This should be a spid-admin, not * admin. 
      documentation: `Become spid-admin`,
      name: 'sudoAdmin',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        console.info('sudoAdmin', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(this.adminSessionId);
        this.subject = this.adminSubject;
        var y = x.createSubContext({
          subject: this.subject,
          sessionID: this.adminSessionId
        });
        this.x = y;
        console.info('sudoAdmin', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return y;
      }
    },
    {
      name: 'sudoStore',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        this.savedSessionId = this.getCurrentSessionId();
        this.savedSubject = this.subject;
        return x;
      }
    },
    {
      name: 'sudoRestore',
      args: [
        {
          name: 'x',
          type: 'Context',
        }
      ],
      type: 'Context',
      code: function(x) {
        console.info('sudoRestore', 'from', this.getCurrentSessionId(), 'subject', this.subject.toString());
        this.setCurrentSessionId(this.savedSessionId);
        this.subject = this.savedSubject;
        this.x = x;
        console.info('sudoRestore', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return x;
      }
    },
    {
      name: 'client',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String',
        },
        {
          name: 'of',
          type: 'String',
        }
      ],
      type: 'foam.dao.DAO',
      code: function(x, serviceName, of) {
        return x[serviceName];

        /* - used before ApplicationController/SessionIDProperty fixed. Left for reference
        let sessionId = getCurrentSessionId();
        var box = foam.box.HTTPBox.create({
          url: 'service/'+serviceName,
          authorizationType: foam.box.HTTPAuthorizationType.BEARER,
          sessionID: sessionId
        }, x);
        box = foam.box.TimeoutBox.create({ delegate: box }, x);
        box = foam.box.SessionClientBox.create({ sessionID: sessionId, delegate: box }, x);
        let dao = foam.dao.EasyDAO.create({
          daoType: 'CLIENT',
          of: of,
          serverBox: box
        }, x);
        return dao;
        */
      }
    },
    {
      name: 'createSession',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'realUserId',
          type: 'String',
        },
        {
          name: 'userId',
          type: 'String',
        }
      ],
      type: 'foam.nanos.session.Session',
      code: async function(x, realUserId, userId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var s = await this.client(y, 'sessionDAO', foam.nanos.session.Session).find(E.EQ(foam.nanos.session.Session.USER_ID, userId));
          if ( ! s ) {
            s = await this.client(y, 'sessionDAO', foam.nanos.session.Session).put_(y, foam.nanos.session.Session.create({
              userId: userId,
              agentId: realUserId,
              ttl: 28800000
            }, y));
          }
          if ( ! s ||
               ! s.id ) {
            throw 'Failed to create session';
          }
          console.info('createSession', 'realUser', realUserId, 'user', userId, 'session', s.id);
          this.sudoRestore(x);
          return s;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
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
            email: email,
            userName: userName,
            firstName: userName,
            lastName: userName,
            desiredPassword: password,
            group: group || 'sme',
            emailVerified: true,
            phoneNumber: '9055551212',
            address: {
              class: 'foam.nanos.auth.Address',
              structured: false,
              address1: '20 King St. W',
              regionId: 'ON',
              countryId: 'CA',
              city: 'Toronto',
              postalCode: 'M9B 5X6'
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
      name: 'createBusiness',
      type: 'net.nanopay.model.Business',
      code: async function(x, user) {
        const E = foam.mlang.ExpressionsSingleton.create();
        let businessName = 'b-'+user.userName;
        var b = await this.client(x, 'businessDAO', net.nanopay.model.Business).find(
          E.EQ(net.nanopay.model.Business.BUSINESS_NAME, businessName)
        );
        if ( ! b ) {
          b = await this.client(x, 'businessDAO', net.nanopay.model.Business).put_(x, net.nanopay.model.Business.create({
            businessName: businessName,
            organization: businessName,
            phoneNumber: user.phoneNumber,
            address: user.address
          }));
        }
        return b;
      }
    },
    {
      name: 'updateUserComplianceStatus',
      type: 'foam.nanos.auth.User',
      code: async function(x, user) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var u = user.clone();
          u.compliance = 2;
          u.status = 2;
          u = await this.client(y, 'userDAO', foam.nanos.auth.User).put_(y, u);
          this.sudoRestore(x);
          return u;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'abliiUserOnboardingCapability',
      code: async function(x, user) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var cap = await this.client(y, 'capabilityPayloadDAO', foam.nanos.crunch.connection.CapabilityPayload).put_(y, foam.nanos.crunch.connection.CapabilityPayload.create({
            'id': '1F0B39AD-934E-462E-A608-D590D1081298',
            'capabilityDataObjects': {
              'Personal Onboarding Type': {
                'class': 'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
                'user': user.id,
                'requestedOnboardingType': 1,
                'overrideFlinksLoginType': true
              },
            }
          }, y));

          this.sudoRestore(x);
          return cap;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'updateBusinessComplianceStatus',
      type: 'foam.nanos.model.Business',
      code: async function(x, business) {
        this.sudoStore(x);
        try {
          var y = this.sudoAdmin(x);
          var b = business.clone();
          b.compliance = 2;
          b.status = 2;
          b = await this.client(y, 'userDAO', foam.nanos.auth.User).put_(y, b);
          this.sudoRestore(x);
          return b;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'businessInitialData',
      code: async function(x, user) {
        var id;
        var ucj;

        // Business Registration Data
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-76';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.InitialBusinessData.create({
            businessName: 'b-'+user.userName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            mailingAddress: user.address
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
          return await this.createBusiness(x, user);
        }
      }
    },
    {
      name: 'businessDetailExpandedData',
      code: async function(x, business) {
        var id = '9C6D8CFE-50B8-4507-A595-78DD9E08EA2D';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessDetailExpandedData.create({
            targetCustomers: 'Everyone'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'businessTypeData',
      code: async function(x, business) {
        var id = 'A679CA67-93C2-4597-B92E-4BBA00797E96';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessTypeData.create({
            businessTypeId: 1
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'businessExtraBusinessTypeDataNotRequired',
      code: async function(x, business) {
        var id = 'ED16359E-628E-4104-83B0-C77BB8544B78';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.IsSelectedData.create({
            selected: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'businessExtraBusinessTypeDataRequired',
      code: async function(x, business) {
        var id = '840FC3EB-F826-4AB3-AD92-131CD1C7C8D1';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.IsSelectedData.create({
            selected: false
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'businessOwners',
      code: async function(x, business) {
        
        var id = '6DD8D005-7514-432D-BC32-9C5D569A0462';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.BusinessOwnersList.create({
            businessOwners: []
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'businessRegistrationDate',
      code: async function(x, business) {
        var id;
        var ucj;

        // Business Registration Date
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-16';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessRegistrationDateData.create({
            businessRegistrationDate: '1970-01-01T00:00:00.000Z'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'businessIncorporationDate',
      code: async function(x, business) {
        var id;
        var ucj;
 
        // Business Incorporation Date
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-17';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessIncorporationDateData.create({
            businessIncorporationDate: '1970-01-01T00:00:00.000Z'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'businessTaxIdNumber',
      code: async function(x, business) {
        var id;
        var ucj;
         
        // Tax Id number
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-18';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.TaxIdNumberData.create({
            taxIdentificatioinNumer: '123456789'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
     }
    },
    {
      name: 'businessAnnualFinancialStatement',
      code: async function(x, business) {
        var id;
        var ucj;

        id = 'b5f2b020-db0f-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'businessArticleOfIncorporation',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '26d32e86-db11-11ea-87d0-0242ac130003';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var now = new Date();
          var cap = net.nanopay.crunch.document.Document.create({
            reviewed: true,
            expiry: new Date(now.getFullYear() + 5)
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'businessInformationData',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-4';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessInformationData.create({
            businessTypeId: 1,
            businessSectorId: 1,
            businessDetailsSection: 'Purchase of goods produced'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
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
          var cap = net.nanopay.crunch.onboardingModels.CurrencyAmountInformation.create({
            capital: {
              class: 'net.nanopay.model.CurrencyAmount',
              currency: 'USD',
              amount: 100
            },
            equity: {
              class: 'net.nanopay.model.CurrencyAmount',
              currency: 'USD',
              amount: 100
            }
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
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
          var cap = net.nanopay.crunch.onboardingModels.BusinessAccountData.create({
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
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      documentation: 'Use US Bank Account to avoid issues with PadCapture and subject in context.',
      name: 'createUSBankAccount',
      type: 'net.nanopay.bank.BankAccount',
      code: async function(x, user) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var b = await this.client(x, 'accountDAO', net.nanopay.account.Account).find(
          E.AND(
            E.EQ(net.nanopay.account.Account.OWNER, user.id),
            E.INSTANCE_OF(net.nanopay.bank.USBankAccount)
          )
        );
        if ( ! b ) {
          b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, net.nanopay.bank.USBankAccount.create({
            owner: user.id,
            name: 'savings',
            accountNumber: '123456',
            branchId: '123456789'
          }, x));

          this.sudoStore(x);
          try {
            var y = this.sudoAdmin(x);
            b = b.clone();
            b.status = 1;
            b.verifiedBy = 'API';
            b = await this.client(y, 'accountDAO', net.nanopay.account.Account).put_(y, b);
            this.sudoRestore(x);
          } catch (e) {
            this.sudoRestore(x);
            throw e;
          }
          return b;
        }
      }
    },
    {
      name: 'createContact',
      type: 'net.nanopay.contacts.Contact',
      code: async function(x, user) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var c = await this.client(x, 'contactDAO', net.nanopay.contacts.Contact).find(
          E.EQ(net.nanopay.contacts.Contact.OWNER, user.id),
        );
        if ( ! c ) {
          c = await this.client(x, 'contactDAO', net.nanopay.contacts.Contact).put_(x, net.nanopay.contacts.Contact.create({
            owner: user.id,
            firstName: 'Contact',
            lastName: user.id,
            organization: user.id,
            email: 'contact@nanopay.net',
            group: 'sme'
          }, x));
        }
        return c;
      }
    },
    {
      name: 'approveRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, approver, objectId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        var r = await this.findApprovalRequest(x, approver, objectId);
        if ( r ) {
          r = fclone();
          r.setStatus(foam.nanos.approval.ApprovalStatus.APPROVED);
          return await this.putApprovalRequest(x, r);
        }
        throw new RuntimeException('ApprovalRequest not found');
      }
    },
    {
      name: 'findApprovalRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, approver, objectId) {
        const E = foam.mlang.ExpressionsSingleton.create();
        return await this.client(x, 'approvalRequestDAO', foam.nanos.approval.ApprovalRequest).find(
          E.AND(
            E.EQ(foam.nanos.approval.ApprovalRequest.APPROVER, approver.id),
            E.EQ(foam.nanos.approval.ApprovalRequest.OBJ_ID, objectId)
          )
        );
      }
    },
    {
      name: 'putApprovalRequest',
      type: 'foam.nanos.approval.ApprovalRequest',
      code: async function(x, approval) {
        return await this.client(x, 'approvalRequestDAO', foam.nanos.approval.ApprovalRequest).put_(x, approval);
      }
    },
    {
      name: 'userRegistrationData',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-19';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserRegistrationData.create({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'abliiPrivacyPolicy',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-8';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy.create({
            user: user.id,
            agreement: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'abliiTermsAndConditions',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-7';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions.create({
            user: user.id,
            agreement: true,
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'generalAdmission',
      code: async function(x, user) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215e-18';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          ucj = await this.crunchService.updateJunction(x, id, null, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'userDetails',
      code: async function(x, user) {
        var id = '0ED5DD86-AA1A-452B-BA7D-E7A2D0542135';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserDetailData.create({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }

        id = 'FB1C8CF2-34B9-40FE-A4AA-58CFA2FDBA15';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.registration.UserDetailExpandedData.create({
            'birthday': '1988-06-15T00:00:00.000Z',
            'jobTitle': 'Treasurer',
            'PEPHIORelated': false,
            'thirdParty': false
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'userDateOfBirth',
      code: async function(x, user) {
        var id;
        var ucj;

        // Date of birth
        id = '8bffdedc-5176-4843-97df-1b75ff6054fb';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.UserBirthDateData.create({
            birthday: '1988-06-15T00:00:00.000Z'
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'signingOfficerPersonalData',
      code: async function(x, user, business) {
        // var id = '777af38a-8225-87c8-dfdf-eeb15f71215f-123';
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-1a5';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap =  net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.create({
            address: user.address,
            jobTitle: 'Treasurer',
            phoneNumber: user.phoneNumber,
            PEPHIORelated: false,
            thirdParty: false,
            businessId: business.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'transactionDetailsData',
      code: async function(x, business) {
        var id;
        var ucj;

        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-6';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.TransactionDetailsData.create({
            targetCustomers: 'targetCustomers',
            suggestedUserTransactionInfo: {
              class: 'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo',
              baseCurrency: 'USD',
              annualRevenue: '$0 to $10,000',
              transactionPurpose: 'Payables for products and/or services',
              annualTransactionAmount: '',
              annualTransactionFrequency: '1 to 99',
              annualVolume: '',
              annualDomesticTransactionAmount: 'N/A',
              annualDomesticVolume: '$0 to $10,000'
            }
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
          return ucj;
        }
      }
    },
    {
      name: 'businessDirectorsData',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-6-5';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessDirectorsData.create({
            //needDirector: false,
            businessTypeId: 3,
            businessDirectors: []
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyDirectorsListed',
      code: async function(x, business) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-17';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyDirectorsListed.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'ownersPercent',
      code: async function(x, business) {
        var id = '554af38a-8225-87c8-dfdf-eeb15f71215f-7';
        var ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.BusinessOwnershipData.create({
            ownersSelectionsValidated: true,
            amountOfOwners: 0
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyOwnersPercent',
      code: async function(x, business) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-12';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
         var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.CertifyOwnersPercent.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
        return ucj;
      }
    },
    {
      name: 'certifyReviewed',
      code: async function(x, user) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215f-14';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.onboardingModels.CertifyDataReviewed.create({
            reviewed: true,
            signingOfficer: user.id
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    },
    {
      name: 'internationalPaymentsAgreement',
      code: async function(x) {
        var id;
        var ucj;
        id = '554af38a-8225-87c8-dfdf-eeb15f71215e-10';
        ucj = await this.crunchService.getJunction(x, id);
        if ( ! ucj ||
             ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
          var cap = net.nanopay.crunch.acceptanceDocuments.capabilities.USDAFEXTerms.create({
            agreement: true
          });
          ucj = await this.crunchService.updateJunction(x, id, cap, foam.nanos.crunch.CapabilityJunctionStatus.GRANTED);
        }
      }
    }
  ]
});
