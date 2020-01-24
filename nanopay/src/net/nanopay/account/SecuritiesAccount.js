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
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState'
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
      of: 'foam.core.Unit',
      targetDAOKey: 'currencyDAO',
      name: 'denomination',
      documentation: 'The security that this account stores.',
      tableWidth: 127,
      section: 'accountDetails',
      value: 'USD',
      order: 3,
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
        return this.findBalance(this.__subContext__,id);
      },
      tableWidth: 145
    },

  ],

  methods: [
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
        // TODO: switch to StripedLock when available, KGR
        Object lock = (getId() + ":" + unit).intern();
        synchronized ( lock ) {
          SecurityAccount sa = (SecurityAccount) accountDAO.find(EQ(
          SecurityAccount.DENOMINATION,unit));
          if (sa == null || sa.getId() == 0)
            return createSecurityAccount_(x,unit);
          return sa;
        }
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
        sa.setName(unit + " subAccount for " + getId());
        sa.setSecuritiesAccount(this.getId());
        sa.setLifecycleState(LifecycleState.ACTIVE);
        DAO accountDAO = (DAO) x.get("accountDAO");
        sa = (SecurityAccount) accountDAO.put(sa);
        return sa;
      `
    },
  ]
});
