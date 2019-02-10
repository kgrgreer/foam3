foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'Base model of all Accounts',

  // relationships: owner (User)

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.DeletedAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.DigitalAccount'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Accounts are disabled rather than deleted',
      value: true
    },
    {
      class: 'Boolean',
      name: 'deleted',
      value: false,
      permissionRequired: true
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'desc',
      label: 'Description'
    },
    {
      class: 'Boolean',
      name: 'transferIn',
      value: true
    },
    {
      class: 'Boolean',
      name: 'transferOut',
      value: true
    },
    {
      documentation: `
          Unit of measure of the balance - such as Currency. The value of the
          denomination is the currency code, for example.
      `,
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Boolean',
      name: 'isDefault',
      label: 'Set As Default',
      value: false
    },
    // TODO: access/scope: public, private
    {
      class: 'String',
      name: 'type',
      transient: true,
      visibility: foam.u2.Visibility.RO,
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `
        return getClass().getSimpleName();
`
    },
    {
      class: 'Long',
      name: 'balance',
      storageTransient: true,
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        this.__subSubContext__.balanceDAO.find(obj.id).then( function( balance ) {
          self.__subSubContext__.currencyDAO.find(obj.denomination).then(function(curr) {
            self.add(balance != null ?  curr.format(balance.balance) : 0);
          });
        });
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy'
    }
  ],

  methods: [
    {
      name: 'findBalance',
      code: function(x) {
        var self = this;
        return new Promise(function(resolve, reject) {
          x.balanceDAO.find(self.id).then(function(balance) {
          resolve( balance != null ? balance.balance : 0);
   });
  });
      },
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Any',
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
      documentation: 'Allow Account specific validation of balance operation. Trust accounts can be negative, for example.',
      name: 'validateAmount',
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
