/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: `Monitor the ClusterConfig status and on mediator quorum change, call election, and on node quorum change, re-bucket nodes.`,

  javaImports: [
    'foam.core.AgencyTimerTask',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 10000
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      Boolean hadQuorum = support.hasQuorum(x);
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      // if ( support.getStandAlone() ) {
      //   return nu;
      // }

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           ( support.canVote(x, nu) ||
             support.canVote(x, myConfig) ) ) {

        logger.info(nu.getName(), old.getStatus(), "->", nu.getStatus());

            Boolean hasQuorum = support.hasQuorum(x);
            if ( electoralService.getState() == ElectoralServiceState.IN_SESSION ||
                 electoralService.getState() == ElectoralServiceState.DISMISSED ) {
              if ( hadQuorum && ! hasQuorum) {
                logger.warning("mediator quorum lost");
                electoralService.dissolve(x);
              } else if ( ! hadQuorum && hasQuorum ) {
                logger.warning("mediator quorum acquired");
                electoralService.dissolve(x);
              } else if ( hasQuorum ) {
                try {
                  support.getPrimary(x);
                  if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ) {
                    // When cluster has quorum, the last mediator may not be in-session.
                    electoralService.register(x, myConfig.getId());
                  }
                } catch ( RuntimeException e ) {
                  // no primary
                  electoralService.dissolve(x);
                }
              }
            }
      }

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           ( ( myConfig.getType() == MedusaType.MEDIATOR &&
               myConfig.getZone() == 0 ) /*||
             ( myConfig.getType() == MedusaType.NERF &&
               myConfig.getZone() > 0 ) ) */ &&
           nu.getType() == MedusaType.NODE ) ) {
        bucketNodes(x);
      }

      return nu;
      `
    },
    {
      documentation: 'Assign nodes to buckets.',
      synchronized: true,
      name: 'bucketNodes',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      List<ClusterConfig> nodes = ((ArraySink)((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          ))
        .select(new ArraySink())).getArray();
      ArrayList<Set> buckets = new ArrayList();
      int group = 0;
      int groups = support.getNodeGroups();
      for ( ClusterConfig node : nodes ) {
        int index = group % groups;
        group = (group + 1) % groups;
        if ( node.getBucket() > 0 ) {
          index = node.getBucket() -1;
        }
        if ( index >= buckets.size() ) {
          // create buckets for known gaps
          for ( int i = buckets.size(); i <= index; i++ ) {
            buckets.add(new HashSet());
          }
        }
        Set bucket = (Set) buckets.get(index);
        bucket.add(node.getId());
      }
      support.setNodeBuckets(buckets);
      support.outputBuckets(x);
      `
    },
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.schedule(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(), getTimerInterval());
      `
    },
    {
      documentation: 'Check for multiple primaries.  Can occur when the primary is issolated, the others vote, then the primary comes back - and was unaware that it was issolated.',
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config.getIsPrimary() &&
           config.getStatus() == Status.ONLINE ) {
        try {
          support.getPrimary(x);
        } catch (MultiplePrimariesException e) {
          Loggers.logger(x, this).warning("Multiple Primaries detected");
          config = (ClusterConfig) config.fclone();
          config.setStatus(Status.OFFLINE);
          ((DAO) x.get("localClusterConfigDAO")).put(config);
          // ElectoralService electoralService = (ElectoralService) x.get("electoralService");
          // electoralService.dissolve(x);
        } catch (PrimaryNotFoundException e) {
          // should have found self!
          Loggers.logger(x, this).warning("Unexpected exception", e);
        }
      }
      `
    }
  ]
});
