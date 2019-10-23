foam.CLASS({
  package: 'net.nanopay.account',
  name: 'SecurityAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all Security accounts.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.exchangeable.Currency'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination',
    'balance'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      targetDAOKey: 'securitiesDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountDetails',
      order: 3
    },
    {
      class: 'Long',
      name: 'balance',
      label: 'Balance (local)',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, id) {
        var self = this;
        // React to homeDenomination because it's used in the currency formatter.
        this.add(obj.homeDenomination$.map(function(_) {
          return obj.findBalance(self.__subSubContext__).then(
            function(balance) {
              return self.__subSubContext__.securitiesDAO.find(obj.denomination).then(
                function(curr) {
                  var displayBalance = curr.format(balance != null ? balance : 0);
                  self.tooltip = displayBalance;
                  return displayBalance;
                })
            })
        }));
      },
      tableWidth: 145
    },
    {
      class: 'Long',
      name: 'marketValue',
      documentation: 'the current market value of this security account',
      storageTransient: true,
      visibility: 'RO',
      tableWidth: 145
      //TODO: display the market value.. balance * unit value in some home currency.
    },
    {
      class: 'Long',
      name: 'homeBalance',
      label: 'Balance (home)',
      documentation: `
        replace the table cell formatter to return just regular balance. since we dont use this for securities.
      `,
      storageTransient: true,
      visibility: 'RO',
      tableCellFormatter: function(value, obj, id) {
        return this.balance;
      },
      tableWidth: 145
    },
  ],

  methods: [
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
        return x.balanceDAO.find(this.id).then(b => b ? b.balance : 0);
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
    }
  ]
});
