/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.roles',
  name: 'RoleAssignmentTemplate',

  properties: [  
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'assignedAccountIds',
      class: 'Array',
      of: 'Long'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.roles.Role',
      name: 'assignedRole',
    }
  ],
});
