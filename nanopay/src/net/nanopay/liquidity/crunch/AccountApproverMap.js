foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountApproverMap',

  javaImports: [
    'foam.core.X',
    'java.util.Map',
    'net.nanopay.account.Account',
    'foam.nanos.auth.User',
    'foam.dao.DAO',
  ],

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'accounts',
      class: 'Map',
      javaType: 'java.util.Map<String, CapabilityAccountData>',
    }
  ],

  methods: [
    {
      name: 'addAccount',
      args: [
        { name: 'accountId', class: 'Long' },
        { name: 'data', javaType: 'net.nanopay.liquidity.crunch.CapabilityAccountData' }
      ],
      documentation: `
      Adds a single account to the map 
      `,
      code: function addAccount(account, data) {
        return;
      },
      javaCode: `
        getAccounts().put(String.valueOf(accountId), data);
      `
    },
    {
      name: 'impliesChildAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childId', class: 'Long' },
      ],
      type: 'Long',
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        Account child = (Account) accountDAO.find(childId);
        AccountData data;

        while ( child != null ) {
          if ( getAccounts().containsKey(String.valueOf(child.getId())) ) {
            data = getAccounts().get(String.valueOf(child.getId()));
            if ( data != null && data.getIsIncluded() && data.getIsCascading() ) {
              return child.getId();
            } 
            return 0L;
          } 
          Long parentId = child.getParent();
          child = (Account) accountDAO.find(parentId);
        }

        return 0L;
        
      `
    },
    {
      name: 'removeAccount',
      args: [
        { name: 'accountId', class: 'Long' },
      ],
      documentation: `
      remove an account from the map, abiding the the following rules : 
        1. if the account is in the map keySet, remove the entry
        2. if the account is not in the map, reject the operation
      `,
      code: function removeAccount(accountId) {
        if ( accountId.toString() in this.accounts ) {
          delete this.accounts[accountId.toString()];
        } else {
          console.error('The account provided is not an entry in the accountTemplate.');
        }
      },
      javaCode: `
        if ( getAccounts().containsKey(String.valueOf(accountId))) {
          getAccounts().remove(String.valueOf(accountId));
        } else {
          throw new RuntimeException("Account provided is not an entry in the account map");
        }
      `
    },
    {
      name: 'hasAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'Long' }
      ],
      javaType: 'Boolean',
      code: function hasAccount(x, childAccountId) {
        var map = this.accounts;
        return map && accountId.toString() in map;
      },
      javaCode: `
        Map<String, CapabilityAccountData> map = getAccounts();
        return map != null && map.containsKey(String.valueOf(childAccountId));
      `
    },
    {
      name: 'hasAccountByApproverLevel',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'Long' },
        { name: 'level', javaType: 'Integer' }
      ],
      javaType: 'Boolean',
      code: function hasAccountByApproverLevel(x, accountId, level) {
        var map = this.accounts;
        return map && accountId.toString() in map && map[accountId.toString()].approverLevel === level;
      },
      javaCode: `
      Map<String, CapabilityAccountData> map = getAccounts();
      return map != null && map.containsKey(String.valueOf(childAccountId)) && map.get(String.valueOf(childAccountId)).getApproverLevel().getApproverLevel() == level;
      `
    }
  ]
});

  