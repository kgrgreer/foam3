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

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Branch',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'branch',
  cardinality: '1:*',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  targetProperty: {
    visibility: 'HIDDEN'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.payment.Institution',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'institution',
  cardinality: '1:*',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  targetProperty: {
    visibility: 'HIDDEN'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.TransactionPurpose',
  targetModel: 'net.nanopay.payment.InstitutionPurposeCode',
  forwardName: 'institutionPurposeCodes',
  inverseName: 'transactionPurpose',
  cardinality: '1:*',
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.payment.Institution',
  targetModel: 'net.nanopay.model.Branch',
  forwardName: 'branches',
  inverseName: 'institution',
  cardinality: '1:*',
  targetProperty: {
    view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.account.Account',
  inverseName: 'parent',
  forwardName: 'children',
  cardinality: '1:*',
  sourceProperty: {
    section: 'parentInformation',
    order: 10
  },
  targetProperty: {
    section: 'parentInformation',
    order: 20,
    gridColumns: 6,
    label: 'Parent Account',
    tableCellFormatter: function(value, obj, axiom) {
      this.__subSubContext__.accountDAO
        .find(value)
        .then((account) => this.add(account.summary))
        .catch((error) => {
          this.add(value);
        });
    },
    view: function(_, X) {
      const e = foam.mlang.Expressions.create();
      const Account = net.nanopay.account.Account;
      const LifecycleState = foam.nanos.auth.LifecycleState;
      return {
        class: 'foam.u2.view.RichChoiceView',
        search: true,
        sections: [
          {
            heading: 'Accounts',
            dao: X.accountDAO
              .where(
                e.AND(
                  e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                  e.OR(
                    e.INSTANCE_OF(net.nanopay.account.AggregateAccount),
                    foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
                  )
                )
              ).orderBy(Account.NAME)
          }
        ]
      };
    },
    readPermissionRequired: true
  }
});

// A securities account is one account that all the security transactions go to and from. The subaccounts hold the actual securities, and there is one per Security`
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.account.Account',
  inverseName: 'securitiesAccount',
  forwardName: 'subAccounts',
  targetDAOKey: 'accountDAO',
  sourceDAOKey: 'accountDAO',
  cardinality: '1:*',
  sourceProperty: {
    section: 'parentInformation',
    order: 30
  },
  targetProperty: {
    section: 'accountInformation',
    order: 190,
    gridColumns: 6
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.liquidity.LiquiditySettings',
  targetModel: 'net.nanopay.account.DigitalAccount',
  inverseName: 'liquiditySetting',
  forwardName: 'accounts',
  cardinality: '1:*',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  sourceProperty: {
    section: 'accountsSection',
    label: '',
    updateVisibility: 'RO'
  },
  targetProperty: {
    section: 'liquiditySettingsInformation',
    label: '',
    tableCellFormatter: function(value, obj, axiom) {
      this.__subSubContext__.liquiditySettingsDAO
        .find(value)
        .then((liquidSetting) => this.add(liquidSetting.name))
        .catch((error) => {
          this.add(value);
        });
    },
    view: function(_, X) {
      const e = foam.mlang.Expressions.create();
      const LiquiditySettings = net.nanopay.liquidity.LiquiditySettings;
      const LifecycleState = foam.nanos.auth.LifecycleState;
      return {
        class: 'foam.u2.view.RichChoiceView',
        allowClearingSelection: true,
        search: true,
        sections: [
          {
            heading: 'Liquidity Setting',
            dao: X.liquiditySettingsDAO
              .where(e.EQ(LiquiditySettings.LIFECYCLE_STATE, LifecycleState.ACTIVE))
              .orderBy(LiquiditySettings.NAME)
          }
        ]
      };
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.account.Account',
  forwardName: 'accounts',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  sourceProperty: {
    section: 'accountInformation'
  },
  targetProperty: {
    section: 'ownerInformation',
    order: 10,
    gridColumns: 6
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.payment.PayrollEntry',
  forwardName: 'payrolls',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    view: function(_, X) {
      return foam.u2.view.RichChoiceView.create({
        search: true,
        selectionView: { class: 'net.nanopay.ui.UserSelectionView', userDAO: X.userDAO },
        rowView: { class: 'net.nanopay.ui.UserRowView' },
        sections: [
          {
            dao: X.userDAO
          }
        ]
      });
    },
    tableCellFormatter: function(value, obj, axiom) {
      this.__subSubContext__.userDAO
        .find(value)
        .then((user) => {
          this.add('[', user.cls_.name, '] ', user.toSummary());
        })
        .catch((error) => {
          this.add(value);
        });
    }
  }
});

// foam.RELATIONSHIP({
//   sourceModel: 'foam.nanos.auth.User',
//   targetModel: 'net.nanopay.bank.BankAccount',
//   forwardName: 'bankAccounts',
//   inverseName: 'owner',
//   cardinality: '1:*',
//   sourceProperty: {
//     hidden: true
//   }
// });

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.cico.paymentCard.model.PaymentCard',
  forwardName: 'paymentCards',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    readPermissionRequired: true,
    section: 'operationsInformation',
    order: 170
  }
});

/*
foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.tx.model.TransactionLimit',
  forwardName: 'transactionLimits',
  inverseName: 'owner'
});
*/

// Store Transaction Limits as an internal array rather than as an external DAO
foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserTransactionLimitRefine',
  refines: 'foam.nanos.auth.User',
  properties: [
    {
      class: 'FObjectArray',
      name: 'transactionLimits',
      of: 'net.nanopay.tx.model.TransactionLimit',
      createVisibility: 'HIDDEN',
      section: 'operationsInformation',
      order: 110
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: {
    section: 'transactionInformation',
    order: 187,
    updateVisibility: 'RO',
    readVisibility: 'RO',
    createVisibility: 'HIDDEN'
  },
  targetProperty: {
    section: 'transactionInformation',
    order: 185,
    gridColumns: 6,
    updateVisibility: 'RO',
    readVisibility: 'RO',
    createVisibility: 'HIDDEN'
  }
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'associatedTransactions',
  inverseName: 'associateTransaction',
  sourceProperty: {
    section: 'systemInformation',
    order: 60,
    createVisibility: 'HIDDEN',
    readVisibility: 'RO',
    updateVisibility: 'RO',
    view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' }
  },
  targetProperty: {
    section: 'systemInformation',
    order: 70,
    createVisibility: 'HIDDEN',
    readVisibility: 'RO',
    updateVisibility: 'RO',
    view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' }
  }
});

//foam.RELATIONSHIP({
//  cardinality: '1:*',
//  sourceModel: 'net.nanopay.invoice.model.RecurringInvoice',
//  targetModel: 'net.nanopay.invoice.model.Invoice',
//  forwardName: 'invoices',
//  inverseName: 'recurringInvoice'
//});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'partners',
  inverseName: 'partnered',
  junctionDAOKey: 'partnerJunctionDAO',
  sourceProperty: {
    createVisibility: 'HIDDEN',
    section: 'contactInformation',
    order: 20
  },
  targetProperty: {
    createVisibility: 'HIDDEN',
    section: 'contactInformation',
    order: 30
  }
});

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserUserJunctionRefine',
  refines: 'foam.nanos.auth.UserUserJunction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'net.nanopay.model.Business'
  ],

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  messages: [
    { name: 'VIEW_TITLE_USER', message: 'Users' }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'sourceId',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReadReferenceView',
            of: 'foam.nanos.auth.User'
          },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            search: true,
            rowView: { class: 'net.nanopay.ui.UserRowView' },
            sections: [
              {
                heading: X.data.VIEW_TITLE_USER,
                dao: X.userDAO
              }
            ]
          }
        };
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'targetId',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReadReferenceView',
            of: 'foam.nanos.auth.User'
          },
          writeView: {
            class: 'foam.u2.view.RichChoiceView',
            search: true,
            rowView: { class: 'net.nanopay.ui.UserRowView' },
            sections: [
              {
                heading: X.data.VIEW_TITLE_USER,
                dao: X.userDAO
              }
            ]
          }
        };
      }
    },
    {
      class: 'Long',
      name: 'partnerId',
      documentation: `
        If a non-admin user selects or finds on the partnerJunctionDAO, this
        property will be set to the id of the calling user's partner.

        For example, if user 1 is partners with user 2, then the source id is 1
        and the target id is 2. If user 1 does a select on the
        partnerJunctionDAO, then partnerId on the junction object will be set to
        2. If user 2 does a select, they'll get partnerId set to 1.

        Since admins have all permissions, when an admin user selects on the
        partnerJunctionDAO, they'll get all results, meaning the admin's id will
        match neither the source id nor the target id. In this case, partnerId
        will be set to the source id and otherPartnerId will be set to the
        target id.
      `,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'partnerInfo',
      documentation: `
        Public user info about the partner. See documentation on partnerId for
        more information.
      `,
      storageTransient: true
    },
    {
      class: 'Long',
      name: 'yourId',
      documentation: `
        Mostly relevant in admin contexts. The id of the other user in the
        partner relationship.
      `,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'yourInfo',
      documentation: `
        Mostly relevant in admin contexts. The public user info for the other
        user in the partner relationship.
      `,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'jobTitle',
      documentation: `Job title of source user.`
    },
    {
      flags: ['js'],
      name: 'targetUser',
      expression: function(targetId) {
        const user = foam.nanos.auth.User.create({ id: targetId }, this);
        user.copyFrom(targetId === this.yourId ? this.yourInfo : this.partnerInfo);
        return user;
      },
      hidden: true
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupDAO = (DAO) x.get("groupDAO");
        if ( this.getTargetId() == 0 ) {
          // temporary fix to deal with Empty/Invalid Junctions being
          // found on the nanoConnect side for users like 'admin'
          return;
        }

        // Checks if the junction's group exists.
        Group groupToBePut = (Group) groupDAO.inX(x).find(this.getGroup());

        if ( groupToBePut == null ) {
          throw new IllegalStateException(String.format("No group found with id '%s'.", this.getGroup()));
        }

        var permission = buildBusinessPermissionString(x, this, "add");
        if ( permission != null && ! auth.check(x, permission) ) {
          throw new AuthorizationException("Unable to create junction due to permission restrictions.");
        }

        if ( ! auth.check(x, "group.update." + this.getGroup()) ) {
          throw new AuthorizationException("Unable to assign group to relationship due to permission restrictions.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' },
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // Check global permissions and user relation to junction.

        if ( this.getTargetId() == 0 ) {
          // temporary fix to deal with Empty/Invalid Junctions being
          // found on the nanoConnect side for users like 'admin'
          return;
        }

        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        // Let users read junctions where they're the source or target user.
        boolean isSourceOrTarget =
          SafetyUtil.equals(this.getSourceId(), user.getId()) ||
          SafetyUtil.equals(this.getTargetId(), user.getId()) ||
          (
            agent != null &&
            (
              SafetyUtil.equals(this.getSourceId(), agent.getId()) ||
              SafetyUtil.equals(this.getTargetId(), agent.getId())
            )
          );

        if ( ! ( isSourceOrTarget || auth.check(x, buildBusinessPermissionString(x, this, "read")) )){
          throw new AuthorizationException("Unable to retrieve junction due to permission restrictions.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupDAO = (DAO) x.get("groupDAO");

        if ( this.getTargetId() == 0 ) {
          // temporary fix to deal with Empty/Invalid Junctions being
          // found on the nanoConnect side for users like 'admin'
          return;
        }

        // Checks if the junction's group exists.
        Group groupToBePut = (Group) groupDAO.inX(x).find(this.getGroup());

        if ( groupToBePut == null ) {
          throw new IllegalStateException("Junction object group doesn't exist.");
        }

        // Checks authorization using update permission.
        var permission = buildBusinessPermissionString(x, this, "update");
        if ( permission != null && ! auth.check(x, permission) ) {
          throw new AuthorizationException("Unable to update junction due to permission restrictions.");
        }

        if ( ! auth.check(x, "group.update." + this.getGroup()) ) {
          throw new AuthorizationException("Unable to assign group to relationship due to permission restrictions.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupDAO = (DAO) x.get("groupDAO");

        if ( this.getTargetId() == 0 ) {
          // temporary fix to deal with Empty/Invalid Junctions being
          // found on the nanoConnect side for users like 'admin'
          return;
        }

        var permission = buildBusinessPermissionString(x, this, "remove");
        if ( permission != null && ! auth.check(x, permission) ) {
          throw new AuthorizationException("Unable to remove object due to permission restrictions.");
        }

        if ( ! auth.check(x, "group.update." + this.getGroup()) ) {
          throw new AuthorizationException("Unable to remove relationship due to permission restrictions.");
        }
      `
    },
    {
      name: 'buildBusinessPermissionString',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'junctionObj', type: 'foam.nanos.auth.UserUserJunction' },
        { name: 'permissionAction', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        Business targetUser = (Business) localBusinessDAO.inX(x).find(junctionObj.getTargetId());

        if ( targetUser != null ) {
          return "business." + permissionAction + "." + targetUser.getBusinessPermissionId() + ".*";
        }
        return null;
      `
    }
  ]
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  package: 'net.nanopay.auth',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.contacts.PersonalContact',
  forwardName: 'contacts',
  inverseName: 'owner',
  targetDAOKey: 'contactDAO',
  unauthorizedTargetDAOKey: 'localContactDAO',
  sourceProperty: {
    readPermissionRequired: true,
    section: 'contactInformation',
    order: 10
  },
  targetProperty: {
    section: 'userInformation'
  }
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.model.BusinessSector',
  targetModel: 'net.nanopay.model.BusinessSector',
  forwardName: 'children',
  inverseName: 'parent',
  sourceProperty: { view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' } },
  targetProperty: { view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' } }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.ServiceProvider',
  targetModel: 'net.nanopay.tx.model.TransactionFee',
  forwardName: 'transactionFees',
  inverseName: 'spid',
  cardinality: '1:*',
  targetProperty: {
    hidden: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.ServiceProvider',
  targetModel: 'net.nanopay.tx.LineItemType',
  forwardName: 'lineItemTypes',
  inverseName: 'spid',
  cardinality: '1:*',
  targetProperty: {
    hidden: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.ServiceProvider',
  targetModel: 'net.nanopay.tx.LineItemFee',
  forwardName: 'lineItemFees',
  inverseName: 'spid',
  cardinality: '1:*',
  targetProperty: {
    hidden: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.ServiceProvider',
  targetModel: 'net.nanopay.tax.LineItemTax',
  forwardName: 'lineItemTax',
  inverseName: 'spid',
  cardinality: '1:*',
  targetProperty: {
    hidden: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Business',
  targetModel: 'foam.nanos.auth.User',
  cardinality: '*:*',
  forwardName: 'signingOfficers',
  inverseName: 'businessesInWhichThisUserIsASigningOfficer',
  sourceProperty: {
    createVisibility: 'HIDDEN',
    section: 'ownerInformation',
    order: 80
  },
  targetProperty: {
    label: 'Businesses User is Signing Officer Within',
    createVisibility: 'HIDDEN',
    section: 'ownerInformation',
    order: 81
  },
  junctionDAOKey: 'signingOfficerJunctionDAO'
});

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'BusinessUserJunctionPropertyRefinement',
  refines: 'net.nanopay.model.BusinessUserJunction',

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.admin.model.ComplianceStatus',
      name: 'compliance',
      storageTransient: true
    }
  ]
});

/*
 * Originally this was intended to be a many-to-many relationship because it
 * makes sense that a user could be a beneficial owner in multiple businesses.
 * However, it's much simpler to make this this a one-to-many relationship for
 * the reasons outlined below.
 *
 * Requirements:
 *   1. Businesses to be able to edit the information on the beneficial owners
 *      they add to their company.
 *
 * Issues with making it a many-to-many relationship:
 *   1. If a user is a beneficial owner in multiple businesses, then when one
 *      company edits the information on that user, all of the other companies
 *      that user is a beneficial owner in would see those changes.
 *   2. If a user is a beneficial owner in multiple businesses, each business
 *      needs permission to edit that user. For this to happen, we need to
 *      modify permissions for business admin groups on a business-per-business
 *      basis. However, we want to avoid groups that are specific to individual
 *      businesses to avoid group bloat.
 *   3. If we did choose to do this, we'd have to make sure businesses could
 *      only edit the ownership percent (and not the other fields like name and
 *      address) for beneficial owners that are in other businesses as well.
 *      This condition makes writing the code much trickier to get right, which
 *      means much more prone to bugs and misunderstanding.
 *
 * Making this a one-to-many relationship avoids all of the issues above
 * completely because every business will completely "own" the beneficial owner
 * user objects for their company, so there's nothing to worry about regarding
 * permissions and checking whether you can edit or not. Businesses will always
 * be able to safely do whatever they want with their beneficial owner user
 * objects because they won't be shared.
 *
 * Note that it's not that making it a many-to-many relationship couldn't be
 * done, it's just that it's much easier and simpler to make it a one-to-many
 * relationship and the cases in which a many-to-many relationship would be
 * better (ie: when a user is a beneficial owner in more than one company) are
 * highly uncommon anyway.
 *
 * In summary, we're simplifying the logic around this feature to optimize for
 * the common case at the expense of some duplicated data in uncommon cases.
 */
foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.model.Business',
  targetModel: 'net.nanopay.model.BeneficialOwner',
  forwardName: 'beneficialOwners',
  inverseName: 'business',
  targetDAOKey: 'beneficialOwnerDAO',
  sourceProperty: {
    section: 'ownerInformation',
    order: 50
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'debits',
  inverseName: 'sourceAccount',
  cardinality: '1:*',
  sourceDAOKey: 'accountDAO',
  unauthorizedSourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'transactionDAO',
  unauthorizedTargetDAOKey: 'localTransactionDAO',
  sourceProperty: {
    section: 'transactionInformation'
  },
  targetProperty: {
    help: `Set this to the account you would like to withdraw funds from.
    Selection of shadow accounts is only available for admin of group.`,
    label: 'Payer Account',
    section: 'transactionInformation',
    order: 30,
    gridColumns: 6,
    required: true,
    postSet: function(_, n) {
      // only want this postSet to fire off when we are creating txns not viewing
      if ( this.mode == 'create' ){
        this.accountDAO.find(n).then((a) => {
          // NOTES:
          // DigitalAccounts are used for creation of txn, which is where we wanted the below functionality
          // Security accounts break with the below functionality
          if ( a && net.nanopay.account.DigitalAccount.isInstance(a) ) {
            this.sourceCurrency = a.denomination;
          }
        });
      }
    },
    updateVisibility: 'RO',
    section: 'transactionInformation',
    tableWidth: 180,
    javaToCSVLabel: `
      outputter.outputValue("Sender User Id");
      outputter.outputValue("Sender Name");
    `,
    javaToCSV: `
      net.nanopay.account.Account account = (Account)((Transaction)obj).findSourceAccount(x);
      if ( account != null ) {
        User sender = account.findOwner(x);
        outputter.outputValue(sender.getId());
        outputter.outputValue(sender.toSummary());
      } else {
        ((foam.nanos.logger.Logger) x.get("logger")).error("Transaction.sourceAccount not found (during toCSV).", ((Transaction)obj).getId());
      }
    `,
    includeInDigest: true,
    view: {
      class: 'foam.u2.view.ReferencePropertyView',
      readView: {
        class: 'foam.u2.view.ReadReferenceView',
        enableLink: false
      }
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'credits',
  inverseName: 'destinationAccount',
  cardinality: '1:*',
  sourceDAOKey: 'accountDAO',
  unauthorizedSourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'transactionDAO',
  unauthorizedTargetDAOKey: 'localTransactionDAO',
  sourceProperty: {
    section: 'transactionInformation',
    readVisibility: 'RO',
    updateVisibility: 'RO'
  },
  targetProperty: {
    help: `Please input your payee's account id. Confirm account id with contact externally.`,
    label: 'Payee Account',
    section: 'transactionInformation',
    order: 70,
    gridColumns: 6,
    required: true,
    readVisibility: 'RO',
    updateVisibility: 'RO',
    postSet: function(o, n) {
      if ( this.mode == 'create' ) { // validation check for users manually creating a Transaction
        // setup
        var setValues = (value, txt) => {
          this.destinationCurrency = value;
          this.dstAccountError = txt;
        };
        if ( n == 0 ) setValues(undefined, 'please input an account id.');
        var x = this.__subContext__;
        if ( ! x.canReceiveCurrencyDAO ) setValues(undefined, 'issue loading service.');

        // check
        var request = this.CanReceiveCurrency.create({ accountChoice: n });
        x.canReceiveCurrencyDAO.put(request).then((responseObj) => {
          if ( responseObj.response ) {
            return setValues(responseObj.message, '');
          }
          setValues(undefined, 'Account Id entered is either not accepting transactions or does not exist.');
        }).catch((e) => console.warn('validation on Transaction.destinationAccount error:', e.message || e));
      }
    },
    validateObj: function(dstAccountError, destinationAccount) {
      if ( destinationAccount == 0 ) return 'please input an account id.';
      return dstAccountError;
    },
    tableWidth: 180,
    javaToCSVLabel: `
      outputter.outputValue("Receiver User Id");
      outputter.outputValue("Receiver Name");
    `,
    javaToCSV: `
      net.nanopay.account.Account account = (Account)((Transaction)obj).findDestinationAccount(x);
      if ( account != null ) {
        User receiver = account.findOwner(x);
        outputter.outputValue(receiver.getId());
        outputter.outputValue(receiver.toSummary());
      } else {
        ((foam.nanos.logger.Logger) x.get("logger")).error("Transaction.destinationAccount not found (during toCSV).", ((Transaction)obj).getId());
      }
    `,
    includeInDigest: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  forwardName: 'flinksResponses',
  inverseName: 'flinksAccount',
  cardinality: '1:*',
  sourceDAOKey: 'accountDAO',
  unauthorizedSourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'flinksAccountsDetailResponseDAO',
  sourceProperty: {
    section: 'complianceInformation',
    order: 20
  },
  targetProperty: { visibility: 'RO' }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.plaid.model.PlaidAccountDetail',
  forwardName: 'plaidResponses',
  inverseName: 'plaidAccount',
  cardinality: '1:*',
  sourceDAOKey: 'accountDAO',
  unauthorizedSourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'plaidAccountDetailDAO',
  sourceProperty: {
    section: 'complianceInformation',
    order: 30
  },
  targetProperty: { visibility: 'RO' }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.meter.compliance.ComplianceItem',
  forwardName: 'complianceResponses',
  inverseName: 'entityId',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'complianceItemDAO',
  targetProperty: {
    readVisibility: 'RO',
    updateVisibility: 'RO'
  },
  sourceProperty: {
    readPermissionRequired: true,
    section: 'complianceInformation',
    order: 50
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.ruler.RuleHistory',
  forwardName: 'complianceHistories',
  inverseName: 'entityId',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'complianceHistoryDAO',
  targetProperty: {
    readVisibility: 'RO',
    updateVisibility: 'RO'
  },
  sourceProperty: {
    readPermissionRequired: true,
    section: 'complianceInformation',
    order: 40
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'foam.nanos.ruler.RuleHistory',
  forwardName: 'complianceHistories',
  inverseName: 'transactionEntityId',
  cardinality: '1:*',
  sourceDAOKey: 'transactionDAO',
  unauthorizedSourceDAOKey: 'localTransactionDAO',
  targetDAOKey: 'complianceHistoryDAO',
  targetProperty: {
    readVisibility: 'RO',
    updateVisibility: 'RO'
  },
  sourceProperty: {
    readPermissionRequired: true,
    section: 'complianceInformation'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.meter.compliance.ComplianceItem',
  forwardName: 'complianceResponses',
  inverseName: 'transactionId',
  cardinality: '1:*',
  sourceDAOKey: 'transactionDAO',
  unauthorizedSourceDAOKey: 'localTransactionDAO',
  targetDAOKey: 'complianceItemDAO',
  targetProperty: { visibility: 'RO' },
  sourceProperty: {
    section: 'complianceInformation',
    createVisibility: 'HIDDEN',
    readVisibility: 'RO',
    updateVisibility: 'RO'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.SummaryTransaction',
  targetModel: 'net.nanopay.tx.billing.Bill',
  forwardName: 'bills',
  inverseName: 'originatingSummaryTransaction',
  cardinality: '1:*',
  sourceDAOKey: 'transactionDAO',
  unauthorizedSourceDAOKey: 'localTransactionDAO',
  targetDAOKey: 'billDAO',
  sourceProperty: {
    section: 'systemInformation'
  },
  targetProperty: {
    label: 'Transaction Reference',
    view: {
      class: 'foam.u2.view.ReferencePropertyView',
      readView: 'net.nanopay.tx.model.TransactionReadReferenceView'
    },
    tableCellFormatter: function(value, obj) {
      obj.summaryTransactionDAO.find(value).then(function(tx) {
        if ( tx && tx.toSummary ) {
          this.add(tx.toSummary());
        } else {
          this.add(value);
        }
      }.bind(this));
    },
    section: 'billInformation',
    order: 40,
    gridColumns: 6
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.SummaryTransaction',
  targetModel: 'net.nanopay.tx.billing.Bill',
  forwardName: 'chargedBills',
  inverseName: 'billingTransaction',
  cardinality: '1:*',
  sourceDAOKey: 'transactionDAO',
  unauthorizedSourceDAOKey: 'localTransactionDAO',
  targetDAOKey: 'billDAO',
  targetProperty: {
    view: {
      class: 'foam.u2.view.ReferencePropertyView',
      readView: 'net.nanopay.tx.model.TransactionReadReferenceView'
    },
    section: 'billInformation',
    order: 90,
    gridColumns: 6
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.exchangeable.AssetClass',
  targetModel: 'net.nanopay.exchangeable.Security',
  forwardName: 'members',
  inverseName: 'assetClass',
  cardinality: '1:*',
  sourceDAOKey: 'assetClassDAO',
  targetDAOKey: 'securitiesDAO',
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.TransactionEvent',
  forwardName: 'transactionEvents',
  inverseName: 'transaction',
  cardinality: '1:*',
  sourceDAOKey: 'transactionDAO',
  targetDAOKey: 'transactionEventDAO',
  sourceProperty: {
    section: 'systemInformation',
    order: 50,
    createVisibility: 'HIDDEN',
    readVisibility: 'RO',
    updateVisibility: 'RO'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.payment.PaymentCode',
  forwardName: 'paymentCode',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    section: 'operationsInformation',
    order: 180
  }
});

foam.RELATIONSHIP({
  package: 'net.nanopay.payment',
  sourceModel: 'net.nanopay.payment.PaymentProvider',
  targetModel: 'net.nanopay.payment.PaymentMethod',
  forwardName: 'paymentProvider',
  inverseName: 'paymentMethods',
  cardinality: '1:*'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'net.nanopay.country.br.NatureCode',
  targetModel: 'net.nanopay.payment.PaymentProvider',
  forwardName: 'paymentProviders',
  inverseName: 'natureCodes',
  junctionDAOKey: 'NatureCodePaymentProviderJunctionDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.TrustAccount',
  targetModel: 'net.nanopay.account.DigitalAccount',
  forwardName: 'digitalAccounts',
  inverseName: 'trustAccount',
  cardinality: '1:*',
  sourceDAOKey: 'accountDAO',
  targetDAOKey: 'accountDAO',
});
