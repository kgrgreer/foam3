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
  package: 'net.nanopay.model',
  name: 'UserRefine',
  refines: 'foam.nanos.auth.User',

  documentation: `A version of the FOAM User base model customized for
    the nanopay platform and business.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.nanos.approval.ApprovableAware'
  ],

  imports: [
    'complianceHistoryDAO?'
  ],

  javaImports: [

    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.mlang.MLang',

    'java.util.List',
    'java.util.regex.Pattern',
    'javax.mail.internet.AddressException',
    'javax.mail.internet.InternetAddress',

    'net.nanopay.contacts.Contact',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NOT'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.model.PersonalIdentification',
    'net.nanopay.onboarding.model.Questionnaire'
  ],

  constants: [
    {
      name: 'NAME_MAX_LENGTH',
      type: 'Integer',
      value: 70
    }
  ],

  tableColumns: [
    'id',
    'type',
    'group.id',
    'organization',
    'email',
  ],

  searchColumns: [
    'id',
    'type',
    'spid',
    'group',
    'enabled',
    'firstName',
    'lastName',
    'organization',
    'email',
  ],

  messages: [
    { name: 'COMPLIANCE_HISTORY_MSG', message: 'Compliance History for' },
    { name: 'PAYABLES_MSG', message: 'Payables for' },
    { name: 'RECEIVABLES_MSG', message: 'Receivables for' },
    { name: 'FOR_MSG', message: 'for' },
    { name: 'TWO_FACTOR_SUCCESS', message: 'Two factor authentication successfully disabled' },
    { name: 'TWO_FACTOR_INFO', message: 'Two factor authentication already disabled' },
    { name: 'RESET_LOGIN_SUCCESS', message: 'Login attempts successfully reset' },
    { name: 'RESET_LOGIN_INFO', message: 'Login attempts already reset' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'identification',
      of: 'net.nanopay.model.PersonalIdentification',
      documentation: `A placeholder for the photo identification image, such as a
        passport, of the individual person, or real user.
      `,
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      factory: function() {
        return this.Address.create();
      },
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView'
        };
      },
      section: 'userInformation',
      order: 180
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 230,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'organization',
      label: 'Company Name',
      section: 'businessInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'A stored copy of additional documents for compliance verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.data.additionalDocuments$
        };
      },
      createVisibility: 'HIDDEN',
      section: 'businessInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'PEPHIORelated',
      documentation: `Determines whether the user is a domestic or foreign _Politically
        Exposed Person (PEP), Head of an International Organization (HIO)_, or
        related to any such person.
      `,
      createVisibility: 'HIDDEN',
      section: 'complianceInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'thirdParty',
      documentation: `Determines whether the User is taking instructions from and/or acting
        on behalf of a 3rd party.
      `,
      createVisibility: 'HIDDEN',
      section: 'complianceInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'status',
      documentation: `Tracks the type of status of the User.`,
      section: 'operationsInformation',
      order: 10,
      gridColumns: 6,
      sheetsOutput: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.admin.model.AccountStatus',
      name: 'previousStatus',
      documentation: `Tracks the previous status of the User.`,
      section: 'operationsInformation',
      order: 20,
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'createdPwd',
      value: false,
      documentation: `Determines whether the User is using its own unique password or one
        that was system-generated.`,
      section: 'operationsInformation',
      gridColumns: 6,
      order: 30,
      externalTransient: true
    },
    {
      class: 'FObjectArray',
      name: 'approvalRequests',
      section: 'operationsInformation',
      order: 40,
      of: 'foam.nanos.approval.ApprovalRequest',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      readVisibility: 'RO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.DAOtoFObjectArrayView',
          dao: X.approvalRequestDAO.where(E.EQ(foam.nanos.approval.ApprovalRequest.CREATED_FOR, X.data.id))
        };
      },
      storageTransient: true
    },
    {
      class: 'Boolean',
      name: 'portalAdminCreated',
      documentation: 'Determines whether a User was created by an admin user.',
      section: 'operationsInformation',
      order: 50,
      gridColumns: 6,
      value: false,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'welcomeEmailSent',
      documentation: 'Determines whether a welcome email has been sent to the User.',
      value: true,
      section: 'operationsInformation',
      gridColumns: 6,
      order: 90,
      externalTransient: true
    },
    {
      class: 'Int',
      name: 'inviteAttempts',
      value: 0,
      documentation: 'Defines the number of attempts to invite the user.',
      section: 'operationsInformation',
      order: 120,
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'invited',
      value: false,
      documentation: `Determines whether the User was invited to the platform by
        an invitation email.`,
      section: 'operationsInformation',
      order: 130,
      gridColumns: 6

    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'invitedBy',
      documentation: 'The ID of the person who invited the User to the platform.',
      section: 'operationsInformation',
      order: 140,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.onboarding.model.Questionnaire',
      name: 'questionnaire',
      documentation: `Returns the response from the User to a questionnaire from the
        Questionnaire model.`,
      section: 'operationsInformation',
      order: 150
    },
    {
      class: 'String',
      name: 'signUpToken',
      storageTransient: true,
      documentation: `This is set to a random Universal Unique Identifier (UUID) that
        lets the User register with the platform from an email link. A sign up token
        is embedded in the email link.  This token includes a property that allows the
        backend to verify the email of the User and associate the User with the Contact
        that was created when inviting the User.
      `,
      section: 'operationsInformation',
      order: 160,
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      section: 'systemInformation',
      order: 40,
      gridColumns: 6,
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the User is deleted.',
      value: false,
      writePermissionRequired: true,
      visibility: 'RO',
      tableWidth: 85,
      section: 'deprecatedInformation',
      order: 10,
      gridColumns: 6,
      externalTransient: true
    },
    {
      class: 'Boolean',
      name: 'enabled',
      javaGetter: `
        return net.nanopay.admin.model.AccountStatus.DISABLED != getStatus();
      `,
      // NOTE: '_enabled_ is deprecated; use _status_ instead.',
      section: 'deprecatedInformation',
      order: 30
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN',
      externalTransient: true
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;',
      hidden: true
    },
    {
      class: 'String',
      name: 'externalId',
      visibility: 'HIDDEN'
    },
    {
      class: 'Map',
      name: 'externalData',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
        boolean isValidEmail = true;
        try {
          InternetAddress emailAddr = new InternetAddress(this.getEmail());
          emailAddr.validate();
        } catch (AddressException ex) {
          isValidEmail = false;
        }

        if ( this.getFirstName().length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("First name cannot exceed 70 characters.");
        }
        if ( this.getLastName().length() > NAME_MAX_LENGTH ) {
          throw new IllegalStateException("Last name cannot exceed 70 characters.");
        }
        if ( SafetyUtil.isEmpty(this.getEmail()) ) {
          throw new IllegalStateException("Email is required.");
        }
        if ( ! isValidEmail ) {
          throw new IllegalStateException("Invalid email address.");
        }

        List <PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          }
          catch ( IllegalStateException e ) {
            throw e;
          }
        }

        // Run the validation logic generated by validationPredicates.
        FObject.super.validate(x);
      `
    }
  ],

  actions: [
    {
      name: 'viewPayables',
      label: 'View Payables',
      section: 'accountInformation',
      order: 10,
      availablePermissions: ['foam.nanos.auth.User.permission.viewPayables'],
      code: async function(X) {
        var dao = this.expenses;
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${this.PAYABLES_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'viewReceivables',
      label: 'View Receivables',
      section: 'accountInformation',
      tableWidth: 180,
      order: 20,
      availablePermissions: ['foam.nanos.auth.User.permission.viewReceivables'],
      code: async function(X) {
        var dao = this.sales;
        this.__context__.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${this.RECEIVABLES_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'viewTransactions',
      label: 'View Transactions',
      section: 'accountInformation',
      order: 30,
      tableWidth: 160,
      availablePermissions: ['foam.nanos.auth.User.permission.viewTransactions'],
      code: async function(X) {
        var m = foam.mlang.ExpressionsSingleton.create({});
        var ids = await X.accountDAO
          .where(m.EQ(net.nanopay.account.Account.OWNER, this.id))
          .select(m.MAP(net.nanopay.account.Account.ID))
          .then((sink) => sink.delegate.array);
        var dao = X.transactionDAO.where(
          m.OR(
            m.IN(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, ids),
            m.IN(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, ids)
          )
        );
        X.stack.push({
          class: 'foam.comics.v2.DAOBrowseControllerView',
          data: dao,
          config: {
            class: 'foam.comics.v2.DAOControllerConfig',
            dao: dao,
            createPredicate: foam.mlang.predicate.False,
            editPredicate: foam.mlang.predicate.True,
            browseTitle: `${dao.of.model_.plural} ${this.FOR_MSG} ${this.toSummary()}`
          }
        });
      }
    },
    {
      name: 'resetLoginAttempts',
      section: 'userInformation',
      tableWidth: 185,
      order: 10,
      code: async function(X) {
        var loginAttempts = await X.loginAttemptsDAO.find(this.id);
        if ( loginAttempts == undefined || loginAttempts.loginAttempts == 0 ) {
          X.notify(this.RESET_LOGIN_INFO, '', this.LogLevel.WARN, true);
        } else {
          loginAttempts.loginAttempts = 0;
          X.loginAttemptsDAO.put(loginAttempts)
            .then(result => {
              X.notify(this.RESET_LOGIN_SUCCESS, '', this.LogLevel.INFO, true);
            });
        }
      }
    },
    {
      name: 'disableTwoFactor',
      label: 'Disable TFA',
      section: 'userInformation',
      order: 20,
      code: async function(X) {
        var user = await X.userDAO.find(this.id);
        if ( ! user.twoFactorEnabled ) {
          X.notify(this.TWO_FACTOR_INFO, '', this.LogLevel.WARN, true);
        } else {
          user.twoFactorEnabled = false;
          X.userDAO.put(user)
            .then(() => {
              X.notify(this.TWO_FACTOR_SUCCESS, '', this.LogLevel.INFO, true);
            });
        }
      }
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public User findUser(X x, long userId) {
              DAO bareUserDAO = (DAO) x.get("bareUserDAO");
              DAO contactDAO = (DAO) x.get("contactDAO");
              DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
              User user = null;
              try {
                user = (User) contactDAO.find(userId);
                if ( user != null && user instanceof Contact && ((Contact) user).getBusinessId() > 0 ) {
                  return (User) localBusinessDAO.find(((Contact) user).getBusinessId());
                }
                if ( user == null ) {
                  return (User) bareUserDAO.find(userId);
                }
              } catch(Exception e) {
                ((foam.nanos.logger.Logger) x.get("logger")).warning("User", "findUser", userId, e);
              }
              return user;
            }
        `);
      }
    }
  ]
});

foam.RELATIONSHIP({
  cardinality: '1:*',

  forwardName: 'user',
  targetModel: 'foam.nanos.auth.User',
  targetDAOKey: 'localUserDAO',
  targetProperty: {
    hidden: true
  },

  inverseName: 'token',
  sourceModel: 'net.nanopay.auth.openid.SSOToken',
  sourceDAOKey: 'ssoTokenDAO',
  sourceProperty: {
    hidden: true
  }
});
