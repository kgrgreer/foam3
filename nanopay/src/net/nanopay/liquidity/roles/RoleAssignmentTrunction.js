/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.roles',
  name: 'RoleAssignmentTrunction',

  properties: [  
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.roles.Role',
      name: 'roleId',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'accountId',
    },
  ],
});
