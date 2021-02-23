/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
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
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.List',
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'foam.core.FObject',
    'foam.core.NumberSet',
    'java.util.Set',
    'java.util.HashSet',
    'foam.nanos.auth.User',
    'foam.dao.Sink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.account.Account',
    'foam.nanos.crunch.Capability',
    'net.nanopay.liquidity.crunch.LiquidCapability'
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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        Logger logger = (Logger) x.get("logger");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId)).select(new ArraySink())).getArray();
        Set rolesFilteredByAccount = new HashSet();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet numberSet = (NumberSet) currentUCJ.getData();

            if ( numberSet.contains(accountId) ) rolesFilteredByAccount.add(currentUCJ.getTargetId());
          } else {
            logger.warning("Expecting data of instance set but got:  " + currentUCJ.getData().getClass().getSimpleName() + " for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List rolesFilteredByAccountToCache = new ArrayList(rolesFilteredByAccount);
        rolesCache.put(cacheKey, rolesFilteredByAccountToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(rolesFilteredByAccount);

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

        Logger logger = (Logger) x.get("logger");

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsNotFilteredByAccount = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        Set usersFilteredByAccount = new HashSet();

        for (int i = 0; i < ucjsNotFilteredByAccount.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsNotFilteredByAccount.get(i);

          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet numberSet = (NumberSet) currentUCJ.getData();

            if ( numberSet.contains(accountId) ) usersFilteredByAccount.add(currentUCJ.getSourceId());
          } else {
            logger.warning("Expecting data of instance set but got:  " + currentUCJ.getData().getClass().getSimpleName() + " for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List usersFilteredByAccountToCache = new ArrayList(usersFilteredByAccount);
        usersCache.put(cacheKey, usersFilteredByAccountToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(usersFilteredByAccount);

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

        Logger logger = (Logger) x.get("logger");

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        Set<String> accounts = new HashSet();

        List allUCJs = ((ArraySink) ucjDAO.where(MLang.AND(MLang.EQ(UserCapabilityJunction.SOURCE_ID, userId), MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId))).select(new ArraySink())).getArray();

        for (int i = 0; i < allUCJs.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) allUCJs.get(i);

          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet numberSet = (NumberSet) currentUCJ.getData();

            for ( Long id : numberSet.getAsRealSet() ){
              accounts.add(String.valueOf(id));
            }

          } else {
            logger.warning("Expecting data of instance set but got:  " + currentUCJ.getData().getClass().getSimpleName() + " for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List accountsToCache = new ArrayList(accounts);
        accountsCache.put(cacheKey, accountsToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(accounts);

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
          type: 'String'
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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilitiesDAO = (DAO) x.get("localCapabilityDAO");

        Logger logger = (Logger) x.get("logger");

        String capabilityName = "approve" + modelToApprove;

        // using a set because we only care about unique approver ids
        Set<Long> uniqueApprovers = new HashSet<>();

        List foundCapabilityArray = ((ArraySink) capabilitiesDAO
          .where(
            foam.mlang.MLang.EQ(Capability.NAME, capabilityName)
          ).select(new ArraySink())).getArray();

        if ( foundCapabilityArray.size() == 0 ) {
          logger.error("Capability could not be found with name: " + capabilityName);
          throw new RuntimeException("Capability could not be found with name: " + capabilityName);
        }

        if ( foundCapabilityArray.size() > 1 ){
          logger.error("Multiple capabilities exist with the same name: " + capabilityName);
          throw new RuntimeException("Multiple capabilities exist with the same name: " + capabilityName);
        }

        LiquidCapability foundCapability = (LiquidCapability) foundCapabilityArray.get(0);

        List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, foundCapability.getId())).select(new ArraySink())).getArray();

        for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

          if ( currentUCJ.getData() == null ){
            logger.warning("A UCJ with an account-based capability has no data: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else if ( currentUCJ.getData() instanceof NumberSet ) {
            uniqueApprovers.add(currentUCJ.getSourceId());
          } else {
            logger.warning("Expecting data of instance set but got:  " + currentUCJ.getData().getClass().getSimpleName() + " for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List uniqueApproversForLevelList;
        
        if ( SafetyUtil.equals(modelToApprove, "Transaction") ){
          String multilevelCapabilityName = "level2TransactionApprover";

          List foundMultilevelCapabilityArray = ((ArraySink) capabilitiesDAO
            .where(
              foam.mlang.MLang.EQ(Capability.NAME, capabilityName)
            ).inX(getX()).select(new ArraySink())).getArray();

          if ( foundMultilevelCapabilityArray.size() == 0 ) {
            logger.error("Capability could not be found with name: " + capabilityName);
            throw new RuntimeException("Capability could not be found with name: " + capabilityName);
          }

          if ( foundMultilevelCapabilityArray.size() > 1 ){
            logger.error("Multiple capabilities exist with the same name: " + capabilityName);
            throw new RuntimeException("Multiple capabilities exist with the same name: " + capabilityName);
          }

          LiquidCapability foundMultilevelCapability = (LiquidCapability) foundMultilevelCapabilityArray.get(0);

          List level2ApproverUCJs = ((ArraySink) ucjDAO.where(
            MLang.AND(
              MLang.IN(
                UserCapabilityJunction.TARGET_ID,
                new ArrayList<>(uniqueApprovers)
              ),
              MLang.EQ(
                UserCapabilityJunction.TARGET_ID,
                foundMultilevelCapability.getId()
              )
            )).select(new ArraySink())
          ).getArray();

          Set level1Approvers = new HashSet(uniqueApprovers);
          Set level2Approvers = new HashSet();

          if ( level2ApproverUCJs.size() == 0 ){
            logger.error("No level 2 Transaction approvers found for this account");
            throw new RuntimeException("No level 2 Transaction approvers found for this account");
          }

          for ( int i = 0; i < level2ApproverUCJs.size(); i++ ){
            UserCapabilityJunction currentUCJ = (UserCapabilityJunction) level2ApproverUCJs.get(i);

            level1Approvers.remove(currentUCJ.getSourceId());

            level2Approvers.add(currentUCJ.getSourceId());
          }
          
          String cacheKeyL1 = 'm' + modelToApprove + 'a' + String.valueOf(accountId) + 'l' + 1;
          String cacheKeyL2 = 'm' + modelToApprove + 'a' + String.valueOf(accountId) + 'l' + 2;

          List uniqueApproversForLevel1ListToCache = new ArrayList(level1Approvers);
          List uniqueApproversForLevel2ListToCache = new ArrayList(level2Approvers);
          
          approversByLevelCache.put(cacheKeyL1, uniqueApproversForLevel1ListToCache);
          approversByLevelCache.put(cacheKeyL2, uniqueApproversForLevel2ListToCache);

          uniqueApproversForLevelList = level == 1 ? new ArrayList<>(level1Approvers) : new ArrayList<>(level2Approvers);

        } else {
          uniqueApproversForLevelList = new ArrayList(uniqueApprovers);

          List uniqueApproversForLevelListToCache = new ArrayList(uniqueApproversForLevelList);
          approversByLevelCache.put(cacheKey, uniqueApproversForLevelListToCache);
        }

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(uniqueApproversForLevelList);
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
          type: 'String'
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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilitiesDAO = (DAO) x.get("localCapabilityDAO");

        Logger logger = (Logger) x.get("logger");

        String capabilityName = "approve" + modelToApprove;

        // using a set because we only care about unique approver ids
        Set<Long> uniqueApprovers = new HashSet<>();

        List foundCapabilityArray = ((ArraySink) capabilitiesDAO
          .where(
            foam.mlang.MLang.EQ(Capability.NAME, capabilityName)
          ).inX(getX()).select(new ArraySink())).getArray();

        if ( foundCapabilityArray.size() == 0 ) {
          logger.error("Capability could not be found with name: " + capabilityName);
          throw new RuntimeException("Capability could not be found with name: " + capabilityName);
        }

        if ( foundCapabilityArray.size() > 1 ){
          logger.error("Multiple capabilities exist with the same name: " + capabilityName);
          throw new RuntimeException("Multiple capabilities exist with the same name: " + capabilityName);
        }

        LiquidCapability foundCapability = (LiquidCapability) foundCapabilityArray.get(0);

        List ucjsForApprovers = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, foundCapability.getId())).select(new ArraySink())).getArray();

        for ( int i = 0; i < ucjsForApprovers.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForApprovers.get(i);

          if ( currentUCJ.getData() == null ){
            logger.warning("A UCJ with an account-based capability has no data: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else if ( currentUCJ.getData() instanceof NumberSet ) {
            uniqueApprovers.add(currentUCJ.getSourceId());
          } else {
            logger.warning("Expecting data of instance set but got:  " + currentUCJ.getData().getClass().getSimpleName() + " for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          }
        }

        List uniqueApproversList = new ArrayList(uniqueApprovers);
        
        List uniqueApproversListToCache = new ArrayList(uniqueApproversList);
        allApproversCache.put(cacheKey, uniqueApproversListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(uniqueApproversList);
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
          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet numberSet = (NumberSet) currentUCJ.getData();

            Set<Long> currentData = (HashSet<Long>) numberSet.getAsRealSet();

            for ( Long accountId : currentData ){
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
  
          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet currentData = (NumberSet) currentUCJ.getData();
  
            if ( currentData.contains(accountId) ){
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
  
          if ( currentUCJ.getData() instanceof NumberSet ){
            NumberSet numberSet = (NumberSet) currentUCJ.getData();
            Set<Long> currentData = (HashSet<Long>) numberSet.getAsRealSet();
  
            for ( Long accountId : currentData ){
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
