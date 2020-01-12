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
    'java.util.Set',
    'java.util.HashSet',
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.AccountApproverMap',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability'

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
        },
        {
          name: 'x',
          type: 'Context'
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
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        List rolesFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

          if (accountId == 0) rolesFilteredByAccount.add(currentUCJ.getTargetId());
          else if (accountMap.hasAccount(x, accountId))
            rolesFilteredByAccount.add(currentUCJ.getTargetId());
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        getRolesCache.put(cacheKey, rolesFilteredByAccount);

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
        },
        {
          name: 'x',
          type: 'Context'
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
        // TODO: Need to add a predicate which only retrieve roles with data being an instanceOf ???
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List usersFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

          if (accountId == 0) usersFilteredByAccount.add(currentUCJ.getSourceId());
          else if (accountMap.hasAccount(x, accountId))
            usersFilteredByAccount.add(currentUCJ.getSourceId());
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        getUsersCache.put(cacheKey, usersFilteredByAccount);

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
        },
        {
          name: 'x',
          type: 'Context'
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
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        List allUCJs;
        List accounts = new ArrayList();

        if (roleId == null) {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        } else {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.AND(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId), MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId))).select(new ArraySink())).getArray();
        }

        for (int i = 0; i < allUCJs.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUCJs.get(i);

          AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();
          Object[] accountArray = accountMap.getAccounts().keySet().toArray();

          for (int j = 0; j < accountArray.length; j++) {
            if (!accounts.contains(accountArray[j])) accounts.add(accountArray[j]);
          }
        }

        getAccountsCache.put(cacheKey, accounts);

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
          name: 'modelToApprove',
          type: 'String'
        },
        {
          name: 'accountId',
          type: 'Long'
        },
        {
          name: 'level',
          type: 'Integer'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      String cacheKey = 'm' + String.valueOf(accountId) + 'a' + String.valueOf(accountId) + 'l' + level;
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
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilitiesDAO = (DAO) x.get("localCapabilityDAO");

        Logger logger = (Logger) x.get("logger");

        modelToApprove = modelToApprove.toLowerCase();

        List<AccountBasedLiquidCapability> capabilitiesWithAbility;

        switch(modelToApprove){
          case "account":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(AccountBasedLiquidCapability.CAN_APPROVE_ACCOUNT, true)
            ).select(new ArraySink())).getArray();
            break;
          case "transaction":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(AccountBasedLiquidCapability.CAN_APPROVE_TRANSACTION, true)
            ).select(new ArraySink())).getArray();
            break;
          default:
            capabilitiesWithAbility = null;
            logger.error("Something went wrong with the requested model: " + modelToApprove);
            throw new RuntimeException("Something went wrong with the requested model: " + modelToApprove);
        }

        // using a set because we only care about unique approver ids
        Set<Long> uniqueApproversForLevel = new HashSet<>();
        List<String> capabilitiesWithAbilityNameIdOnly = new ArrayList<>();

        for ( int i = 0; i < capabilitiesWithAbility.size(); i++ ){
          capabilitiesWithAbilityNameIdOnly.add(capabilitiesWithAbility.get(i).getId());
        }

        List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.IN(UserCapabilityJunction.TARGET_ID, capabilitiesWithAbilityNameIdOnly)).select(new ArraySink())).getArray();

        for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);
          AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

          if (  accountMap.hasAccountByApproverLevel(x, accountId, level) ) uniqueApproversForLevel.add(currentUCJ.getSourceId());
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        List uniqueApproversForLevelList = new ArrayList(uniqueApproversForLevel);

        getApproversByLevelCache.put(cacheKey, uniqueApproversForLevelList);

        return uniqueApproversForLevelList;

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
