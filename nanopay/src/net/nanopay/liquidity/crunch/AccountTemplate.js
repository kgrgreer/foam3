/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', // TODO get a better name?
  implements: [ 'foam.core.Validatable' ],

  imports: [
    'accountDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'java.util.Map'
  ],
  
  documentation: `
  A model for the data to be stored in user-liquidCapability junctions
  This model contains a list of accounts for which a capabilities will be granted to a user on,
  as well as implements validation for the accounts supplied
  `,

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    { name: 'templateName',
      class: 'String'
    },
    {
      name: 'accounts',
      class: 'Map',
      javaType: 'java.util.Map<String, AccountData>',
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
      `
    },
    {
      name: 'addAccount',
      args: [
        { name: 'account', class: 'Long' },
        { name: 'data', class: 'net.nanopay.liquidity.crunch.AccountData' }
      ],
      documentation: `
      `,
      code: function addAccount(account, data) {
        // check if the new account is parent of any entries in the map, if it is, remove the entry
        var keySetIterator = this.accounts.keys();
        var existingAccount = keySetIterator.next().value;
        while ( existingAccount ) {
          if ( existingAcconut ===  account || isParentAccount(account, existingAccount) ) this.accounts.delete(existingAccount);
          existingAccount = keySetIterator.next().value;
        }
        this.accounts.set(account, data);
      }
    },
    {
      name: 'isParentAccount',
      args: [
        { name: 'parent', class: 'Long' },
        { name: 'child', class: 'Long' },
      ],
      type: 'Boolean',
      code: async function isParentAccount(parent, child) {
        if ( parent === child ) return true;

        childAccount = await this.accountDAO.find(child);
        child = childAccount.parent;
        if ( child ) return isParentAccount(parent, child);

        return false;
      }
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
        var map = this.accounts;
        console.log(map);
        if ( accountId.toString() in map ) {
          console.log(this.accounts);
          delete this.accounts[accountId.toString()];
          // map.delete(accountId.toString());
        } else {
          console.error('The account provided is not an entry in the accountTemplate.');
        }
      }
    },
    {
      name: 'hasAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'Long' }
      ],
      javaType: 'Boolean',
      documentation: `
      Check if a given account is in the map or implied by ay an account in the map through
      cascading.
      `,
      code: async function hasAccount(x, childAccountId) {
        var map = this.accounts;
        if ( map == null || map.size == 0 ) return false;
        if ( map.has(childAccountId) ) return true;
        
        var childAccount = await this.accountDAO.find(childAccountId);
        var parentId;
        while ( childAccount ) {
          parentId = childAccount.parent;
          if ( map.has(parentId) && map.parentId.isCascading ) return true;
          childAccount = await this.accountDAO.find(parentId);
        }
        return false;
      },
      javaCode: `
        X systemX = x.put("user", new foam.nanos.auth.User.Builder(x).setId(1).build());
        Map<String, AccountData> map = getAccounts();

        if ( map == null && map.size() == 0 ) return false;
        if ( map.containsKey(childAccountId) || map.containsKey(String.valueOf(childAccountId)) ) return true;

        DAO accountDAO = ((DAO) x.get("accountDAO")).inX(systemX);

        Account parentAccount = ((Account) accountDAO.find(childAccountId)).findParent(systemX);

        AccountData temp;

        while ( parentAccount != null ) {
          
          temp = map.get(String.valueOf(parentAccount.getId()));
          if ( temp != null ) return temp.getIsCascading();
          parentAccount = (Account) parentAccount.findParent(systemX);
          
        }

        return false;
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
      documentation: `
      Check if a given account with approver level is in the map or implied by ay an account in the map through
      cascading.
      `,
      code: async function hasAccountByApproverLevel(x, childAccountId, level) {
        var map = this.accounts;
        if ( map == null || map.size == 0 ) return false;
        if ( map.has(parentId) && map[childAccountId].approverLevel.approverLevel === level ) return true;
        
        var childAccount = await this.localAccountDAO.find(childAccountId);
        var parentId;
        while ( childAccount ) {
          parentId = childAccount.parent;
          if ( map.has(parentId) && map[parentId].isCascading && (map[parentId].approverLevel.approverLevel === level) ) return true;
          childAccount = await this.localAccountDAO.find(parentId);
        }
        return false;
      },
      javaCode: `
      Map<String, AccountData> map = getAccounts();
    
      if ( map == null && map.size() == 0 ) return false;
      if ( map.containsKey(childAccountId) && map.get(childAccountId).getApproverLevel().getApproverLevel() == level ) return true;

      DAO accountDAO = (DAO) x.get("accountDAO");

      Account parentAccount = ((Account) accountDAO.find(childAccountId)).findParent(x);

      AccountData temp;

      while ( parentAccount != null ) {
        temp = map.get(parentAccount.getId());
        if ( temp == null ) parentAccount = (Account) parentAccount.findParent(x);
        return temp.getIsCascading() && (temp.getApproverLevel().getApproverLevel() == level);
      }

      return false;
      `
    }
  ]
});

  