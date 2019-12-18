/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', // TODO get a better name?
  implements: [ 'foam.core.Validatable' ],

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
      javaType: 'java.util.Map<Long, Boolean>'
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
      name: 'containsAccount',
      args: [
        { name: 'accountId', class: 'Long' }
      ],
      javaType: 'Boolean',
      documentation: `
      Checks if a given account is in this AccountTemplate or any AccountTemplate that this one 'extends'
      `,
      javaCode: `
        // TODO add implementation for checking subtemplates of the current
        if ( getAccounts() != null ) return getAccounts().containsKey(accountId);
        return false;
      `
    }
  ]
});

  