/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedUCJQueryService',
  documentation: 'A cached implementation of the UCJQueryService interface.',

  javaImports: [
    'java.util.ArrayList',
    'java.util.List',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountTemplate',
    'net.nanopay.liquidity.crunch.ApproverLevel'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache'
    }
  ],

  methods: [
    {
      name: 'getRoles',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        }
      ],
      javaCode: `
      // TODO: Could probably later on use INSTANCE_OF for data to get global only

      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsForUser = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId)).select(new ArraySink())).getArray();
      List roleIdsForUser = new ArrayList();

      for ( int i = 0; i < ucjsForUser.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForUser.get(i);

        roleIdsForUser.add(currentUCJ.getTargetId());
      }

      return roleIdsForUser;
      `
    },
    {
      name: 'getUsers',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsForRole = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID,roleId)).select(new ArraySink())).getArray();
      List userIdsForRole = new ArrayList();

      for ( int i = 0; i < ucjsForRole.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForRole.get(i);

        userIdsForRole.add(currentUCJ.getSourceId());
      }

      return userIdsForRole;
      `
    },
    {
      name: 'getApproversByLevel',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'level',
          type: 'Integer'
        }
      ],
      javaCode: `
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID,roleId)).select(new ArraySink())).getArray();
      List approverIdsForLevel = new ArrayList();

      for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

        ApproverLevel approverLevel = (ApproverLevel) currentUCJ.getData();

        if ( approverLevel.getApproverLevel() == level ) approverIdsForLevel.add(currentUCJ.getSourceId());
      }

      return approverIdsForLevel;
      `
    }
  ]
});
