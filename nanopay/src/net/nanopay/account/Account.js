foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'The base model for creating and managing all accounts.',

  // relationships: owner (User)

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.DeletedAware',
    'foam.nanos.auth.EnabledAware',
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
    'net.nanopay.model.Currency'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  tableColumns: [
    'id',
    'deleted',
    'name',
    'type',
    'denomination',
    'balance',
    'homeBalance'
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Shadow Accounts',
      predicateFactory: function(e) {
        return e.INSTANCE_OF(net.nanopay.account.ShadowAccount);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Aggregate Accounts',
      predicateFactory: function(e) {
        return e.INSTANCE_OF(net.nanopay.account.AggregateAccount);
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Virtual Accounts',
      predicateFactory: function(e) {
        return foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' });
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
      isAvailable: function(id) { return !! id; },
      order: 1
    },
    {
      name: 'accountDetails',
      order: 2
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'The ID for the account.',
      visibility: 'RO',
      tableWidth: 50
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: `Determines whether an account is disabled. Accounts
        on this platform are disabled rather than deleted.
      `,
      value: true
    },
    {
      class: 'Boolean',
      name: 'deleted',
      documentation: 'Determines whether the account is deleted.',
      value: false,
      permissionRequired: true,
      visibility: 'RO',
      tableWidth: 85
    },
    {
      class: 'String',
      name: 'name',
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
      value: true
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      documentation: 'Determines whether an account can make transfers out.',
      value: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'denomination',
      documentation: `The unit of measure of the payment type. The payment system can handle
        denominations of any type, from mobile minutes to stocks.
      `,
      tableWidth: 127,
      section: 'accountDetails',
      order: 3
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      documentation: `Determines whether an account is the first preferred option of the User.`,
      label: 'Set As Default',
      value: false
    },
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
      tableWidth: 125,
      section: 'accountType',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'balance',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        obj.findBalance(this.__subSubContext__).then( function( balance ) {
          self.__subSubContext__.currencyDAO.find(obj.denomination).then(function(curr) {
            self.add(balance != null ?  curr.format(balance) : 0);
          });
        });
      },
      javaToCSV: `
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        long balance  = (Long) ((Account)obj).findBalance(x);
        Currency curr = (Currency) currencyDAO.find(((Account)obj).getDenomination());
        
        // Output formatted balance or zero
        outputter.outputValue(curr.format(balance));
      `,
      tableWidth: 135
    },
    {
      class: 'Long',
      name: 'homeBalance',
      documentation: `
        A numeric value representing the available funds in the 
        bank account converted to home denomination.
      `,
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, id) {
        var self = this;

        this.add(obj.fxService.getFXRate(obj.denomination, obj.homeDenomination, 0, 1, 'BUY', null, obj.user.id, 'nanopay').then(r => 
          obj.findBalance(self.__subSubContext__).then(balance => 
            self.__subSubContext__.currencyDAO.find(obj.homeDenomination).then(curr => 
              balance != null ?  curr.format(Math.floor(balance * r.rate)) : 0
            )
          )
        ));
      },
      tableWidth: 135
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the account was created in the system.',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'The ID of the User who created the account.',
      visibility: 'RO',
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time of when the account was last changed in the system.',
      visibility: 'RO',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      documentation: `The unique identifier of the individual person, or real user,
        who last modified this account.`,
      visibility: 'RO',
    }
  ],

  methods: [
    {
      name: 'toSummary',
      documentation: `
        When using a reference to the accountDAO, the labels associated with it will show
        a chosen property rather than the first alphabetical string property. In this
        case, we are using the account name.
      `,
      code: function(x) {
        var self = this;
        return this.name;
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
        var self = this;
        return new Promise(function(resolve, reject) {
          x.balanceDAO.find(self.id).then(function(balance) {
            resolve( balance != null ? balance.balance : 0);
          });
        });
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
