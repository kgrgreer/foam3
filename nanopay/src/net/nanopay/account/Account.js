foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'The base model for creating and managing all accounts.',

  // relationships: owner (User)

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.DeletedAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'homeDenomination',
    'fxService',
    'user'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
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
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.AND(
          e.EQ(net.nanopay.account.Account.DELETED, false),
          e.EQ(net.nanopay.account.Account.IS_DEFAULT, false),
          e.EQ(net.nanopay.account.Account.ENABLED, true)
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Shadow Accounts',
      predicateFactory: function(e) {
        return e.AND(
          e.INSTANCE_OF(net.nanopay.account.ShadowAccount),
          e.EQ(net.nanopay.account.Account.DELETED, false),
          e.EQ(net.nanopay.account.Account.IS_DEFAULT, false),
          e.EQ(net.nanopay.account.Account.ENABLED, true)
        )
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Aggregate Accounts',
      predicateFactory: function(e) {
        return e.AND(
          e.INSTANCE_OF(net.nanopay.account.AggregateAccount),
          e.EQ(net.nanopay.account.Account.DELETED, false),
          e.EQ(net.nanopay.account.Account.IS_DEFAULT, false),
          e.EQ(net.nanopay.account.Account.ENABLED, true)
        )
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Virtual Accounts',
      predicateFactory: function(e) {
        return e.AND(
          foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' }),
          e.EQ(net.nanopay.account.Account.DELETED, false),
          e.EQ(net.nanopay.account.Account.IS_DEFAULT, false),
          e.EQ(net.nanopay.account.Account.ENABLED, true)
        )
      }
    },
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Table',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
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
      title: '',
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
        return this.cls_.name;
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
      documentation: 'The ID for the account.',
      section: 'administration',
      visibility: 'RO',
      tableWidth: 50
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: `Determines whether an account is disabled. Accounts
        on this platform are disabled rather than deleted.
      `,
      value: true,
      section: 'administration',
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
      label: 'Account name',
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
      writePermissionRequired: true,
      tableWidth: 127,
      section: 'accountDetails',
      order: 3
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      documentation: `Determines whether an account is the first preferred option of the User for a particular denomination.`,
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
      visibility: 'RO',
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        long balance  = (Long) ((Account)obj).findBalance(x);
        Currency curr = (Currency) currencyDAO.find(((Account)obj).getDenomination());
        
        // Output formatted balance or zero
        outputter.outputValue(curr.format(balance));
      `,
      tableWidth: 145
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
      tableWidth: 145
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
    },
    {
      class: 'String',
      name: 'summary',
      visibility: 'RO',
      transient: true,
      documentation: `
        Used to display a lot of information in a visually compact way in table views`,
      tableWidth: 500,
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
  ],

  methods: [
    function init() {
      this.SUPER();

      this.updateBalance();

      var self = this;  
      this.homeDenomination$.sub(function() {
        self.updateBalance();
      }.bind(this)); 
    },
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the accountDAO, the labels associated with it will show
        a chosen property rather than the first alphabetical string property. In this
        case, we are using the account name.
      `,
      code: function() {
        var output = '(' + this.id + ') ';
        if ( this.name ) {
          output =+ this.name;
        } else if ( this.desc ) {
          output =+ this.desc;
        }
        return output;
      },
    },
    {
      name: 'updateBalance',
      documentation: `
        Update the local balance and home balance. Home balance is calculated using the
        provided exchange rate, based on the provided denomination and home denomination.
      `,
      code: function() {
        var self = this;
        Promise.all([
          self.denomination == self.homeDenomination ?
            Promise.resolve(1) :
            self.fxService.getFXRate(self.denomination, self.homeDenomination,
              0, 1, 'BUY', null, self.user.id, 'nanopay').then(r => r.rate),
          self.findBalance(self.__subContext__),
          self.__subContext__.currencyDAO.find(self.homeDenomination)
        ]).then(arr => {
          let [r, b, c] = arr;
          self.balance = b;
          self.homeBalance = Math.floor((b || 0) * r);
        });
      },
    },
    {
      name: 'findBalance',
      type: 'Any',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: function(x) {
        return x.balanceDAO 
          ? x.balanceDAO.find(this.id).then(b => b ? b.balance : 0) 
          : 0;
      },
      javaCode: `
        DAO balanceDAO = (DAO) x.get("balanceDAO");
        Balance balance = (Balance) balanceDAO.find(this.getId());
        if ( balance != null ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("Balance found for account", this.getId());
          return balance.getBalance();
        } else {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("Balance not found for account", this.getId());
        }
        return 0L;
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
    }
  ]
});
