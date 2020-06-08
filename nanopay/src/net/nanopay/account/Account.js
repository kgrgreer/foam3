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
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'The base model for creating and managing all accounts.',

  // relationships: owner (User)

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
  ],

  imports: [
    'homeDenomination',
    'exchangeRateService',
    'user',
    'balanceService',
    'currencyDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.core.Currency'
  ],

  searchColumns: [
    'id',
    'name',
    'denomination',
    'type',
    'isDefault'
  ],

  tableColumns: [
    'id',
    'type',
    'summary',
    'balance',
    'homeBalance'
  ],

  axioms: [
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Table',
      view: { class: 'net.nanopay.account.AccountDAOBrowserView' },
      icon: 'images/list-view.svg',
    },
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Tree',
      view: { class: 'net.nanopay.account.ui.AccountTreeView' },
      icon: 'images/tree-view.svg',
    }
  ],

  sections: [
    {
      name: 'accountType',
      permissionRequired: true,
      isAvailable: function(id) { return !! id; },
      order: 1
    },
    {
      name: 'accountDetails',
      order: 2
    },
    {
      // liquid
      name: 'parentSection',
      permissionRequired: true,
      order: 3
    },
    {
      name: 'balanceDetails',
      permissionRequired: true,
      order: 4
    },
    {
      name: 'administration',
      permissionRequired: true,
      order: 5
    },
    {
      name: '_defaultSection',
      title: 'Relationships',
      permissionRequired: true,
      order: 6
     }
  ],

  properties: [
    // TODO: access/scope: public, private
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of the account.',
      transient: true,
      getter: function() {
        return this.model_.label === 'Digital Account' ? 'Virtual Account' : this.model_.label;
      },
      javaGetter: `
        return getClass().getSimpleName();
      `,
      tableWidth: 135,
      section: 'accountType',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      label: 'Account Number',
      documentation: 'The ID for the account.',
      section: 'administration',
      visibility: 'RO',
      tableWidth: 50
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the account is deleted.',
      value: false,
      section: 'administration',
      writePermissionRequired: true,
      visibility: 'RO',
      tableWidth: 85
    },
    {
      class: 'String',
      name: 'name',
      label: 'Account Name',
      documentation: `The given name of the account,
        provided by the individual person, or real user.`,
      validateObj: function(name) {
        if ( /^\s+$/.test(name) ) {
          return 'Account name may not consist of only whitespace.';
        }
      },
      section: 'accountDetails',
      order: 1
    },
    {
      class: 'String',
      name: 'desc',
      documentation: `The given description of the account, provided by
        the individual person, or real user.`,
      label: 'Memo',
      section: 'accountDetails',
      order: 2
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      documentation: 'Determines whether an account can receive transfers.',
      value: true,
      section: 'administration'
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      documentation: 'Determines whether an account can make transfers out.',
      value: true,
      section: 'administration'
    },
    {
      class: 'Reference',
      of: 'foam.core.Unit',
      name: 'denomination',
      targetDAOKey: 'currencyDAO',
      documentation: `The unit of measure of the payment type. The payment system can handle
        denominations of any type, from mobile minutes to stocks.
      `,
      tableWidth: 127,
      writePermissionRequired: true,
      section: 'accountDetails',
      order: 3,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.currencyDAO,
              heading: 'Currencies'
            }
          ]
        };
      }
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      documentation: `Determines whether an account is the first preferred option of the User for a particular denomination.`,
      tableWidth: 87,
      label: 'Set As Default',
      value: false,
      section: 'administration',
      tableHeaderFormatter: function(axiom) {
        this.add('Default');
      },
      tableCellFormatter: function(value, obj, property) {
        this
          .start()
            .callIf(value, function() {
              this.style({ color: '#32bf5e' });
            })
            .add(value ? 'Y' : '-')
          .end();
      },
    },
    {
      class: 'UnitValue',
      unitPropName: 'denomination',
      name: 'balance',
      label: 'Balance (local)',
      documentation: 'A numeric value representing the available funds in the bank account.',
      section: 'balanceDetails',
      storageTransient: true,
      createVisibility: 'HIDDEN', // No point in showing as read-only during create since it'll always be 0
      updateVisibility: 'RO',
      readVisibility: 'RO',
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        long balance  = (Long) ((Account)obj).findBalance(x);
        Currency curr = (Currency) currencyDAO.find(((Account)obj).getDenomination());

        // Output formatted balance or zero
        outputter.outputValue(curr.format(balance));
      `,
      tableWidth: 175,
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        this.add(obj.slot(function(denomination) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.currencyDAO.find(denomination).then((result) => {
              return self.E().add(result.format(value));
            })
          }));
        }))
      }

  },
    {
      class: 'UnitValue',
      unitPropName: 'homeDenomination',
      name: 'homeBalance',
      label: 'Balance (home)',
      documentation: `
        A numeric value representing the available funds in the
        bank account converted to home denomination.
      `,
      section: 'balanceDetails',
      storageTransient: true,
      visibility: 'RO',
      tableWidth: 175,
      tableCellFormatter: function(value, obj, axiom) {
      var self = this;
        this.add(obj.slot(function(denomination, homeDenomination, balance) {
          return self.E().add(foam.core.PromiseSlot.create({
            promise: this.exchangeRateService.exchangeFormat(denomination, homeDenomination, balance).then((result) => {
              return self.E().add(result);
            })
          }));
        }))
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the account was created in the system.',
      section: 'administration',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'The ID of the User who created the account.',
      section: 'administration',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'The ID of the Agent who created the account.',
      section: 'administration',
      // visibility: 'RO',
      visibility: 'HIDDEN'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time of when the account was last changed in the system.',
      section: 'administration',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The unique identifier of the individual person, or real user,
        who last modified this account.`,
      section: 'administration',
      visibility: 'RO',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then((user) => this.add(user.toSummary()))
          .catch((error) => {
            this.add(value);
          });
      },
    },
    {
      class: 'String',
      name: 'summary',
      visibility: 'RO',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table views`,
      expression: function() {
        return this.toSummary() + ` - ${this.type}`;
      },
      tableCellFormatter: function(_, obj) {
        this.add(obj.slot(function(
          name,
          desc
        ) {
          let output = '';
          if ( name ) {
            output += name;
            if ( desc ) {
              output += ' - ';
            }
          }
          if ( desc ) {
            output += desc;
          }
          return output;
        }));
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      section: 'administration',
      value: foam.nanos.auth.LifecycleState.PENDING,
      writePermissionRequired: true,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      documentation: `
        When using a reference to the accountDAO, the labels associated with it will show
        a chosen property rather than the first alphabetical string property. In this
        case, we are using the account name.
      `,
      code: function() {
        var output = '(' + this.id + ') ';
        if ( this.name ) {
          output += this.name;
        } else if ( this.desc ) {
          output += this.desc;
        }
        return output;
      },
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append("(");
        sb.append(getDenomination());
        sb.append(") ");
        if ( getName().length() == 0 ) {
          sb.append(getDesc());
        } else {
          sb.append(getName());
        }
        return sb.toString();
      `
    },
    {
      name: 'findBalance',
      type: 'Long',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: function(x) {
        return x.balanceService.findBalance(x, this.id);
      },
      javaCode: `
        return ((BalanceService) x.get("balanceService")).findBalance_(x, this);
      `
    },
    {
      name: 'validateAmount',
      documentation: `Allows a specific value to be used to perform a balance operation.
        For example: Trust accounts can be negative.`,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',

          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
             -amount > bal ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("Insufficient balance in account " + this.getId());
        }
      `
    },
    {
      name: 'getOutgoingAccountCreate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getParent();
      `
    },
    {
      name: 'getOutgoingAccountRead',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    },
    {
      name: 'getOutgoingAccountUpdate',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    },
    {
      name: 'getOutgoingAccountDelete',
      type: 'Long',
      args: [
        {
          type: 'Context',
          name: 'x',
        }
      ],
      javaCode: `
        return getId();
      `
    }
  ]
});
