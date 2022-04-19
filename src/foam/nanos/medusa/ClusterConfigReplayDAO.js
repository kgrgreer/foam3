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
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
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

        getLogger().info(nu.getName(), old.getStatus(), "->", nu.getStatus());

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
          // clientDAO = new RetryClientSinkDAO.Builder(x)
          //   .setName(serviceName)
          //   .setDelegate(clientDAO)
          //   .setMaxRetryAttempts(support.getMaxRetryAttempts())
          //   .setMaxRetryDelay(support.getMaxRetryDelay())
          //   .build();

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
          getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "request");
          details = (ReplayDetailsCmd) clientDAO.cmd_(x, details);
          getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "response", details);

          synchronized ( this ) {
            DaggerService dagger = (DaggerService) x.get("daggerService");
            ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
            if ( replaying.getReplaying() ) {
            replaying.getReplayNodes().put(details.getResponder(), details);

              if ( replaying.getStartTime() == null ) {
                replaying.setStartTime(new java.util.Date());
                replaying.updateIndex(x, dagger.getGlobalIndex(x));
              }
              if ( details.getMaxIndex() > dagger.getGlobalIndex(x)) {
                dagger.setGlobalIndex(x, details.getMaxIndex());
              }

              if ( details.getMaxIndex() > replaying.getReplayIndex() ) {
                replaying.setReplayIndex(details.getMaxIndex());
              }

              // Detect baseline - no data.
              // Have to check almost all nodes.
              int online = 0;
              List<ClusterConfig> nodes = support.getReplayNodes();
              for ( ClusterConfig cfg : nodes ) {
                if ( cfg.getStatus() == Status.ONLINE ) online++;
              }
              getLogger().debug("test for baseline", "online", online, "nodes", ( nodes.size() - ( support.getNodeQuorum() - 1 ) ), "index", replaying.getIndex(), "replayingIndex", replaying.getReplayIndex());
              if ( online >= ( nodes.size() - ( support.getNodeQuorum() - 1 ) ) ) {
                // found enough online nodes, now test if all reporting zero index.
                if ( replaying.getIndex() >= replaying.getReplayIndex() &&
                   ( myConfig.getType() == MedusaType.MEDIATOR &&
                     support.getHasNodeQuorum() ) ||
                   ( myConfig.getType() == MedusaType.NERF &&
                     support.getHasMediatorQuorum() ) ) {
                  getLogger().info("baseline dectected");
                  ((DAO) x.get("medusaEntryMediatorDAO")).cmd(new ReplayCompleteCmd());
                }
              }
            }
          }

          if ( details.getMaxIndex() >= minIndex ) {
            ReplayCmd cmd = new ReplayCmd();
            details = (ReplayDetailsCmd) details.fclone();
            details.setMinIndex(minIndex);
            cmd.setDetails(details);
            cmd.setServiceName("medusaMediatorDAO"); // TODO: configuration

            getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "request", cmd.getDetails());
            cmd = (ReplayCmd) clientDAO.cmd_(x, cmd);
            getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "response");
          }
        }
      }
      return nu;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayRequestCmd ) {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
        ReplayRequestCmd cmd = (ReplayRequestCmd) obj;

        getLogger().info("ReplayRequestCmd", "min", cmd.getDetails().getMinIndex());

        java.util.List<ClusterConfig> nodes = support.getReplayNodes();
        for ( ClusterConfig cfg : nodes ) {
          ReplayCmd c = new ReplayCmd();
          ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails().fclone();
          details.setRequester(myConfig.getId());
          details.setResponder(cfg.getId());
          c.setDetails(details);

          DAO clientDAO = support.getClientDAO(x, "medusaEntryDAO", myConfig, cfg);
          // clientDAO = new RetryClientSinkDAO.Builder(x)
          //   .setName("medusaEntryDAO")
          //   .setDelegate(clientDAO)
          //   .setMaxRetryAttempts(support.getMaxRetryAttempts())
          //   .setMaxRetryDelay(support.getMaxRetryDelay())
          //   .build();
          clientDAO.cmd_(x, c);
        }
        return obj;
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
