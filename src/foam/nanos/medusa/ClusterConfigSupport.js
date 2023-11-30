/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigSupport',

  documentation: `Support service from which an instance may inquire it\'s
cluster type - such as primary. It also provides access to
configuration for contacting the primary node.`,

  axioms: [
    foam.pattern.Singleton.create()
  ],

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.SessionClientBox',
    'foam.box.socket.SocketClientBox',
    'foam.box.socket.SocketServer',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.NotificationClientDAO',
    'foam.dao.ProxyDAO',
    'static foam.mlang.MLang.*',
    'static foam.mlang.MLang.COUNT',
    'foam.mlang.sink.Count',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.medusa.ElectoralService',
    'foam.nanos.medusa.ElectoralServiceState',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'foam.net.Host',
    'foam.net.Port',
    'foam.util.SafetyUtil',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  properties: [
    {
      documentation: 'URL path prefix',
      name: 'path',
      class: 'String',
      value: 'service'
    },
    {
      name: 'serviceName',
      class: 'String',
      value: 'cluster'
    },
    {
      name: 'hashingEnabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'configId',
      label: 'Self',
      class: 'String',
      javaFactory: `
      String hostname = System.getProperty("hostname", "localhost");
      if ( "localhost".equals(hostname) ) {
        hostname = System.getProperty("user.name");
      }
      return hostname;
      `,
      visibility: 'RO'
    },
    {
      name: 'configName',
      label: 'Self',
      class: 'String',
      javaFactory: 'return getConfig(getX(), getConfigId()).getName();',
      visibility: 'RO'
    },
    {
      documentation: 'A single instance is using the medusa journal. No other clustering features are used.',
      name: 'standAlone',
      class: 'Boolean',
      value: false,
      visibility: 'RO'
    },
    {
      documentation: 'Maximum retries of a retry client. Set to -1 for infinite retry',
      name: 'maxRetryAttempts',
      class: 'Int',
      value: 20
    },
    {
      documentation: 'Maximum delay in milliseconds between retries of a retry client',
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'medusaThreadPool'
    },
    {
      name: 'mdaos',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
    },
    {
      name: 'nodeBuckets',
      class: 'List',
      visibility: 'RO',
      javaFactory: `
      return new ArrayList();
      `
    },
    {
      name: 'shutdown',
      class: 'Boolean',
      value: false,
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return Loggers.logger(getX(), this);
      `
    },
    {
      name: 'nodeCount',
      class: 'Int',
      javaFactory: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getNodeCount");
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion()),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW)
          ))
        .select(COUNT());
      pm.log(getX());
      return (int) count.getValue();
      `
    },
    {
      // NOTE: replace all the quorum logic with a plug in quorum strategy
      documentation: `Nodes are organized by groups or buckets. Updates are writting to each member of a bucket.  Quorum is quorum of a group or bucket.`,
      name: 'nodeQuorum',
      class: 'Int',
      javaFactory: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getNodeQuorum");
      int quorum = (int) Math.floor((getNodeCount() / getNodeGroups()) / 2) + 1;
      // getLogger().info("nodeQuorum", "nodes", getNodeCount(), "buckets", getNodeGroups(), "quorum", quorum);
      pm.log(getX());
      return quorum;
      `
    },
    {
      documentation: 'Mediators to broadcast to. See ClusterConfigStatusDAO',
      name: 'broadcastMediators',
      class: 'FObjectArray',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getBroascastMediators");
      ClusterConfig myConfig = getConfig(getX(), getConfigId());
      long zone = myConfig.getZone() + 1;
      if ( myConfig.getType() == MedusaType.NODE ) {
        zone = myConfig.getZone();
      }
      // getLogger().debug("broadcastMediators", "zone", zone);
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, zone),
            OR(
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.TYPE, MedusaType.NERF)
            ),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
        .select(new ArraySink())).getArray();
      ClusterConfig[] configs = new ClusterConfig[arr.size()];
      arr.toArray(configs);
      pm.log(getX());
      return configs;
      `
    },
    {
      documentation: 'Mediators to broadcast to',
      name: 'sfBroadcastMediators',
      class: 'FObjectArray',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getSfBroascastMediators");
      ClusterConfig myConfig = getConfig(getX(), getConfigId());

      if ( myConfig.getType() == MedusaType.NODE ) return new ClusterConfig[0];

      long zone = myConfig.getZone();
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            OR(
              EQ(ClusterConfig.ZONE, zone),
              EQ(ClusterConfig.ZONE, zone+1)
            ),
            OR(
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.TYPE, MedusaType.NERF)
            ),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
        .select(new ArraySink())).getArray();
      ClusterConfig[] configs = new ClusterConfig[arr.size()];
      arr.toArray(configs);
      pm.log(getX());
      return configs;
      `
    },
    {
      documetation: 'Single Index Recovery. A faulty system fallback to deal with system failure and potential data loss. If we find we only have 1 copy of an index, this allows us to instruct the consensus engine to promote the index.',
      name: 'sir',
      class: 'List',
      of: 'Long',
      javaFactory: 'return new ArrayList<Long>();'
    }
  ],

  methods: [
    {
      documentation: 'Any active region in realm.',
      name: 'getActiveRegion',
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getActiveRegion");
      ClusterConfig config = getConfig(getX(), getConfigId());
      DAO clusterConfigDAO = (DAO) getX().get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
            EQ(ClusterConfig.REALM, config.getRealm()),
            OR(
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.TYPE, MedusaType.NERF)
            ),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        // send to outermost zone.
        .orderBy(foam.mlang.MLang.DESC(ClusterConfig.ZONE))
//        .orderBy(ClusterConfig.IS_PRIMARY)
        .select(new ArraySink())).getArray();
      pm.log(getX());
      if ( configs.size() > 0 ) {
        // TODO: random or round-robin.
        // Ordered by IS_PRIMARY if any are.
        return configs.get(0);
      } else {
        throw new RuntimeException("Active Region not found.");
      }
      `
    },
    {
      documentation: 'Primary Mediators in Non-Active Regions to broadcast to. See ClusterConfigStatusDAO',
      name: 'getBroadcastNARegionMediators',
      type: 'foam.nanos.medusa.ClusterConfig[]',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getBroascastNAMediators");
      ClusterConfig myConfig = getConfig(getX(), getConfigId());
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.IS_PRIMARY, true),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            NEQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.STANDBY),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
        .select(new ArraySink())).getArray();
      ClusterConfig[] configs = new ClusterConfig[arr.size()];
      arr.toArray(configs);
      pm.log(getX());
      return configs;
      `
    },
    {
      documentation: 'see ClusterConfigSupportDAO',
      name: 'getMediatorCount',
      type: 'Integer',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getMediatorCount");
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, Math.max(0, config.getZone() -1)),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ))
        .select(COUNT());
      // getLogger().debug("mediatorCount", ((Long)count.getValue()).intValue());
      pm.log(getX());
      return ((Long)count.getValue()).intValue();
      `
    },
    {
      name: 'getMediatorQuorum',
      type: 'Integer',
      javaCode: `
      return (int) Math.floor(getMediatorCount() / 2) + 1;
      `
    },
    {
      documentation: 'Are at least half+1 of the expected mediators in zone 0 online?',
      name: 'getHasMediatorQuorum',
      type: 'Boolean',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getHasMediatorQuorum");
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ))
        .select(COUNT());
      boolean result = ((Long)count.getValue()).intValue() >= getMediatorQuorum();
      getLogger().info("hasMediatorQuorum", "count", ((Long)count.getValue()).intValue(), "quorum", getMediatorQuorum(), result);
      pm.log(getX());
      return result;
      `
    },
    {
      documentation: 'Any active region in realm.',
      name: 'getNextZone',
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getNextZone");
      ClusterConfig config = getConfig(getX(), getConfigId());
      long zone = config.getZone();
      while ( zone > 0 ) {
        zone -= 1;
        DAO dao = (DAO) getX().get("clusterConfigDAO");
        dao = dao
          .where(
            AND(
              EQ(ClusterConfig.ENABLED, true),
              EQ(ClusterConfig.REALM, config.getRealm()),
              EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
              EQ(ClusterConfig.STATUS, Status.ONLINE),
              OR(
                EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
                EQ(ClusterConfig.TYPE, MedusaType.NERF)
              ),
              EQ(ClusterConfig.ZONE, zone)
            ));
        if ( zone == 0 ) {
          dao = dao.orderBy(foam.mlang.MLang.DESC(ClusterConfig.IS_PRIMARY));
        }
        List<ClusterConfig> configs = ((ArraySink) dao.select(new ArraySink())).getArray();
        if ( configs.size() > 0 ) {
          ClusterConfig cfg = configs.get(0);
          getLogger().info("nextZone", "configs", configs.size(), "selected", cfg.getId(), cfg.getZone(), cfg.getIsPrimary());
          for ( ClusterConfig c : configs ) {
            getLogger().info("nextZone", "other", c.getId(), c.getZone(), c.getIsPrimary());
          }
          pm.log(getX());
          return cfg;
        }
      }
      pm.error(getX());
      throw new RuntimeException("Next Zone not found.");
      `
    },
    {
      documentation: 'determine the next server to route request to.',
      name: 'getNextServer',
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      ClusterConfig config = getConfig(getX(), getConfigId());

      // standby region -> active region
      if ( config.getRegionStatus() != RegionStatus.ACTIVE ) {
        return getActiveRegion();
      }

      // active region, zone # -> zone # -1 (primary if known)
      if ( config.getZone() > 0 ) {
        return getNextZone();
      }

      // route to primary
      try {
        return getPrimary(getX());
      } catch ( RuntimeException t ) {
        // if in standalone mode, just route to self if only one mediator enabled.
        if ( getStandAlone() ) {
          getLogger().debug("nextServer", t.getMessage(), "fallback to StandAlone");
          return config;
        }
        throw t;
      }
      `
    },
    {
      name: 'getNodeRedundancy',
      type: 'Integer',
      javaCode: `
      int c = getNodeCount();
      if ( c < 3 ) return 0; // size 2 test cluster - sacrifice HA
      if ( c < 6 ) return 1; 
      if ( c < 12 ) return 2; // 6 -> 2 buckets of 3, 9 -> 3 buckets of 3
      return 3;
      `
    },
    // {
    //   // NOTE: replace all the quorum logic with a plug in quorum strategy
    //   documentation: `Nodes are organized by groups or buckets. Updates are writting to each member of a bucket.  Quorum is quorum of a group or bucket.`,
    //   name: 'getNodeQuorum',
    //   type: 'Integer',
    //   javaCode: `
    //   PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getNodeQuorum");
    //   int quorum = (int) Math.floor((getNodeCount() / getNodeGroups()) / 2) + 1;
    //   // getLogger().info("nodeQuorum", "nodes", getNodeCount(), "buckets", getNodeGroups(), "quorum", quorum);
    //   pm.log(getX());
    //   return quorum;
    //   `
    // },
    {
      documentation: `Nodes are organized by groups or buckets. Updates are writting to each member of a bucket.  Quorum is quorum of a group or bucket.`,
      name: 'getNodeGroups',
      type: 'Integer',
      javaCode: `
      int c = getNodeCount();
      int bucketSize = 1 + getNodeRedundancy();
      int groups = (int) Math.max(1, Math.floor( c / (double) bucketSize ));
      return groups;
      `
    },
    // {
    //   name: 'getNodeCount',
    //   type: 'Integer',
    //   javaCode: `
    //   PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getNodeCount");
    //   ClusterConfig config = getConfig(getX(), getConfigId());
    //   Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
    //     .where(
    //       AND(
    //         EQ(ClusterConfig.ZONE, 0L),
    //         EQ(ClusterConfig.REALM, config.getRealm()),
    //         EQ(ClusterConfig.REGION, config.getRegion()),
    //         EQ(ClusterConfig.TYPE, MedusaType.NODE),
    //         EQ(ClusterConfig.ENABLED, true),
    //         EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW)
    //       ))
    //     .select(COUNT());
    //   pm.log(getX());
    //   return (int) count.getValue();
    //   `
    // },
    {
      documentation: 'Are sufficient nodes enabled and online? Require a quorum count of buckets and a quorum count of nodes in each bucket',
      name: 'getHasNodeQuorum',
      type: 'Boolean',
      javaCode: `
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), "getHasNodeQuorum");
      ClusterConfig myConfig = getConfig(getX(), getConfigId());
      if ( myConfig.getType() == MedusaType.NODE ) {
        return true;
      }

      int minNodesInBucket = getNodeQuorum();

      List<Set<String>> buckets = getNodeBuckets();
      for ( int i = 0; i < buckets.size(); i++ ) {
        Set<String> bucket = buckets.get(i);
        // Need at least minNodesInBucket in ONLINE state for Quorum.
        int online = 0;
        for ( String id : bucket ) {
          ClusterConfig config = getConfig(getX(), id);
          if ( config.getStatus() == Status.ONLINE ) {
            online += 1;
          }
        }
        if ( online < minNodesInBucket ) {
           getLogger().warning("hasNodeQuorum", "false", "insufficient ONLINE nodes in bucket", i, "size", bucket.size(), "online", online, "threshold", minNodesInBucket);
          outputBuckets(getX());
          pm.log(getX());
          return false;
        }
      }
      getLogger().debug("hasNodeQuorum", "true");
      pm.log(getX());
      return true;
      `
    },
    {
      name: 'getReplayNodes',
      type: 'List',
      javaCode: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      return (ArrayList) ((ArraySink) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion()),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(new ArraySink())).getArray();
      `
    },
    {
      name: 'getSocketClientBox',
      type: 'SocketClientBox',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        },
        {
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getSocketClientBox");
      try {
        if ( receiveClusterConfig.getId() == getConfigId() ) {
          throw new RuntimeException("SocketClientBox to self");
        }
        String address = receiveClusterConfig.getId();
        DAO hostDAO = (DAO) x.get("hostDAO");
        Host host = (Host) hostDAO.find(address);
        if ( host != null ) {
          address = host.getAddress();
        }
        int port = receiveClusterConfig.getPort();
        if ( port == 0 ) {
          port = foam.net.Port.get(x, "SocketServer");
        }

        SocketClientBox clientBox = new SocketClientBox();
        clientBox.setX(x);
        clientBox.setHost(address);
        clientBox.setPort(port);
        clientBox.setServiceName(serviceName);
        // getLogger().debug("getSocketClientBox", serviceName, clientBox);
        return clientBox;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'getPrimaryDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      return getClientDAO(x, serviceName, getConfig(x, getConfigId()), getPrimary(x));
      `
    },
    {
      name: 'getPrimary',
      args: 'Context x',
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getPrimaryDAO");
      try {
      ClusterConfig primaryConfig = null;
      DAO clusterConfigDAO = (DAO) x.get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.IS_PRIMARY, true),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(new ArraySink())).getArray();
      if ( configs.size() > 0 ) {
        primaryConfig = configs.get(0);
        if ( configs.size() > 1 ) {
          getLogger().error("muliple primaries", configs.get(0).getId(), configs.get(1).getId());
          for ( ClusterConfig cfg : configs ) {
            getLogger().error("mulitiple primaries", cfg);
          }
          throw new MultiplePrimariesException();
        }
        return primaryConfig;
      } else {
        throw new PrimaryNotFoundException();
      }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'getConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getConfig");
      try {
        ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(id);
        if ( config != null ) {
          return (ClusterConfig) config.fclone();
        }
        getLogger().error("ClusterConfig not found:", id);
        throw new RuntimeException("ClusterConfig not found: "+id);
      } finally {
        pm.log(x);
      }
     `
    },
    {
      name: 'getVoters',
      args: 'Context x',
      javaType: `java.util.List`,
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getVoters");
      try {
      ClusterConfig config = getConfig(x, getConfigId());
      List arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          )
        )
        .select(new ArraySink())).getArray();
      return arr;
      } finally {
        pm.log(x);
      }
     `
    },
    {
      documentation: 'Mediator is a potential voter - depending on eventual status.',
      name: 'canVote',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ],
      javaCode: `
      ClusterConfig myConfig = getConfig(x, getConfigId());
      return
        config.getEnabled() &&
        config.getType() == MedusaType.MEDIATOR &&
        config.getZone() == 0L &&
        config.getRegion().equals(myConfig.getRegion());
      `
    },
    {
      documentation: 'Are at least half+1 of the expected instances online?',
      name: 'hasQuorum',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      return getHasNodeQuorum() &&
             getHasMediatorQuorum() &&
             ! ((ReplayingInfo) x.get("replayingInfo")).getReplaying();
      `
    },
    {
      name: 'getClientDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String',
        },
        {
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'ClusterConfig'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getClientDAO");
      try {
        String sessionId = sendClusterConfig.getSessionId();
        Session session = (Session) x.get("session");
        if ( session != null ) {
          sessionId = session.getId();
        }
        return new ClientDAO.Builder(x)
          .setOf(MedusaEntry.getOwnClassInfo())
          .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sessionId)
          .setDelegate(getSocketClientBox(x, serviceName, sendClusterConfig, receiveClusterConfig))
          .build())
          .build();
      } finally {
        pm.log(x);
      }
      `
    },
   {
      documentation: 'Notification client is send and forget, does not register a reply box.',
      name: 'getBroadcastClientDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String',
        },
        {
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'ClusterConfig'
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getBroadcastClientDAO");
      try {
        String sessionId = sendClusterConfig.getSessionId();
        Session session = (Session) x.get("session");
        if ( session != null ) {
          sessionId = session.getId();
        }
        return new NotificationClientDAO.Builder(x)
          .setOf(MedusaEntry.getOwnClassInfo())
          .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sessionId)
          .setDelegate(getSocketClientBox(x, serviceName, sendClusterConfig, receiveClusterConfig))
          .build())
        .build();
      } finally {
        pm.log(x);
      }
      `
    },
    {
      documentation: `
        Returns true if the cron job should be enabled. Returns false otherwise.
        Note that clusterable cron jobs should only run on the primary mediator.
      `,
      name: 'cronEnabled',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'clusterable',
          type: 'boolean',
          documentation: 'true if the cron job is clusterable'
        }
      ],
      javaCode: `
      try {
        ClusterConfig config = getConfig(x, getConfigId());
        if ( config == null ) {
          return true;
        }
        
        if ( config.getType() == MedusaType.MEDIATOR ) {
          ElectoralService electoral = (ElectoralService) x.get("electoralService");
          // System must be ready before running cron jobs
          if ( electoral.getState() != ElectoralServiceState.IN_SESSION ) {
            return false;
          }
        
          // Non-clusterable cron jobs can run if the system is ready
          if ( ! clusterable ) {
            return true;
          }

          // Clusterable cron jobs should only run on the primary mediator
          if ( getMediatorCount() == 1 ) {
            return true;
          }
          if ( config.getIsPrimary() &&
               config.getStatus() == Status.ONLINE &&
               config.getRegionStatus() == RegionStatus.ACTIVE &&
               config.getZone() == 0L ) {
            return true;
          }
          return false;
        }

        if ( config.getType() == MedusaType.NODE ) {
          return false;
        }
        if ( config.getType() == MedusaType.NERF ) {
          return false;
        }
      } catch (Throwable t) {
        // ignore, thrown when no config found.
      }
      return true;
     `
    },
    {
      documentation: 'test if system is replaying',
      name: 'isReplaying',
      args: 'Context x',
      type: 'Boolean',
      javaCode: `
      return ((ReplayingInfo) x.get("replayingInfo")).getReplaying();
      `
    },
    {
      documentation: `Decorate the root serviceDAO to 'cluster' serviceDAO updates`,
      name: 'clusterServiceDAO',
      args: 'Context x, foam.dao.DAO delegate',
      type: 'foam.dao.DAO',
      javaCode: `
      return new foam.nanos.medusa.MedusaAdapterDAO.Builder(x)
        .setNSpec(new foam.nanos.boot.NSpec.Builder(x).setName("nSpecDAO").build())
        .setDelegate(delegate)
        .build();
      `
    },
    {
      name: 'getMdao',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      // getLogger().debug("mdao", serviceName);
      Object obj = getMdaos().get(serviceName);
      DAO dao;
// REVIEW: periodically the result returned from get is a Map.
//      DAO dao = (DAO) getMdaos().get(serviceName);
//      if ( dao != null ) {
      if ( obj != null &&
           obj instanceof DAO ) {
        dao = (DAO) obj;

        // getLogger().debug("mdao", "cache", serviceName);
        return dao;
      }
      String key = serviceName;
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getMdao");
      try {
        if ( obj != null &&
             ! ( obj instanceof DAO ) ) {
          getLogger().error("getMdao" ,serviceName, "not instance of dao", obj.getClass().getSimpleName());
        }
        dao = (DAO) x.get(serviceName);
        // look for 'bare' and 'local' versions first
        if ( ! key.startsWith("bare") ) {
          key = "bare" + serviceName.substring(0,1).toUpperCase()+serviceName.substring(1);
          if ( x.get(key) != null ) {
            dao = (DAO) x.get(key);
            getLogger().debug("mdao", "bare", serviceName, key);
          }
        } else if ( ! key.startsWith("local") ) {
          key = "local" + serviceName.substring(0,1).toUpperCase()+serviceName.substring(1);
          if ( x.get(key) != null ) {
            dao = (DAO) x.get(key);
            getLogger().debug("mdao", "local", serviceName, key);
          }
        }
        if ( dao != null ) {
          Object result = dao.cmd(DAO.LAST_CMD);
          if ( result != null &&
               result instanceof DAO ) {
            dao = (DAO) result;
            getMdaos().put(serviceName, dao);
            getLogger().debug("mdao", "found", serviceName, dao.getClass().getSimpleName(), dao.getOf().getId());
            return dao;
          }
        }
        getLogger().error("mdao", serviceName, key, "not found");
      } catch (Throwable t) {
        getLogger().error("mdao", serviceName, key, t.getMessage(), t);
      } finally {
        pm.log(x);
      }
      throw new IllegalArgumentException("MDAO not found: "+serviceName);
      `
    },
    {
      name: 'outputBuckets',
      args: 'Context x',
      javaCode: `
      List<Set<String>> buckets = getNodeBuckets();
      for ( int i = 0; i < buckets.size(); i++ ) {
        Set<String> bucket = buckets.get(i);
        if ( bucket.size() == 0 ) {
          getLogger().info("bucket", i, "empty");
        } else {
          for ( String id : bucket ) {
            ClusterConfig node = getConfig(x, id);
            getLogger().info("bucket", i, id, node.getStatus());
          }
        }
      }
      `
    }
  ]
});
