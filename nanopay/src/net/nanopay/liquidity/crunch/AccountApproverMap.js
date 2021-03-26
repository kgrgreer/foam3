/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
        { name: 'accountId', class: 'String' },
        { name: 'data', javaType: 'net.nanopay.liquidity.crunch.CapabilityAccountData' }
      ],
      documentation: `
      Adds a single account to the map 
      `,
      code: function addAccount(account, data) {
        return;
      },
      javaCode: `
        getAccounts().put(accountId, data);
      `
    },
    {
      name: 'impliesChildAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childId', class: 'String' },
      ],
      type: 'String',
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
            return "";
          } 
          String parentId = child.getParent();
          child = (Account) accountDAO.find(parentId);
        }

        return "";
        
      `
    },
    {
      name: 'removeAccount',
      args: [
        { name: 'accountId', class: 'String' },
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
        if ( getAccounts().containsKey(accountId) ) {
          getAccounts().remove(accountId);
        } else {
          throw new RuntimeException("Account provided is not an entry in the account map");
        }
      `
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
        Map<String, CapabilityAccountData> map = getAccounts();
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
        return map && accountId.toString() in map && map[accountId.toString()].approverLevel === level;
      },
      javaCode: `
      Map<String, CapabilityAccountData> map = getAccounts();
      return map != null && map.containsKey(childAccountId) && map.get(childAccountId).getApproverLevel().getApproverLevel() == level;
      `
    }
  ]
});

  