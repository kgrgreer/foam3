foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Branch',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'branch',
  cardinality: '1:*',
  targetDAOKey: 'accountDAO',
  unauthorizedTargetDAOKey: 'localAccountDAO',
  targetProperty: {
    view: function(_, X) {
      return foam.u2.view.ChoiceView.create({
        dao: X.branchDAO,
        placeholder: '--',
        objToChoice: function(branch) {
          return [branch.id, branch.branchId];
        }
      });
    },
    label: 'Transit No.',
    view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' },
    tableCellFormatter: function(value, obj, axiom) {
      var self = this;
      this.__subSubContext__.branchDAO.find(value).then( function( branch ) {
        if ( branch ) {
          self.add(branch.branchId);
          self.tooltip = branch.branchId;
        }
      });
    }
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
    view: function(_, X) {
      return foam.u2.view.ChoiceView.create({
        dao: X.institutionDAO,
        placeholder: '--',
        objToChoice: function(institution) {
          return [institution.id, institution.name];
        }
      });
    },
    tableCellFormatter: function(value, obj, axiom) {
      var self = this;
      this.__subSubContext__.institutionDAO.find(value)
        .then( function( institution ) {
          if ( institution ) {
            var displayinstitution;
            if ( institution.institutionNumber !== "" ) {
              displayinstitution = institution.institutionNumber;
            }  else {
              displayinstitution = institution.name;
            }
            self.add(displayinstitution);
            self.tooltip  = displayinstitution;
          }
        }).catch( function( error ) {
          self.add('N/A');
          console.error(error);
        });
    }
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
  targetProperty: {
    section: 'accountDetails',
    order: 4,
    view: function(_, X) {
      var E = foam.mlang.Expressions.create();
      return {
        class: 'foam.u2.view.ReferenceView',
        dao: X.accountDAO.orderBy(net.nanopay.account.Account.NAME),
        placeholder: 'select Parent',
        objToChoice: function(o) { return [o.id, o.name ? o.name : '' + o.id]; }
      };
    }
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
    label: ''
  },
  targetProperty: {
    section: 'liquiditySettingsSection',
    label: '',
    value: 0,
    view: {
      class: 'foam.u2.view.FullReferenceView'
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.account.Account',
  forwardName: 'accounts',
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
            dao: X.userDAO,
          }
        ],
      });
    },
    tableCellFormatter: function(value, obj, axiom) {
      this.__subSubContext__.userDAO
        .find(value)
        .then((user) => {
          this.add('[', user.cls_.name, '] ', user.label());
        })
        .catch((error) => {
          this.add(value);
        });
    },
    tableWidth: 220
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
          this.add('[', user.cls_.name, '] ', user.label());
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
  cardinality: '1:*'
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
      of: 'net.nanopay.tx.model.TransactionLimit'
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'children',
  inverseName: 'parent'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'associatedTransactions',
  inverseName: 'associateTransaction',
  sourceProperty: { view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' } },
  targetProperty: { view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' } }
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.invoice.model.RecurringInvoice',
  targetModel: 'net.nanopay.invoice.model.Invoice',
  forwardName: 'invoices',
  inverseName: 'recurringInvoice'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'partners',
  inverseName: 'partnered',
  junctionDAOKey: 'partnerJunctionDAO'
});

foam.CLASS({
  package: 'net.nanopay.model',
  name: 'UserUserJunctionRefine',
  refines: 'foam.nanos.auth.UserUserJunction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.model.Business'
  ],

  implements: [
    'foam.nanos.auth.Authorizable'
  ],

  properties: [
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
      class: 'Enum',
      of: 'net.nanopay.auth.AgentJunctionStatus',
      name: 'status',
      documentation: 'Describes the active state between agent and entity.',
      permissionRequired: true,
      value: net.nanopay.auth.AgentJunctionStatus.ACTIVE
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

        if ( ! auth.check(x, (String) buildPermissionString(x, this, "add")) ) {
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

        User user = (User) x.get("user");
        User agent = (User) x.get("agent");
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

        if ( ! ( isSourceOrTarget || auth.check(x, (String) buildPermissionString(x, this, "read")) )){
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
        if ( ! auth.check(x, (String) buildPermissionString(x, this, "update")) ) {
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

        if ( ! auth.check(x, (String) buildPermissionString(x, this, "remove")) ) {
          throw new AuthorizationException("Unable to remove object due to permission restrictions.");
        }
      `
    },
    {
      name: 'buildPermissionString',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'junctionObj', type: 'foam.nanos.auth.UserUserJunction' },
        { name: 'permissionAction', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
        Business targetUser = (Business) localBusinessDAO.inX(x).find(junctionObj.getTargetId());

        if ( targetUser == null ) {
          Logger logger = (Logger) x.get("logger");
          logger.error(String.format("Could not find business with id = %d in localBusinessDAO. The source id, which is the id of the user, is %d.", junctionObj.getTargetId(), junctionObj.getSourceId()));
          throw new RuntimeException("An unexpected error occured. Please try again later.");
        }

        // Permission string to check authorization.
        String permissionString = "business." + permissionAction + "." + targetUser.getBusinessPermissionId() + ".*";

        return permissionString;
      `
    }
  ]
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  package: 'net.nanopay.auth',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.contacts.Contact',
  forwardName: 'contacts',
  inverseName: 'owner',
  targetDAOKey: 'contactDAO',
  unauthorizedTargetDAOKey: 'localContactDAO',
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
  targetProperty: { hidden: true },
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
  targetDAOKey: 'beneficialOwnerDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'debits',
  inverseName: 'sourceAccount',
  cardinality: '1:*',
  sourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'transactionDAO',
  unauthorizedTargetDAOKey: 'localTransactionDAO',
  targetProperty: { visibility: 'RO' }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'credits',
  inverseName: 'destinationAccount',
  cardinality: '1:*',
  sourceDAOKey: 'localAccountDAO',
  targetDAOKey: 'transactionDAO',
  unauthorizedTargetDAOKey: 'localTransactionDAO',
  targetProperty: { visibility: 'RO' }
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
  targetProperty: { visibility: 'RO' }
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
  targetProperty: { visibility: 'RO' }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'net.nanopay.approval.ApprovalRequest',
  forwardName: 'approvalRequests',
  inverseName: 'entityId',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'approvalRequestDAO',
  targetProperty: { visibility: 'RO' }
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
  targetProperty: { visibility: 'RO' }
});
