foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.model.Branch',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'branch',
  cardinality: '1:*',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    label: 'Transit No.',
    tableCellFormatter: function(value, obj, axiom) {
      var self = this;
      this.__subSubContext__.branchDAO.find(value).then( function( branch ) {
        if ( branch ) self.add(branch.branchId);
      });
    }
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.payment.Institution',
  targetModel: 'net.nanopay.bank.BankAccount',
  forwardName: 'bankAccounts',
  inverseName: 'institution',
  cardinality: '1:*'
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
    tableCellFormatter: function(value, obj, axiom) {
      var self = this;
      this.__subSubContext__.userDAO.find(value)
      .then( function( user ) {
        self.add(user.firstName);
      }).catch(function(error) {
        self.add(value);
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
  cardinality: '*:*',
  sourceModel: 'net.nanopay.account.Account',
  targetModel: 'net.nanopay.account.Account',
  forwardName: 'children',
  inverseName: 'parent',
  junctionDAOKey: 'accountJunctionDAO'
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.tx.model.Transaction',
  targetModel: 'net.nanopay.tx.model.Transaction',
  forwardName: 'children',
  inverseName: 'parent',
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
  refines: 'foam.nanos.auth.UserUserJunction',

  javaImports: [
    'foam.dao.DAO',
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
      value: net.nanopay.auth.AgentJunctionStatus.ACTIVE
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupDAO = (DAO) x.get("groupDAO");

        // Checks if the junction's group exists.
        Group groupToBePut = (Group) groupDAO.inX(x).find(this.getGroup());

        if ( groupToBePut == null ) {
          throw new IllegalStateException("Junction object group doesn't exist.");
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
        { name: 'x', javaType: 'foam.core.X' },
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // Check global permissions and user relation to junction.

        User user = (User) x.get("user");
        User agent = (User) x.get("agent");
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        // Check agent or user to authorize the request as.
        User authorizedUser = agent != null ? agent : user;

        // Check junction object relation to authorized user.
        boolean authorized =
            ( SafetyUtil.equals(this.getTargetId(), authorizedUser.getId()) ||
            SafetyUtil.equals(this.getSourceId(), authorizedUser.getId()) );

        if ( ! ( authorized || auth.check(x, (String) buildPermissionString(x, this, "read")) )){
          throw new AuthorizationException("Unable to retrieve junction due to permission restrictions.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldObj', javaType: 'foam.core.FObject' }
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException', 'IllegalStateException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        DAO groupDAO = (DAO) x.get("groupDAO");

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
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        if ( ! auth.check(x, (String) buildPermissionString(x, this, "remove")) ) {
          throw new AuthorizationException("Unable to remove object due to permission restrictions.");
        }
      `
    },
    {
      name: 'buildPermissionString',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'junctionObj', javaType: 'foam.nanos.auth.UserUserJunction' },
        { name: 'permissionAction', javaType: 'String' }
      ],
      javaReturns: 'String',
      javaCode: `
        DAO businessDAO = (DAO) x.get("businessDAO");
        Business targetUser = (Business) businessDAO.inX(x).find(junctionObj.getTargetId());

        // Permission string to check authorization.
        String businessPermission = "business." + permissionAction + "." + targetUser.getBusinessPermissionId() + ".*";

        return businessPermission;
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
  sourceProperty: {
    flags: ['js']
  },
  targetProperty: {
    flags: ['js']
  },
  sourceMethod: {
    flags: ['js', 'java']
  },
  targetMethod: {
    flags: ['js', 'java']
  }
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.model.Business',
  targetModel: 'foam.nanos.auth.Group',
  forwardName: 'groups',
  inverseName: 'business',
  targetProperty: {
    hidden: true
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
