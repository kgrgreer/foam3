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
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'foam.core.FObject', 
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.ArraySink',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountTemplate',

  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        Map<String,Map> cache = new HashMap<>();

        cache.put("getRolesCache", new HashMap<String,List>());
        cache.put("getUsersCache", new HashMap<String,List>());
        cache.put("getAccountsCache", new HashMap<String,List>());
        cache.put("getApproversByLevelCache", new HashMap<String,List>());

        return cache;
      `
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
      String cacheKey = 'u' + String.valueOf(userId) + 'a' + String.valueOf(accountId);
      String cache = "getRolesCache";

      Map<String,List> getRolesCache = (Map<String,List>) getCache().get(cache);

      if ( ! getRolesCache.containsKey(cacheKey) ) {
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void remove(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void eof() {
          }

          public void reset(Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }
        };

        // TODO: PLZ FIX AFTER OPTIMIZATION TO ACCOUNT TEMPLATE
        DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        List rolesFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

          if (accountId == 0) rolesFilteredByAccount.add(currentUCJ.getTargetId());
          else if (accountTemplate.hasAccount(getX(), accountId))
            rolesFilteredByAccount.add(currentUCJ.getTargetId());
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return rolesFilteredByAccount;

      } else {
        return getRolesCache.get(cacheKey);
      }
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
      String cacheKey = 'r' + roleId + 'a' + String.valueOf(accountId);
      String cache = "getUsersCache";

      Map<String,List> getUsersCache = (Map<String,List>) getCache().get(cache);

      if ( ! getUsersCache.containsKey(cacheKey) ) {
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void remove(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void eof() {
          }

          public void reset(Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }
        };

        // TODO: PLZ FIX AFTER OPTIMIZATION TO ACCOUNT TEMPLATE
        // TODO: Need to add a predicate which only retrieve roles with data being an instanceOf AccountTemplate
        DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List usersFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

          if (accountId == 0) usersFilteredByAccount.add(currentUCJ.getSourceId());
          else if (accountTemplate.hasAccount(getX(), accountId))
            usersFilteredByAccount.add(currentUCJ.getSourceId());
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return usersFilteredByAccount;

      } else {
        return getUsersCache.get(cacheKey);
      }
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
      String cacheKey = 'u' + String.valueOf(userId) + 'r' + roleId;
      String cache = "getAccountsCache";

      Map<String,List> getAccountsCache = (Map<String,List>) getCache().get(cache);

      if ( ! getAccountsCache.containsKey(cacheKey) ) {
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void remove(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void eof() {
          }

          public void reset(Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }
        };

        // TODO: PLZ FIX AFTER OPTIMIZATION TO ACCOUNT TEMPLATE
        // TODO: Should probably rework this to cascade and find all accounts
        DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");
        List allUCJs;
        List accounts = new ArrayList();

        if (roleId == null) {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        } else {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.AND(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId), MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId))).select(new ArraySink())).getArray();
        }

        for (int i = 0; i < allUCJs.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUCJs.get(i);

          AccountTemplate currentAccountTemplate = (AccountTemplate) currentUCJ.getData();
          Object[] accountArray = currentAccountTemplate.getAccounts().keySet().toArray();

          for (int j = 0; j < accountArray.length; j++) {
            if (!accounts.contains(accountArray[j])) accounts.add(accountArray[j]);
          }
        }

        return accounts;

      } else {
        return getAccountsCache.get(cacheKey);
      }
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
      String cacheKey = 'r' + String.valueOf(accountId) + 'a' + String.valueOf(accountId) + 'l' + level;
      String cache = "getApproversByLevelCache";

      Map<String,List> getApproversByLevelCache = (Map<String,List>) getCache().get(cache);

      if ( ! getApproversByLevelCache.containsKey(cacheKey) ) {
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void remove(Object obj, Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }

          public void eof() {
          }

          public void reset(Detachable sub) {
            purgeCache(cache, cacheKey);
            sub.detach();
          }
        };


        // TODO: PLZ FIX AFTER OPTIMIZATION TO ACCOUNT TEMPLATE
        DAO ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List approversFilteredByAccountAndLevel = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          AccountTemplate accountTemplate = (AccountTemplate) currentUCJ.getData();

          if (accountId == 0 && level == 0) approversFilteredByAccountAndLevel.add(currentUCJ.getSourceId());
          else if (accountTemplate.hasAccountByApproverLevel(getX(), accountId, level))
            approversFilteredByAccountAndLevel.add(currentUCJ.getSourceId());
        }

        return approversFilteredByAccountAndLevel;

      } else {
        return getApproversByLevelCache.get(cacheKey);
      }
      `,
    },
    {
      name: 'purgeCache',
      type: 'void',
      args: [
        {
          name: 'cache',
          type: 'String'
        },
        {
          name: 'cacheKey',
          type: 'String'
        }
      ],
      javaCode: `
      Map<String,List> cacheMap = (HashMap<String,List>) getCache().get(cache);

      cacheMap.remove(cacheKey);
      `
    }
  ]
});
