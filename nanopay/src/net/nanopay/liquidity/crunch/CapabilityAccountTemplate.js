/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplate',
  extends: 'net.nanopay.liquidity.crunch.AccountTemplate',

  imports: [
    'accountDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'java.util.Map'
  ],

  properties: [  
    {
      name: 'accounts',
      class: 'Map',
      javaType: 'java.util.Map<String, CapabilityAccountData>',
    }
  ],

  methods: [
    // add logic from rule in here
  ]

});
  
    