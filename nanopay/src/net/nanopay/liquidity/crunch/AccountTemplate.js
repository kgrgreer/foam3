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
      class: 'List',
      javaType: 'java.util.List<Long>'
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        // TODO
        // return false;
      `
    }
  ]
});

  