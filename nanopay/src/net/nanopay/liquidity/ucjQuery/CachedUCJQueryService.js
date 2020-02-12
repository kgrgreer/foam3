foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedUCJQueryService',
  documentation: 'A cached implementation of the UCJQueryService interface.',

  implements: [
    'net.nanopay.liquidity.ucjQuery.UCJQueryService'
  ],

  javaImports: [
    'foam.core.X',
    'java.util.ArrayList',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.List',
    'java.util.Map',
    'foam.core.Detachable',
    'java.util.HashMap',
    'java.util.Set',
    'java.util.HashSet',
    'foam.core.FObject',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.liquidity.crunch.ApproverLevel',
    'net.nanopay.liquidity.crunch.GlobalLiquidCapability'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        Map<String,ConcurrentHashMap> cache = new ConcurrentHashMap<>();

        cache.put("rolesCache", new ConcurrentHashMap<String,List>());
        cache.put("usersCache", new ConcurrentHashMap<String,List>());
        cache.put("approversByLevelCache", new ConcurrentHashMap<String,List>());
        cache.put("allApproversCache", new ConcurrentHashMap<String,List>());
  
        return cache;
      `
    }
  ],

  methods: [
    {
      name: 'getRoles',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        }
      ],
      javaCode: `
      String cacheKey = String.valueOf(userId);
      String cache = "rolesCache";

      Map<String,List> rolesCache = (Map<String,List>) getCache().get(cache);

      if ( ! rolesCache.containsKey(cacheKey) ){
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

        List ucjsForUser = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId)).select(new ArraySink())).getArray();
        List roleIdsForUser = new ArrayList();

        for ( int i = 0; i < ucjsForUser.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForUser.get(i);

          // GlobalCapabilities use ApproverLevel as data in the UCJ
          if ( currentUCJ.getData() instanceof ApproverLevel ){
            roleIdsForUser.add(currentUCJ.getTargetId());
          }
        }

        List roleIdsForUserToCache = new ArrayList(roleIdsForUser);
        rolesCache.put(cacheKey, roleIdsForUserToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return roleIdsForUser;
      } else {
        List newListFromCache = new ArrayList(rolesCache.get(cacheKey));

        return newListFromCache;
      }
      `
    },
    {
      name: 'getUsers',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'roleId',
          type: 'String'
        }
      ],
      javaCode: `
      String cacheKey = roleId;
      String cache = "usersCache";

      Map<String, List> usersCache = (Map<String, List>) getCache().get(cache);

      if (! usersCache.containsKey(cacheKey)) {
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

        List ucjsForRole = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List userIdsForRole = new ArrayList();

        for (int i = 0; i < ucjsForRole.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForRole.get(i);

          userIdsForRole.add(currentUCJ.getSourceId());
        }

        List userIdsForRoleToCache = new ArrayList(userIdsForRole);
        usersCache.put(cacheKey, userIdsForRoleToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return userIdsForRole;

      } else {
        List newListFromCache = new ArrayList(usersCache.get(cacheKey));

        return newListFromCache;
      }
      `
    },
    {
      name: 'getApproversByLevel',
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
          name: 'level',
          type: 'Integer'
        }
      ],
      javaCode: `  
      String cacheKey = 'm' + modelToApprove + 'l' + String.valueOf(level);
      String cache = "approversByLevelCache";

      Map<String, List> approversByLevelCache = (Map<String, List>) getCache().get(cache);

      if (! approversByLevelCache.containsKey(cacheKey)) {
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

        List<GlobalLiquidCapability> capabilitiesWithAbility;

        switch(modelToApprove){
          case "liquidcapability":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITY, true)
            ).select(new ArraySink())).getArray();
            break;
          case "rule":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_RULE, true)
            ).select(new ArraySink())).getArray();
            break;
          case "liquiditysettings":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_LIQUIDITYSETTINGS, true)
            ).select(new ArraySink())).getArray();
            break;
          case "user":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_USER, true)
            ).select(new ArraySink())).getArray();
            break;
          case "capabilityrequest":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITYREQUEST, true)
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

          if ( currentUCJ.getData() != null ) {
            ApproverLevel currentApproverLevel = (ApproverLevel) currentUCJ.getData();
            if ( currentApproverLevel.getApproverLevel() == level ) uniqueApproversForLevel.add(currentUCJ.getSourceId());
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
      `
    },
        {
      name: 'getAllApprovers',
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'modelToApprove',
          type: 'String'
        }
      ],
      javaCode: `  
      String cacheKey = 'm' + modelToApprove;
      String cache = "allApproversCache";

      Map<String, List> allApproversCache = (Map<String, List>) getCache().get(cache);

      if (! allApproversCache.containsKey(cacheKey)) {
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

        List<GlobalLiquidCapability> capabilitiesWithAbility;

        switch(modelToApprove){
          case "liquidcapability":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITY, true)
            ).select(new ArraySink())).getArray();
            break;
          case "rule":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_RULE, true)
            ).select(new ArraySink())).getArray();
            break;
          case "liquiditysettings":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_LIQUIDITYSETTINGS, true)
            ).select(new ArraySink())).getArray();
            break;
          case "user":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_USER, true)
            ).select(new ArraySink())).getArray();
            break;
          case "capabilityrequest":
            capabilitiesWithAbility = ((ArraySink) capabilitiesDAO.where(
              MLang.EQ(GlobalLiquidCapability.CAN_APPROVE_CAPABILITYREQUEST, true)
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
            uniqueApprovers.add(currentUCJ.getSourceId());
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
