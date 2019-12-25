/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', // TODO get a better name?
  implements: [ 'foam.core.Validatable' ],

  javaImports: [
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
      name: 'accounts',
      class: 'Map',
      // view: () => { // broken
      //   return {
      //     class: 'foam.u2.view.ReferenceArrayView', TODO this needs a view pref with a nice account selector for keys and checkbox for value
      //     daoKey: 'accountDAO'
      //   };
      // },
      javaType: 'java.util.Map<Long, AccountData>'
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
      `
    },
    {
      name: 'mergeMaps',
      args: [
        { name: 'map', javaType: 'net.nanopay.liquidity.crunch.AccountTemplate' }
      ],
      documentation: `
      Update the map stored on this model so that to include entries in the new map.
      `,
      javaCode: `
      `
    },
    {
      name: 'removeAccount',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'accountId', class: 'Long' }
      ],
      documentation: `
      If account is in the map, remove the account from the map.
      If account is implied by an account in the map (through cascading), 
      add the immediate parent of account explicitly to the map with cascading set to false and inherited set to true
      THIS IS WRONG TODO, PARENTS ACCOUNTS MORE THAN ONE CHILD 
      `,
      javaCode: `
        Map<Long, AccountData> map = getAccounts();
        if ( map == null && map.size() == 0 ) return;
        if ( map.containsKey(accountId) ) {
          map.remove(accountId);
          setAccounts(map);
          return;
        }

        DAO accountDAO = (DAO) x.get("accountDAO");

        Account childAccount = (Account) accountDAO.find(accountId);
        Account parentAccount = childAccount.findParent(x);
        Account immediateParentAccount = parentAccount;

        while ( parentAccount != null ) {
          if ( map.containsKey(parentAccount.getId()) && map.get(parentAccount.getId()).getIsCascading() ) {
            AccountData data = map.get(immediateParentAccount.getId());
            data.setIsCascading(false);
            map.put(immediateParentAccount.getId(), data);
          }
          parentAccount = (Account) parentAccount.findParent(x);
        }


      `
    },
    {
      name: 'isParentOf',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'childAccountId', class: 'Long' }
      ],
      javaType: 'Boolean',
      documentation: `
      Check if a given account is in the map or implied by ay an account in the map through
      cascading.
      `,
      javaCode: `
        // TODO add implementation for checking subtemplates of the current
        Map<Long, AccountData> map = getAccounts();
        if ( map == null && map.size() == 0 ) return false;
        if ( map.containsKey(childAccountId) ) return true;

        DAO accountDAO = (DAO) x.get("accountDAO");

        Account childAccount = (Account) accountDAO.find(childAccountId);
        Account parentAccount = childAccount.findParent(x);

        while ( parentAccount != null ) {
          if ( map.containsKey(parentAccount.getId()) && map.get(parentAccount.getId()).getIsCascading() ) {
            return true;
          } 
          parentAccount = (Account) parentAccount.findParent(x);
        }

        return false;

      `
    }
  ]
});

  