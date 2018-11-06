foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'Base model of all Accounts',

  // relationships: owner (User)

  javaImports: [
    'foam.dao.DAO'
  ],

  import: [
    'ctrl',
    'balanceDAO'
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
      tableCellFormatter: function(value, obj, axiom) {
        var self = this;
        obj.findBalance(this.__subContext__).then( function( balance ) {
          self.add(balance);
        });
      }
    }
  ],

  methods: [
    {
      name: 'findBalance',
      code: function(x) {
        var self = this;
        return new Promise(function(resolve, reject) {
          self.balanceDAO.find(this.id).then(function(balance) {
          resolve( balance != null ? balance.balance : 0);
   });
  });
      },
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'Object',
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
          javaType: 'foam.core.X'
        },
        {
          name: 'balance',
          javaType: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',

          javaType: 'Long'
        }
      ],
      javaCode: `
        if ( amount == 0 ) {
          throw new RuntimeException("Zero transfer disallowed.");
        }
        if ( amount < 0 &&
             -amount > balance.getBalance() ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", balance);
          throw new RuntimeException("Insufficient balance in account " + this.getId());
        }
      `
    }
  ]
});
