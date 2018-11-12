foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Account',

  documentation: 'Base model of all Accounts',

  // relationships: owner (User)

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'static foam.mlang.MLang.*',
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
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        this.__subSubContext__.balanceDAO.find(obj.id).then( function( balance ) {
          self.__subSubContext__.currencyDAO.find(obj.denomination).then(function(curr) {
            self.add(balance != null ?  curr.format(balance.balance) : 0);
          });
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
          x.balanceDAO.find(this.id).then(function(balance) {
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
        },
        {
          name: 'currentStatusCheck',
          javaType: 'boolean',
          documentation: `The purpose of this is know if the current invoice/transaction that is being validated, 
          is a transaction that is assocciated to the holdingAccount flow. If yes the amount is not subtracted 
          from the balance on balance validation. `
        }
      ],
      javaCode: `
        if ( amount == 0 ) {
          throw new RuntimeException("Zero transfer disallowed.");
        }
        System.out.println("about to validate account: x.user = " + ((User)x.get("user")).getId() + " balance = " + balance + " amount = " + amount + " currentStatusCheck = " + currentStatusCheck);
        int balanceSum = 0;
        AuthService auth = (AuthService) x.get("auth");
        if ( auth.check(x, "invoice.holdingAccount") && this instanceof DigitalAccount ) {
          // Check if any associated invoices are in Pending_Acceptance state,
          // if so then subtract the balance in holding to reflect the usable
          // balance of this account.
          DAO invoiceDAO = (DAO) x.get("invoiceDAO");
          List pendAccInvoice = ((ArraySink)invoiceDAO.where(AND(
            EQ(Invoice.DESTINATION_ACCOUNT, this.getId()),
            EQ(Invoice.STATUS, InvoiceStatus.PENDING_ACCEPTANCE)
          )).select(new ArraySink())).getArray();
          
          for( int i = 0; i < pendAccInvoice.size(); i++ ) {
            balanceSum += ((Invoice)pendAccInvoice.get(i)).getAmount();
          }
          if ( currentStatusCheck && balanceSum > 0 ) balanceSum += amount;
        }

        if ( amount < 0 &&
             -amount > (balance.getBalance() - balanceSum) ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", balance);
          throw new RuntimeException("Insufficient balance in account " + this.getId());
        }
      `
    }
  ]
});
