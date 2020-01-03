/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountApproverMap',

  javaImports: [
    'foam.core.X',
    'java.util.Map'
  ],

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
      javaType: 'java.util.Map<String, ApproverLevel>',
    }
  ],

  methods: [
    // {
    //   name: 'addAccount',
    //   args: [
    //     { name: 'account', class: 'Long' },
    //     { name: 'data', class: 'net.nanopay.liquidity.crunch.AccountData' }
    //   ],
    //   documentation: `
    //   `,
    //   code: function addAccount(account, data) {
    //     // check if the new account is parent of any entries in the map, if it is, remove the entry
    //     var keySetIterator = this.accounts.keys();
    //     var existingAccount = keySetIterator.next().value;
    //     while ( existingAccount ) {
    //       if ( existingAcconut ===  account || isParentAccount(account, existingAccount) ) this.accounts.delete(existingAccount);
    //       existingAccount = keySetIterator.next().value;
    //     }
    //     this.accounts.set(account, data);
    //   }
    // },
    // {
    //   name: 'isParentAccount',
    //   args: [
    //     { name: 'parent', class: 'Long' },
    //     { name: 'child', class: 'Long' },
    //   ],
    //   type: 'Boolean',
    //   code: async function isParentAccount(parent, child) {
    //     if ( parent === child ) return true;

    //     childAccount = await this.accountDAO.find(child);
    //     child = childAccount.parent;
    //     if ( child ) return isParentAccount(parent, child);

    //     return false;
    //   }
    // },
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
      }
    },
    {
      name: 'hasAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'String' }
      ],
      javaType: 'Boolean',
      code: function hasAccount(x, childAccountId) {
        var map = this.accounts;
        return map && accountId.toString() in map;
      },
      javaCode: `
        Map<String, ApproverLevel> map = getAccounts();
        return map != null && map.containsKey(childAccountId);
      `
    },
    {
      name: 'hasAccountByApproverLevel',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'String' },
        { name: 'level', javaType: 'Integer' }
      ],
      javaType: 'Boolean',
      code: function hasAccountByApproverLevel(x, accountId, level) {
        var map = this.accounts;
        return map && accountId.toString() in map && map[accountId.toString()].approverLevel.approverLevel === level;
      },
      javaCode: `
      Map<String, ApproverLevel> map = getAccounts();
      return map != null && map.containsKey(childAccountId) && map.get(childAccountId).getApproverLevel().getApproverLevel() == level;
      `
    }
  ]
});

  