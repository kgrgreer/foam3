/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'RenouncePrimaryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `If this mediator was primary and is now going offline, set electoral state to DISSOLUTION and wait until in-flight broadcast are complete before calling election.`,

  // trigger Primary and ONLINE -> OFFLINE
  // block
  // drain
  // election DISMISS

  javaImports: [
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
    'java.util.Set'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaEntryMediatorDAO'
    },
    {
      name: 'pollingInterval',
      class: 'Long',
      value: 1000
    },
    {
      name: 'maxWaitTime',
      class: 'Long',
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
        nu = (ClusterConfig) nu.fclone();
        nu.setIsPrimary(false);
        nu = (ClusterConfig) getDelegate().put_(x, nu);

        electoralService.dissolve(x);

        // unblock - ReplayingDAO will unblock when OFFLINE and not primary
        // replaying.setIsReplaying(false);
      }
      return nu;
      `
    }
  ]
});
