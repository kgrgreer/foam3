/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.roles',
  name: 'Role',

  properties: [  
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'isCascading',
      class: 'Boolean'
    }
  ],
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.liquidity.roles.Role',  
  targetModel: 'net.nanopay.liquidity.roles.Role',
  cardinality: '*:*',
  forwardName: 'subRoles',
  inverseName: 'parentRoles',
  junctionDAOKey: 'roleRoleJunctionDAO'
});
