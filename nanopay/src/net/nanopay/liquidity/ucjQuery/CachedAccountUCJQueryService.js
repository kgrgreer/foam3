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

        cache.put("rolesCache", new ConcurrentHashMap<String,List>());
        cache.put("usersCache", new ConcurrentHashMap<String,List>());
        cache.put("accountsCache", new ConcurrentHashMap<String,List>());
        cache.put("approversByLevelCache", new ConcurrentHashMap<String,List>());
        cache.put("allApproversCache", new ConcurrentHashMap<String,List>());

        cache.put("rolesAndAccountsCache", new ConcurrentHashMap<String,List>());
        cache.put("usersAndRolesCache", new ConcurrentHashMap<String,List>());
        cache.put("usersAndAccountsCache", new ConcurrentHashMap<String,List>());

        return cache;
      `
    }
  ],

  methods: [
    {
      name: 'getRoles',
      async: true,
      type: 'List',
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
      String cache = "rolesCache";

      Map<String,List> rolesCache = (Map<String,List>) getCache().get(cache);

      if ( ! rolesCache.containsKey(cacheKey) ) {
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

        List rolesFilteredByAccountToCache = new ArrayList(rolesFilteredByAccount);
        rolesCache.put(cacheKey, rolesFilteredByAccountToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return rolesFilteredByAccount;

      } else {
        List newListFromCache = new ArrayList(rolesCache.get(cacheKey));

        return newListFromCache;
      }
      `,
    },
    {
      name: 'getUsers',
      async: true,
      type: 'List',
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
      String cache = "usersCache";

      Map<String,List> usersCache = (Map<String,List>) getCache().get(cache);

      if ( ! usersCache.containsKey(cacheKey) ) {
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

        List usersFilteredByAccountToCache = new ArrayList(usersFilteredByAccount);
        usersCache.put(cacheKey, usersFilteredByAccountToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return usersFilteredByAccount;

      } else {
        List newListFromCache = new ArrayList(usersCache.get(cacheKey));

        return newListFromCache;
      }
      `,
    },
    {
      name: 'getAccounts',
      async: true,
      type: 'List',
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
      String cache = "accountsCache";

      Map<String,List> accountsCache = (Map<String,List>) getCache().get(cache);

      if ( ! accountsCache.containsKey(cacheKey) ) {
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

        List accountsToCache = new ArrayList(accounts);
        accountsCache.put(cacheKey, accountsToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return accounts;

      } else {
        List newListFromCache = new ArrayList(accountsCache.get(cacheKey));

        return newListFromCache;
      }
      `,
    },
    {
      name: 'getApproversByLevel',
      async: true,
      type: 'List',
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
      String cacheKey = 'm' + modelToApprove + 'a' + String.valueOf(accountId) + 'l' + String.valueOf(level);
      String cache = "approversByLevelCache";

      Map<String,List> approversByLevelCache = (Map<String,List>) getCache().get(cache);

      if ( ! approversByLevelCache.containsKey(cacheKey) ) {
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

          if ( currentUCJ.getData() != null ){
            AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

            if (  accountMap.hasAccountByApproverLevel(x, accountId, level) ) uniqueApproversForLevel.add(currentUCJ.getSourceId());
          } else {
            logger.warning("A UCJ with no data is found: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List uniqueApproversForLevelList = new ArrayList(uniqueApproversForLevel);
        
        List uniqueApproversForLevelListToCache = new ArrayList(uniqueApproversForLevelList);
        approversByLevelCache.put(cacheKey, uniqueApproversForLevelListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);
        capabilitiesDAO.listen(purgeSink, MLang.TRUE);

        return uniqueApproversForLevelList;
      } else {
        List newListFromCache = new ArrayList(approversByLevelCache.get(cacheKey));

        return newListFromCache;
      }
      `,
    },
     {
      name: 'getAllApprovers',
      async: true,
      type: 'List',
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
        }
      ],
      javaCode: `
      String cacheKey = 'm' + modelToApprove + 'a' + String.valueOf(accountId);
      String cache = "allApproversCache";

      Map<String,List> allApproversCache = (Map<String,List>) getCache().get(cache);

      if ( ! allApproversCache.containsKey(cacheKey) ) {
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
        Set<Long> uniqueApprovers = new HashSet<>();
        List<String> capabilitiesWithAbilityNameIdOnly = new ArrayList<>();

        for ( int i = 0; i < capabilitiesWithAbility.size(); i++ ){
          capabilitiesWithAbilityNameIdOnly.add(capabilitiesWithAbility.get(i).getId());
        }

        List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.IN(UserCapabilityJunction.TARGET_ID, capabilitiesWithAbilityNameIdOnly)).select(new ArraySink())).getArray();

        for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

          if ( currentUCJ.getData() != null ){
            AccountApproverMap accountMap = (AccountApproverMap) currentUCJ.getData();

            if (  accountMap.hasAccount(x, accountId) ) uniqueApprovers.add(currentUCJ.getSourceId());
          } else {
            logger.warning("A UCJ with no data is found: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List uniqueApproversList = new ArrayList(uniqueApprovers);
        
        List uniqueApproversListToCache = new ArrayList(uniqueApproversList);
        allApproversCache.put(cacheKey, uniqueApproversListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);
        capabilitiesDAO.listen(purgeSink, MLang.TRUE);

        return uniqueApproversList;
      } else {
        List newListFromCache = new ArrayList(allApproversCache.get(cacheKey));

        return newListFromCache;
      }
      `,
    },
    {
      name: 'getRolesAndAccounts',
      async: true,
      type: 'List',
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
      String cache = "rolesAndAccountsCache";

      Map<String,List> rolesAndAccountsCache = (Map<String,List>) getCache().get(cache);

      if ( ! rolesAndAccountsCache.containsKey(cacheKey) ) {
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

          // AccountBasedCapabilities use AccountApproverMap as data in the UCJ
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

        List totalListToCache = new ArrayList(totalList);
        rolesAndAccountsCache.put(cacheKey, totalListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return totalList;

      } else {
        List newListFromCache = new ArrayList(rolesAndAccountsCache.get(cacheKey));

        return newListFromCache;
      }
      `
    },
    {
      name: 'getUsersAndRoles',
      async: true,
      type: 'List',
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
      String cache = "usersAndRolesCache";
  
      Map<String,List> usersAndRolesCache = (Map<String,List>) getCache().get(cache);
  
      if ( ! usersAndRolesCache.containsKey(cacheKey) ) {
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
    
        List totalListToCache = new ArrayList(totalList);
        usersAndRolesCache.put(cacheKey, totalListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);
  
        return totalList;
  
      } else {
        List newListFromCache = new ArrayList(usersAndRolesCache.get(cacheKey));

        return newListFromCache;
      }
      `
    },
    {
      name: 'getUsersAndAccounts',
      async: true,
      type: 'List',
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
      String cache = "usersAndAccountsCache";
  
      Map<String,List> usersAndAccountsCache = (Map<String,List>) getCache().get(cache);
  
      if ( ! usersAndAccountsCache.containsKey(cacheKey) ) {
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
    
        List totalListToCache = new ArrayList(totalList);
        usersAndAccountsCache.put(cacheKey, totalListToCache);
        
        ucjDAO.listen(purgeSink, MLang.TRUE);
  
        return totalList;
  
      } else {
        List newListFromCache = new ArrayList(usersAndAccountsCache.get(cacheKey));

        return newListFromCache;
      }
      `
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
      Map<String,List> cacheMap = (Map<String,List>) getCache().get(cache);

      cacheMap.remove(cacheKey);
      `
    }
  ]
});
