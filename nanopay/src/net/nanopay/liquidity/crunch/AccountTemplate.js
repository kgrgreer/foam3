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
    'net.nanopay.account.Account'
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
        // TODO
        // return false;
      `
    },
    {
      name: 'mergeMaps',
      args: [
        { name: 'map', javaType: 'net.nanopay.liquidity.crunch.AccountTemplate' }
      ],
      documentation: `
      Update the map stored on this model so that 
      `,
      javaCode: `
      `
    },
    {
      name: 'removeAccount',
      args: [
        { name: 'accountId', class: 'Long' }
      ],
      documentation: `
      If account is in the map, remove the account from the map.
      If account is implied by an account in the map (through cascading), 
      add the immediate parent of account explicitly to the map with cascading set to false and inherited set to true
      `,
      javaCode: `

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
      Checks if a given account is in this AccountTemplate or any AccountTemplate that this one 'extends'
      `,
      javaCode: `
        // TODO add implementation for checking subtemplates of the current
        if ( getAccounts() == null && getAccounts().size() == 0 ) return false;

        DAO accountDAO = (DAO) x.get("accountDAO");

        Account childAccount = (Account) accountDAO.find(childAccountId);

        while ( childAccount != null ) {
          if ( getAccounts().containsKey(childAccount.getId()) ) {
            // TODO!!!check if isCascading
            return true;
          } 
          childAccount = (Account) childAccount.findParent(x);
        }

        return false;

      `
    }
  ]
});

  