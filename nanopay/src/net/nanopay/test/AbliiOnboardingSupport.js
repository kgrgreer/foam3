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
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'foam.nanos.session.Session'
  ],

  imports: [
    'sessionID'
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
        }, x);
        x.subject.copyFrom(this.subject);
        console.info('sudo', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return x;
      }
    },
    {
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
        x.subject.copyFrom(this.subject);
        console.info('sudoAdmin', 'to', this.getCurrentSessionId(), 'subject', this.subject.toString());
        return x;
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
        x.subject.copyFrom(this.subject);
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
          this.sudoAdmin(x);
          var s = await this.client(x, 'sessionDAO', foam.nanos.session.Session).find(E.EQ(foam.nanos.session.Session.USER_ID, userId));
          if ( ! s ) {
            s = await this.client(x, 'sessionDAO', foam.nanos.session.Session).put_(x, foam.nanos.session.Session.create({
              userId: userId,
              agentId: realUserId,
              ttl: 28800000
            }, x));
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
            emailVerified: true
          }, x));
          let id = u.id;
          u = await this.client(x, 'userDAO', foam.nanos.auth.User).find(id);
          if ( ! u ) {
            throw 'User not found ('+id+')';
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
        var b = await this.client(x, 'businessDAO', net.nanopay.model.Business).find(
          E.EQ(net.nanopay.model.Business.BUSINESS_NAME, user.userName),
        );
        if ( ! b ) {
          b = await this.client(x, 'businessDAO', net.nanopay.model.Business).put_(x, net.nanopay.model.Business.create({
            businessName: 'business-'+user.userName,
            organization: 'business-'+user.userName,
            phoneNumber: '905-555-1212'
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
          this.sudoAdmin(x);
          var u = user.clone();
          u.compliance = 2;
          u.status = 2;
          u = await this.client(x, 'userDAO', foam.nanos.auth.User).put_(x, u);
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
          this.sudoAdmin(x);
          var cap = await this.client(x, 'capabilityPayloadDAO', foam.nanos.crunch.connection.CapabilityPayload).put_(x, foam.nanos.crunch.connection.CapabilityPayload.create({
            'id': '1F0B39AD-934E-462E-A608-D590D1081298',
            'capabilityDataObjects': {
              'AbliiPrivacyPolicy': {
                'class': 'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy',
                'title': 'Ablii\'s Privacy Policy',
                'agreement': true,
                'version': '1.0'
              },
              'AbliiTermsAndConditions': {
                'class': 'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions',
                'title': 'Ablii\'s Terms and Conditions',
                'agreement': true,
                'version': '1.0'
              },
              'Expanded User Details': {
                'class': 'net.nanopay.crunch.registration.UserDetailExpandedData',
                'birthday': '1988-06-15T00:00:00.000Z',
                'jobTitle': 'Treasurer',
                'PEPHIORelated': false,
                'thirdParty': false
              },
              'Personal Onboarding Type': {
                'class': 'net.nanopay.crunch.registration.PersonalOnboardingTypeData',
                'user': user.id,
                'requestedOnboardingType': 1,
                'overrideFlinksLoginType': true
              },
              'User Details': {
                'class': 'net.nanopay.crunch.registration.UserDetailData',
                'firstName': user.firstName,
                'lastName': user.lastName,
                'phoneNumber': user.phoneNumber || '6472223333',
                'address': user.address
              }
            }
          }, x));

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
          this.sudoAdmin(x);
          var b = business.clone();
          b.compliance = 2;
          b.status = 2;
          b = await this.client(x, 'userDAO', foam.nanos.auth.User).put_(x, b);
          this.sudoRestore(x);
          return b;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      name: 'abliiBusinessOnboardingCapability',
      code: async function(x, user, business) {
        this.sudoStore(x);
        try {
          this.sudoAdmin(x);
          var cap = await this.client(x, 'capabilityPayloadDAO', foam.nanos.crunch.connection.CapabilityPayload).put_(x, foam.nanos.crunch.connection.CapabilityPayload.create({
            'id': '56D2D946-6085-4EC3-8572-04A17225F86A',
            'capabilityDataObjects': {
              'AbliiPrivacyPolicy': {
                'class': 'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiPrivacyPolicy',
                'title': 'Ablii\'s Privacy Policy',
                'agreement': true,
                'version': '1.0'
              },
              'AbliiTermsAndConditions': {
                'class': 'net.nanopay.crunch.acceptanceDocuments.capabilities.AbliiTermsAndConditions',
                'title': 'Ablii\'s Terms and Conditions',
                'agreement': true,
                'version': '1.0'
              },
              'User Details': {
                'class': 'net.nanopay.crunch.registration.UserDetailData',
                'firstName': user.firstName,
                'lastName': user.lastName,
                'phoneNumber': user.phoneNumber || '6472223333',
                'address': user.address
              },
              'Expanded User Details': {
                'class': 'net.nanopay.crunch.registration.UserDetailExpandedData',
                'birthday': user.birthday || '1988-06-15T00:00:00.000Z',
                'jobTitle': 'Treasurer',
                'PEPHIORelated': false,
                'thirdParty': false
              },
              'Business Onboarding Details': {
                'class': 'net.nanopay.crunch.registration.BusinessDetailData',
                'businessName': business.businessName,
                'phoneNumber': business.phoneNumber || '6472223333',
                'address': business.address,
                'mailAddress': business.address
              },
              'Expanded Business Onboarding Details': {
                'class': 'net.nanopay.crunch.registration.BusinessDetailExpandedData',
                'targetCustomers': 'Everyone'
              },
              'Business Type': {
                'class': 'net.nanopay.crunch.registration.BusinessTypeData',
                'businessTypeId': 1
              },
              'Extra Business Type Data Not Required': {
                'class': 'net.nanopay.crunch.registration.IsSelectedData',
                'selected': true
              },
              'Extra Business Type Data Required': {
                'class': 'net.nanopay.crunch.registration.IsSelectedData',
                'selected': false
              },
              'Business Directors': {
                'class': 'net.nanopay.crunch.registration.BusinessDirectorList',
                'business': business.id,
                'businessDirectors': [
                  {
                    'class': 'net.nanopay.model.BusinessDirector',
                    'firstName': 'John',
                    'lastName': 'Smith',
                    'nationality': 'CA'
                  },
                  {
                    'class': 'net.nanopay.model.BusinessDirector',
                    'firstName': 'Juan',
                    'lastName': 'Smith',
                    'nationality': 'BR'
                  }
                ]
              },
              'Business Owners': {
                'class': 'net.nanopay.crunch.registration.BusinessOwnerList',
                'business': business.id,
                'businessOwners': [ ]
              },
              'Signing Officers': {
                'class': 'net.nanopay.crunch.registration.SigningOfficerList',
                'business': business.id,
                'signingOfficers': [
                  {
                    'class': 'net.nanopay.model.SigningOfficer',
                    'firstName': user.firstName,
                    'lastName': user.lastName,
                    'position': 'Treasurer',
                    'user': user.id
                  }
                ]
              }
            }
          }, x));
          
          this.sudoRestore(x);
          return cap;
        } catch (e) {
          this.sudoRestore(x);
          throw e;
        }
      }
    },
    {
      documentation: 'Use US Bank Account to avoid issues with PadCapture and subject in context.',
      name: 'createBankAccount',
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
          console.info('createBankAccont', 'user', user.id, 'subject.realUser', x.subject.realUser && x.subject.realUser.id || 'na', 'subject.user', x.subject.user && x.subject.user.id || 'na', 'session', this.getCurrentSessionId());
          b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, net.nanopay.bank.USBankAccount.create({
            owner: user.id,
            name: 'savings',
            accountNumber: '123456',
            branchId: '123456789'
          }, x));

          this.sudoStore(x);
          try {
            this.sudoAdmin(x);
            b = b.clone();
            b.status = 1;
            b.verifiedBy = 'API';
            b = await this.client(x, 'accountDAO', net.nanopay.account.Account).put_(x, b);
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
    }
  ]
});
