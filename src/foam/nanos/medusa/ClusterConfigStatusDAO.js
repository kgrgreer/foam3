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
    'foam.mlang.sink.Count',
    'foam.nanos.alarming.Alarm',
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
    },
    {
      documentation: 'Store referent to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      Boolean hadQuorum = support.hasQuorum(x);
      nu = (ClusterConfig) getDelegate().put_(x, nu);
      support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      Boolean hasQuorum = support.hasQuorum(x);

      if ( old != null &&
           old.getStatus() != nu.getStatus() ) {
        logger.info(nu.getName(), old.getStatus(), "->", nu.getStatus(), "quorum", hadQuorum, "->", hasQuorum);

        if ( support.canVote(x, myConfig) ) {
          ElectoralService electoralService = (ElectoralService) x.get("electoralService");
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
              } catch (PrimaryNotFoundException e) {
                if ( electoralService.getState() == ElectoralServiceState.DISMISSED ) {
                  logger.warning("No Primary detected", "cycling ONLINE->OFFLINE->ONLINE");
                  myConfig = (ClusterConfig) myConfig.fclone();
                  myConfig.setStatus(Status.OFFLINE);
                  DAO dao = (DAO) x.get("localClusterConfigDAO");
                  myConfig = (ClusterConfig) dao.put(myConfig).fclone();
                  myConfig.setStatus(Status.ONLINE);
                  dao.put(myConfig);
                } else {
                  logger.warning("No Primary detected", "dissolving");
                  electoralService.dissolve(x);
                }
              } catch (MultiplePrimariesException e) {
                logger.warning("Mulitiple Primaries detected", "dissolving");
                electoralService.dissolve(x);
              }
            }
          }
        }

        if ( support.canVote(x, myConfig) ) {
          Count mediatorsActive = ((Count) ((DAO) x.get("localClusterConfigDAO"))
            .where(
              AND(
                EQ(ClusterConfig.ZONE, 0),
                EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
                EQ(ClusterConfig.ENABLED, true),
                EQ(ClusterConfig.REALM, myConfig.getRealm()),
                EQ(ClusterConfig.STATUS, Status.ONLINE),
                EQ(ClusterConfig.REGION, myConfig.getRegion())
              ))
            .select(COUNT()));

          DAO alarmDAO = (DAO) x.get("alarmDAO");
          Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, "Medusa Mediator Degradation"));
          if ( mediatorsActive.getValue() > support.getMediatorQuorum() ) {
            if ( alarm != null && alarm.getIsActive() ) {
              alarm = (Alarm) alarm.fclone();
              alarm.setIsActive(false);
              alarmDAO.put(alarm);
            }
          } else if ( nu.getStatus() == Status.OFFLINE && mediatorsActive.getValue() <= support.getMediatorQuorum() ) {
            if ( alarm == null ) {
              alarm = new Alarm.Builder(x)
                .setName("Medusa Mediator Degradation")
                .setIsActive(true)
                .setNote("Online mediators count at quorum")
                .setClusterable(false)
                .build();
            } else {
              alarm = (Alarm) alarm.fclone();
              if ( ! alarm.getIsActive() ) alarm.setIsActive(true);
            }
            alarmDAO.put(alarm);
          }
        }

        if ( myConfig.getType() == MedusaType.MEDIATOR &&
             nu.getType() == MedusaType.NODE ) {
          bucketNodes(x);
        }
      }

      return nu;
      `
    },
    {
      documentation: 'Assign nodes to buckets.',
      synchronized: true,
      name: 'bucketNodes',
      args: 'Context x',
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
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(), getTimerInterval());
      `
    },
    {
      documentation: 'Check for multiple primaries.  Can occur when the primary is issolated, the others vote, then the primary comes back - and was unaware that it was issolated.',
      name: 'execute',
      args: 'Context x',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config.getStatus() == Status.ONLINE ) {
        try {
          support.getPrimary(x);
        } catch (MultiplePrimariesException e) {
          Loggers.logger(x, this).warning("Multiple Primaries detected");
          ElectoralService electoral = (ElectoralService) x.get("electoralService");
          electoral.dissolve(x);
        } catch (PrimaryNotFoundException e) {
          if ( support.hasQuorum(x) ) {
            Loggers.logger(x, this).warning("No Primary detected");
            ElectoralService electoral = (ElectoralService) x.get("electoralService");
            electoral.dissolve(x);
          }
        }
      }
      `
    }
  ]
});
