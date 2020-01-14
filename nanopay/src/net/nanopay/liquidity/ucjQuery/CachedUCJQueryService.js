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
        Map<String,Map> cache = new HashMap<>();

        cache.put("getRolesCache", new HashMap<String,List>());
        cache.put("getUsersCache", new HashMap<String,List>());
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
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      String cacheKey = String.valueOf(userId);
      String cache = "getRolesCache";

      Map<String,List> getRolesCache = (Map<String,List>) getCache().get(cache);

      if ( ! getRolesCache.containsKey(cacheKey) ){
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

          roleIdsForUser.add(currentUCJ.getTargetId());
        }

        getRolesCache.put(cacheKey, roleIdsForUser);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return roleIdsForUser;
      } else {
        return getRolesCache.get(cacheKey);
      }
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
        },
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      String cacheKey = roleId;
      String cache = "getUsersCache";

      Map<String, List> getUsersCache = (Map<String, List>) getCache().get(cache);

      if (! getUsersCache.containsKey(cacheKey)) {
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

        List ucjsForRole = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.TARGET_ID, roleId)).select(new ArraySink())).getArray();
        List userIdsForRole = new ArrayList();

        for (int i = 0; i < ucjsForRole.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForRole.get(i);

          userIdsForRole.add(currentUCJ.getSourceId());
        }

        getUsersCache.put(cacheKey, userIdsForRole);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return userIdsForRole;

      } else {
        return getUsersCache.get(cacheKey);
      }
      `
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
          name: 'level',
          type: 'Integer'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `  
      String cacheKey = 'm' + modelToApprove + 'l' + level;
      String cache = "getApproversByLevelCache";

      Map<String, List> getApproversByLevelCache = (Map<String, List>) getCache().get(cache);

      if (! getApproversByLevelCache.containsKey(cacheKey)) {
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
          ApproverLevel currentApproverLevel = (ApproverLevel) currentUCJ.getData();

          if ( currentApproverLevel.getApproverLevel() == level ) uniqueApproversForLevel.add(currentUCJ.getSourceId());
        }

        List uniqueApproversForLevelList = new ArrayList(uniqueApproversForLevel);

        getApproversByLevelCache.put(cacheKey, uniqueApproversForLevelList);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return uniqueApproversForLevelList;

      } else {
        return getApproversByLevelCache.get(cacheKey);
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
      Map<String,List> cacheMap = (HashMap<String,List>) getCache().get(cache);

      cacheMap.remove(cacheKey);
      `
    }
  ]
});
