foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedAccountUCJQueryService',
  documentation: 'A cached implementation of the AccountUCJQueryService interface.',

  implements: [
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService'
  ],
  javaImports: [
    'java.util.ArrayList',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.List',
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'foam.core.FObject',
    'java.util.Set',
    'java.util.HashSet',
    'foam.nanos.auth.User',
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.account.Account',
    'net.nanopay.liquidity.crunch.AccountApproverMap',
    'net.nanopay.liquidity.crunch.AccountBasedLiquidCapability'

  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        Map<String,ConcurrentHashMap> cache = new ConcurrentHashMap<>();

        cache.put("getRolesCache", new ConcurrentHashMap<String,List>());
        cache.put("getUsersCache", new ConcurrentHashMap<String,List>());
        cache.put("getAccountsCache", new ConcurrentHashMap<String,List>());
        cache.put("getApproversByLevelCache", new ConcurrentHashMap<String,List>());

        cache.put("getRolesAndAccounts", new ConcurrentHashMap<String,List>());
        cache.put("getUsersAndRoles", new ConcurrentHashMap<String,List>());
        cache.put("getUsersAndAccounts", new ConcurrentHashMap<String,List>());

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
          name: 'x',
          type: 'Context'
        },
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
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        List rolesFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          if ( currentUCJ.getData() instanceof AccountApproverMap ){
            AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

            if (accountId == 0) rolesFilteredByAccount.add(currentUCJ.getTargetId());
            else if (accountMap.hasAccount(x, accountId))
              rolesFilteredByAccount.add(currentUCJ.getTargetId());
          }
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
          name: 'x',
          type: 'Context'
        },
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
        // TODO: Need to add a predicate which only retrieve roles with data being an instanceOf ???
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List usersFilteredByAccount = new ArrayList();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          if ( currentUCJ.getData() instanceof AccountApproverMap ){

            AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

            if (accountId == 0) usersFilteredByAccount.add(currentUCJ.getSourceId());
            else if (accountMap.hasAccount(x, accountId))
              usersFilteredByAccount.add(currentUCJ.getSourceId());
          }
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
          name: 'x',
          type: 'Context'
        },
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'userId',
          type: 'Long'
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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        List allUCJs;
        List<String> accounts = new ArrayList();

        if (roleId == null) {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        } else {
          allUCJs = ((ArraySink) ucjDAO.where(MLang.AND(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId), MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId))).select(new ArraySink())).getArray();
        }

        for (int i = 0; i < allUCJs.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUCJs.get(i);

          if ( currentUCJ.getData() instanceof AccountApproverMap ){
            AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();
            Object[] accountArray = accountMap.getAccounts().keySet().toArray();

            for (int j = 0; j < accountArray.length; j++) {
              if (!accounts.contains(accountArray[j])) accounts.add(String.valueOf(accountArray[j]));
            }
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
          name: 'x',
          type: 'Context'
        },
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
        }
      ],
      javaCode: `
      String cacheKey = 'm' + modelToApprove + 'a' + String.valueOf(accountId) + 'l' + level;
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
        capabilitiesDAO.listen(purgeSink, MLang.TRUE);

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
      Map<String,List> cacheMap = (ConcurrentHashMap<String,List>) getCache().get(cache);

      cacheMap.remove(cacheKey);
      `
    },
    {
      name: 'getRolesAndAccounts',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
    
      String cacheKey = 'u' + String.valueOf(userId);
      String cache = "getRolesAndAccounts";

      Map<String,List> getRolesAndAccountsCache = (Map<String,List>) getCache().get(cache);

      if ( ! getRolesAndAccountsCache.containsKey(cacheKey) ) {
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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO accountDAO = (DAO) x.get("localAccountDAO");

        List ucjsForUser = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();

        List totalList = new ArrayList<>();

        for ( int i = 0; i < ucjsForUser.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForUser.get(i);
          String capabilityId = currentUCJ.getTargetId();

          if ( currentUCJ.getData() instanceof AccountApproverMap ){
            AccountApproverMap currentData = (AccountApproverMap) currentUCJ.getData();


            for ( String accountId : currentData.getAccounts().keySet() ){
              // ! can remove this to optimize speed and just display the ids
              Account currentAccount = (Account) accountDAO.find(accountId);

              String[] currentList = {
                capabilityId,
                currentAccount.toSummary()
              };

              totalList.add(currentList);
            }
          }
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        getRolesAndAccountsCache.put(cacheKey, totalList);

        return totalList;

      } else {
        return getRolesAndAccountsCache.get(cacheKey);
      }
      `
    },
    {
      name: 'getUsersAndRoles',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
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
      String cacheKey = 'a' + String.valueOf(accountId);
      String cache = "getUsersAndRoles";
  
      Map<String,List> getUsersAndRolesCache = (Map<String,List>) getCache().get(cache);
  
      if ( ! getUsersAndRolesCache.containsKey(cacheKey) ) {
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
  
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO localUserDAO = (DAO) x.get("localUserDAO");
  
        List allUcjs = ((ArraySink) ucjDAO.select(new ArraySink())).getArray();
  
        List totalList = new ArrayList<>();
  
        for ( int i = 0; i < allUcjs.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUcjs.get(i);
          String userId = String.valueOf(currentUCJ.getSourceId());
          String capabilityId = currentUCJ.getTargetId();

          User currentUser = (User) localUserDAO.find(userId);
  
          if ( currentUCJ.getData() instanceof AccountApproverMap ){
            AccountApproverMap currentData = (AccountApproverMap) currentUCJ.getData();
  
            if ( currentData.hasAccount(x, accountId) ){
              String[] currentList = {
                currentUser.toSummary(),
                capabilityId
              };
  
              totalList.add(currentList);
            }
          }
        }
  
        ucjDAO.listen(purgeSink, MLang.TRUE);
  
        getUsersAndRolesCache.put(cacheKey, totalList);
  
        return totalList;
  
      } else {
        return getUsersAndRolesCache.get(cacheKey);
      }
      `
    },
    {
      name: 'getUsersAndAccounts',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
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
      String cacheKey = 'r' + roleId;
      String cache = "getUsersAndAccounts";
  
      Map<String,List> getUsersAndAccountsCache = (Map<String,List>) getCache().get(cache);
  
      if ( ! getUsersAndAccountsCache.containsKey(cacheKey) ) {
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
  
        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO localAccountDAO = (DAO) x.get("localAccountDAO");
        DAO localUserDAO = (DAO) x.get("localUserDAO");

  
        List ucjsForUser = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
  
        List totalList = new ArrayList<>();
  
        for ( int i = 0; i < ucjsForUser.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForUser.get(i);
          String userId = String.valueOf(currentUCJ.getSourceId());

          User currentUser = (User) localUserDAO.find(userId);
  
          if ( currentUCJ.getData() instanceof AccountApproverMap ){
            AccountApproverMap currentData = (AccountApproverMap) currentUCJ.getData();
  
  
            for ( String accountId : currentData.getAccounts().keySet() ){
              Account currentAccount = (Account) localAccountDAO.find(accountId);

              String[] currentList = {
                currentUser.toSummary(),
                currentAccount.toSummary()
              };
  
              totalList.add(currentList);
            }
          }
        }
  
        ucjDAO.listen(purgeSink, MLang.TRUE);
  
        getUsersAndAccountsCache.put(cacheKey, totalList);
  
        return totalList;
  
      } else {
        return getUsersAndAccountsCache.get(cacheKey);
      }
      `
    }
  ]
});
