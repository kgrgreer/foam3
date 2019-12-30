/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedAccountUCJQueryService',
  documentation: 'A cached implementation of the AccountUCJQueryService interface.',

  implements: [
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService'
  ],
  javaImports: [
    'java.util.ArrayList',
    'java.util.List',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.ArraySink',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountTemplate',

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
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ],
      javaCode: `
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId)).select(new ArraySink())).getArray();
      List rolesFilteredByAccount = new ArrayList();

      for ( int i = 0; i < ucjsNotFilteredByAccount.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

        AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

        if ( accountId == 0 ) rolesFilteredByAccount.add(currentUCJ.getTargetId());
        else if ( accountTemplate.hasAccount(getX(), accountId) ) rolesFilteredByAccount.add(currentUCJ.getTargetId());
      }

      return rolesFilteredByAccount;
      `,
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
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ],
      javaCode: `
      // TODO: Need to add a predicate which only retrieve roles with data being an instanceOf AccountTemplate
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID,roleId)).select(new ArraySink())).getArray();
      List usersFilteredByAccount = new ArrayList();

      for ( int i = 0; i < ucjsNotFilteredByAccount.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

        AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

        if ( accountId == 0 ) usersFilteredByAccount.add(currentUCJ.getSourceId());
        else if ( accountTemplate.hasAccount(getX(), accountId) ) usersFilteredByAccount.add(currentUCJ.getSourceId());
      }

      return usersFilteredByAccount;
      `,
    },
    {
      name: 'getAccounts',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
      // TODO: Should probably rework this to cascade and find all accounts
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");
      List allUCJs;
      List accounts = new ArrayList();

      if ( roleId == null ){
        allUCJs = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId)).select(new ArraySink())).getArray();
      } else {
        allUCJs = ((ArraySink) ucjDAO.where(MLang.AND(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId),MLang.EQ(UserCapabilityJunction.TARGET_ID,roleId))).select(new ArraySink())).getArray();
      }

      for ( int i = 0; i < allUCJs.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUCJs.get(i);

        AccountTemplate currentAccountTemplate = (AccountTemplate) currentUCJ.getData();
        Object[] accountArray = currentAccountTemplate.getAccounts().keySet().toArray();

        for ( int j = 0; j < accountArray.length; j++ ){
          if ( ! accounts.contains(accountArray[j]) ) accounts.add(accountArray[j]);
        }
      }

      return accounts;
      `,
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
          name: 'accountId',
          type: 'Long'
        },
        {
          name: 'level',
          type: 'Integer'
        }
      ],
      javaCode: `
      DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

      List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID,roleId)).select(new ArraySink())).getArray();
      List approversFilteredByAccountAndLevel = new ArrayList();

      for ( int i = 0; i < ucjsNotFilteredByAccount.size(); i++ ){
        UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

        AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

        if ( accountId == 0 && level == 0 ) approversFilteredByAccountAndLevel.add(currentUCJ.getSourceId());
        else if ( accountTemplate.hasAccountByApproverLevel(getX(), accountId, level) ) approversFilteredByAccountAndLevel.add(currentUCJ.getSourceId());
      }

      return approversFilteredByAccountAndLevel;
      `,
    }
  ]
});
