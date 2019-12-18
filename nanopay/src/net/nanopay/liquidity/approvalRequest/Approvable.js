/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'Approvable',

  ids: [
    'daoKey',
    'objId',
    'propertiesToUpdate'
  ],

  properties: [  
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
    }
  ],
});
