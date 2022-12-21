/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RenouncePrimaryDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.core.ContextAgent'
  ],

  documentation: `If this mediator was primary and is now going offline, set electoral state to DISSOLUTION and wait until in-flight broadcast are complete before calling election.`,

  // trigger Primary and ONLINE -> OFFLINE
  // block
  // drain
  // election DISMISS

  javaImports: [
    'foam.core.Agency',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.*',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set'
  ],

  constants: [
    {
      name: 'ALARM_NAME',
      type: 'String',
      value: 'Medusa Primary Rennounce'
    }
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaEntryMediatorDAO'
    },
    {
      documentation: 'Delay in milliseconds between testing for primary drain',
      name: 'pollingInterval',
      class: 'Long',
      units: 'ms',
      value: 1000
    },
    {
      documentation: 'Maximum time in milliseconds to wait for primary to drain',
      name: 'maxWaitTime',
      class: 'Long',
      units: 'ms',
      value: 60000
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");

      // Primary ONLINE -> OFFLINE
      if ( nu.getId() == myConfig.getId() &&
           nu.getStatus() == Status.OFFLINE &&
           nu.getIsPrimary() &&
           old.getStatus() == Status.ONLINE &&
           old.getIsPrimary() &&
           electoralService.getState() == ElectoralServiceState.IN_SESSION ) {

        ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, ALARM_NAME, null, LogLevel.WARN, null));

        // block - see ReplayingDAO - will block on OFFLINE and Primary
        // replaying.setIsReplaying(true);

        // wait for primary to drain, then call election
        DAO dao = (DAO) x.get(getServiceName());
        long startTime = System.currentTimeMillis();
        while ( System.currentTimeMillis() - startTime < getMaxWaitTime() ) {
          try {
            Thread.currentThread().sleep(getPollingInterval());
          } catch (InterruptedException e) {
            break;
          }
          long blocked = 0L;
          Object blockedReply = dao.cmd(BlockingDAO.BLOCKED_CMD);
          if ( blockedReply != null &&
               blockedReply instanceof Long ) {
            blocked = ((Long) blockedReply).longValue();
          }
          Object inFlightReply = dao.cmd(MedusaBroadcast2NodesDAO.IN_FLIGHT_CMD);
          if ( inFlightReply != null &&
               inFlightReply instanceof Long ) {
            Long inFlight = (Long) inFlightReply;
            logger.info("in-flight", inFlight, "blocked", blocked, "wait", getMaxWaitTime() - (System.currentTimeMillis() - startTime));
            if ( inFlight == 0 ) {
              break;
            }
          } else {
            logger.warning("in-flight", "request", "returned", inFlightReply);
            break;
          }
        }
        // Primary drained, relinquish designation
        nu = (ClusterConfig) support.getConfig(x, nu.getId());
        nu.setIsPrimary(false);
        nu = (ClusterConfig) getDelegate().put_(x, nu);

        electoralService.dissolve(x);

        // unblock - ReplayingDAO will unblock when OFFLINE and not primary
        // replaying.setIsReplaying(false);

        ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, ALARM_NAME));

        if ( support.getShutdown() ) {
          Agency agency = (Agency) x.get(support.getThreadPoolName());
          agency.schedule(x, this, this.getClass().getSimpleName(), 30000);
          logger.warning("shutdown","scheduled", "30s");
        }
      }
      return nu;
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Loggers.logger(x, this).warning("shutdown","exit");
      System.exit(0);
      `
    }
  ]
});
