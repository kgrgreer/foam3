/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On status change to ONLINE initiate replay, in Active Region.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.OR',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "put");
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           nu.getStatus() == Status.ONLINE &&
           nu.getRealm().equals(myConfig.getRealm()) &&
           nu.getRegion().equals(myConfig.getRegion()) ) {

        logger.info(nu.getName(), old.getStatus(), "->", nu.getStatus());

        ClusterConfig config = nu;

        // replay from NODE to zone and zone + 1
        if (
            ( config.getType() == MedusaType.NODE &&
              ( ( myConfig.getType() == MedusaType.MEDIATOR &&
                  config.getZone() == myConfig.getZone() ) ||
                ( myConfig.getType() == MedusaType.NERF &&
                  ( config.getZone() == myConfig.getZone() ||
                    config.getZone() == myConfig.getZone() -1 ) ) ) ) ||

              // replay from MEDIATOR to get Bootstrap indexes
            ( config.getType() == MedusaType.MEDIATOR &&
              myConfig.getType() == MedusaType.NERF &&
              config.getZone() == myConfig.getZone() -1 )
          ) {
          String serviceName = "medusaNodeDAO";
          if ( config.getType() == MedusaType.MEDIATOR ||
               config.getType() == MedusaType.NERF ) {
            serviceName = "medusaEntryDAO";
          }
          DAO clientDAO = support.getClientDAO(x, serviceName, myConfig, config);

          // NOTE: using internalMedusaDAO else we'll block on ReplayingDAO.
          DAO dao = (DAO) x.get("internalMedusaDAO");
          dao = dao.where(EQ(MedusaEntry.PROMOTED, false));
          Min min = (Min) dao.select(MIN(MedusaEntry.INDEX));
          Long minIndex = 0L;
          ReplayDetailsCmd details = new ReplayDetailsCmd();
          details.setRequester(myConfig.getId());
          details.setResponder(config.getId());
          if ( min != null &&
               min.getValue() != null ) {
            details.setMinIndex((Long) min.getValue());
            minIndex = details.getMinIndex();
          }
          logger.info("ReplayDetailsCmd", "request", details);
          details = (ReplayDetailsCmd) clientDAO.cmd_(x, details);
          logger.info("ReplayDetailsCmd", "response", details);


          DaggerService dagger = (DaggerService) x.get("daggerService");
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          if ( replaying.getReplaying() ) {
            replaying.getReplayDetails().put(config.getId(), details);

            if ( replaying.getStartTime() == null ) {
              replaying.setStartTime(new java.util.Date());
              replaying.updateIndex(x, dagger.getGlobalIndex(x));
              ((foam.nanos.om.OMLogger) x.get("OMLogger")).log("medusa.replay.start");
            }
            if ( details.getMaxIndex() > dagger.getGlobalIndex(x)) {
              dagger.setGlobalIndex(x, details.getMaxIndex());
            }

            synchronized ( this ) {

              if ( details.getMaxIndex() > replaying.getReplayIndex() ) {
                replaying.setReplayIndex(details.getMaxIndex());
              }

              if ( replaying.getMaxIndex() > 0 ) {
                replaying.setMaxIndex(Math.max(details.getMaxIndex(), replaying.getMaxIndex()));
              } else {
                replaying.setMaxIndex(details.getMaxIndex());
              }

              if ( replaying.getMinIndex() > 0 ) {
                replaying.setMinIndex(Math.min(details.getMinIndex(), replaying.getMinIndex()));
              } else {
                replaying.setMinIndex(details.getMinIndex());
              }

              Long replayed = 0L;
              for ( Object o : replaying.getReplayDetails().values() ) {
                ReplayDetailsCmd detail = (ReplayDetailsCmd) o;
                replayed += detail.getCount();
              }
              replaying.setCount(replayed);
            }

            // Detect baseline - no data.
            // Have to check almost all nodes.
            int online = 0;
            List<ClusterConfig> nodes = support.getReplayNodes();
            for ( ClusterConfig cfg : nodes ) {
              if ( cfg.getStatus() == Status.ONLINE ) online++;
            }
            logger.debug("test for baseline", "online", online, "nodes", ( nodes.size() - ( support.getNodeQuorum() - 1 ) ), "index", replaying.getIndex(), "replayingIndex", replaying.getReplayIndex());
            if ( online >= ( nodes.size() - ( support.getNodeQuorum() - 1 ) ) ) {
              // found enough online nodes, now test if all reporting zero index.
              if ( replaying.getIndex() >= replaying.getReplayIndex() &&
                 ( myConfig.getType() == MedusaType.MEDIATOR &&
                   support.getHasNodeQuorum() ) ||
                 ( myConfig.getType() == MedusaType.NERF &&
                   support.getHasMediatorQuorum() ) ) {
                logger.info("baseline dectected");
                replaying.updateIndex(x, dagger.getGlobalIndex(x));
                replaying.setReplayIndex(replaying.getIndex());
                ((DAO) x.get("medusaEntryMediatorDAO")).cmd(new ReplayCompleteCmd());
              }
            }
          }

          if ( details.getMaxIndex() >= minIndex ) {
            ReplayCmd cmd = new ReplayCmd();
            details = (ReplayDetailsCmd) details.fclone();
            cmd.setDetails(details);
            cmd.setServiceName("medusaMediatorDAO"); // TODO: configuration

            logger.info("ReplayCmd", "request", cmd.getDetails());
            cmd = (ReplayCmd) clientDAO.cmd_(x, cmd);
            logger.info("ReplayCmd", "response", cmd.getDetails());
          }
        }
      }
      return nu;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      final Logger logger = Loggers.logger(x, this, "cmd");
      if ( obj instanceof ReplayRequestCmd ) {
        ((OMLogger) x.get("OMLogger")).log(obj.getClass().getSimpleName());
        final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        final ReplayRequestCmd cmd = (ReplayRequestCmd) obj;

        // logger.info("ReplayRequestCmd", cmd.getDetails());

        final List<ClusterConfig> nodes = support.getReplayNodes();

        Agency agency = (Agency) x.get(support.getThreadPoolName());
        for ( ClusterConfig cfg : nodes ) {
          agency.submit(x,
            new ContextAgent() {
              public void execute(X x) {
          ReplayCmd c = new ReplayCmd();
          ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails().fclone();
          details.setRequester(myConfig.getId());
          details.setResponder(cfg.getId());
          c.setDetails(details);
          c.setServiceName("medusaMediatorDAO"); // TODO: configuration

          DAO clientDAO = support.getClientDAO(x, "medusaNodeDAO", myConfig, cfg);
          logger.info("ReplayRequestCmd", "request", c);
          c = (ReplayCmd) clientDAO.cmd_(x, c);
          logger.info("ReplayRequestCmd", "response", c);
              }
            }, this.getClass().getSimpleName()
          );
        }
        return obj;
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
