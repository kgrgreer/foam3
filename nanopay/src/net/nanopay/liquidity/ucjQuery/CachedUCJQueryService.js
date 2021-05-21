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
    'net.nanopay.liquidity.crunch.LiquidCapability',
    'foam.nanos.crunch.Capability'
  ],

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        Map<String,ConcurrentHashMap> cache = new ConcurrentHashMap<>();

        cache.put("rolesCache", new ConcurrentHashMap<String,List>());
        cache.put("usersCache", new ConcurrentHashMap<String,List>());
        cache.put("allApproversCache", new ConcurrentHashMap<String,List>());
  
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
        }
      ],
      javaCode: `
      String cacheKey = String.valueOf(userId);
      String cache = "rolesCache";

      Map<String,List> rolesCache = (Map<String,List>) getCache().get(cache);

      Logger logger = (Logger) x.get("logger");

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

        DAO ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

        List ucjsForUser = ((ArraySink) ucjDAO.where(MLang.EQ(UserCapabilityJunction.SOURCE_ID,userId)).select(new ArraySink())).getArray();
        Set roleIdsForUser = new HashSet();

        for ( int i = 0; i < ucjsForUser.size(); i++ ){
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForUser.get(i);

          if ( currentUCJ.getData() != null ){
            logger.warning("Expecting null data for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else {
            roleIdsForUser.add(currentUCJ.getTargetId());
          }
        }

        List roleIdsForUserToCache = new ArrayList(roleIdsForUser);
        rolesCache.put(cacheKey, roleIdsForUserToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(roleIdsForUser);
      } else {
        List newListFromCache = new ArrayList(rolesCache.get(cacheKey));

        return newListFromCache;
      }
      `
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
        }
      ],
      javaCode: `
      String cacheKey = roleId;
      String cache = "usersCache";

      Map<String, List> usersCache = (Map<String, List>) getCache().get(cache);

      Logger logger = (Logger) x.get("logger");

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
        Set userIdsForRole = new HashSet();

        for (int i = 0; i < ucjsForRole.size(); i++) {
          UserCapabilityJunction currentUCJ = (UserCapabilityJunction) ucjsForRole.get(i);

          if ( currentUCJ.getData() != null ){
            logger.warning("Expecting null data for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else {
            userIdsForRole.add(currentUCJ.getSourceId());
          }
        }

        List userIdsForRoleToCache = new ArrayList(userIdsForRole);
        usersCache.put(cacheKey, userIdsForRoleToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

        return new ArrayList<>(userIdsForRole);

      } else {
        List newListFromCache = new ArrayList(usersCache.get(cacheKey));

        return newListFromCache;
      }
      `
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

          if ( currentUCJ.getData() != null ){
            logger.warning("Expecting null data for: " + currentUCJ.getSourceId() + '-' + currentUCJ.getTargetId());
          } else {
            uniqueApprovers.add(currentUCJ.getSourceId());
          }
        }

        List uniqueApproversList = new ArrayList(uniqueApprovers);
        
        List uniqueApproversListToCache = new ArrayList(uniqueApproversList);
        allApproversCache.put(cacheKey, uniqueApproversListToCache);

        ucjDAO.listen(purgeSink, MLang.TRUE);

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
