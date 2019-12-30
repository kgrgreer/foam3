foam.CLASS({
  package: 'net.nanopay.account',
  name: 'SecuritiesAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'The base model for creating and managing all Security accounts.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.SecurityAccount',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count'
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
      //not required, except maybe for view.
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      targetDAOKey: 'securitiesDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountDetails',
      order: 3,
      required: false
    },
    {
    // balance of all sub accounts I suppose
      class: 'Long',
      name: 'balance',
      label: 'Balance (local)',
      documentation: 'A numeric value representing the available funds in the bank account.',
      storageTransient: true,
      visibility: 'RO',
            tableCellFormatter: function(value, obj, id) {
              return this.balance;
            },
      /*tableCellFormatter: function(value, obj, id) {
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
      },*/
      tableWidth: 145
    },

  ],

  methods: [
  /*
    {
     WIP. Get balance of all subaccounts, but not their subaccounts.
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


    },*/
    {
      name: 'getSecurityAccount',
      type: 'net.nanopay.account.SecurityAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'unit',
          type: 'String'
        }
      ],

      javaCode: `
        DAO accountDAO = (DAO) this.getSubAccounts(x);
        SecurityAccount sa = (SecurityAccount) accountDAO.find(EQ(
          SecurityAccount.DENOMINATION,unit));
        if (sa == null || sa.getId() == 0)
          return createSecurityAccount_(x,unit);
        return sa;
      `
    },
    {
      name: 'createSecurityAccount_',
      documentation: 'creates a subaccount that is denominated with the specified unit',
      type: 'net.nanopay.account.SecurityAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'unit',
          type: 'String'
        }
      ],

      javaCode: `
        SecurityAccount sa = new SecurityAccount();
        sa.setDenomination(unit);
        sa.setName(unit+ " subAccount for "+getId());
        sa.setSecuritiesAccount(this.getId());
        DAO accountDAO = (DAO) x.get("accountDAO");
        sa = (SecurityAccount) accountDAO.put(sa);
        return sa;
      `
    },
  ]
});
