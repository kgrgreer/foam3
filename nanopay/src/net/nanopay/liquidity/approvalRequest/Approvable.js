/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'Approvable',

  properties: [  
    {
      class: 'String',
      name: 'id',
      documentation: `
        A function of daoKey, objId and a hashed properties to update, to be used
        to distinguish update requests on the same object
      `,
      required: true
    },
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
    },
    {
      class: 'Enum',
      of: 'net.nanopay.approval.ApprovalStatus',
      name: 'status'
    },
    {
      class: 'Map',
      name: 'propertiesToUpdate',
      factory: function(){
        return {};
      }
    },
  ],
});
