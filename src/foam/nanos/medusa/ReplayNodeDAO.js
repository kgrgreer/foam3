/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayNodeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Response to ReplayCmd on Node`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Journal',
    'foam.dao.ProxyDAO',
    'foam.dao.NullDAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LTE',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      value: 12
    },
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
    {
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayDetailsCmd ) {
        ReplayDetailsCmd details = (ReplayDetailsCmd) obj;
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        details.setMinIndex(info.getMinIndex());
        details.setMaxIndex(info.getMaxIndex());
        details.setCount(info.getCount());

        ((Logger) x.get("logger")).info(this.getClass().getSimpleName(), "cmd", "ReplayDetailsCmd", "requester", details.getRequester(), "min", details.getMinIndex(), "max", details.getMaxIndex(), "count", details.getCount());

        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        Logger logger = Loggers.logger(x, this, "cmd", "ReplayCmd");
        ReplayCmd cmd = (ReplayCmd) obj;
        ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails();
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        long indexAtStart = info.getIndex();

        logger.info("requester", details.getRequester(), "min", details.getMinIndex(), "max", details.getMaxIndex());

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig fromConfig = support.getConfig(x, support.getConfigId());
        ClusterConfig toConfig = support.getConfig(x, details.getRequester());
        if ( details.getMinIndex() <= info.getMaxIndex() ) {

          DAO clientDAO = (DAO) getClients().get(details.getRequester());
          if ( clientDAO != null ) {
            logger.info("cancel previous from", fromConfig.getId());
            // REVIEW: have replay write to null dao. How to cancel replay?
            // TODO: need the same support cache. For now expect cache to be small.
            clientDAO.cmd_(x, RetryClientSinkDAO.CANCEL_RETRY_CMD);
            ((ProxyDAO)clientDAO).setDelegate(new NullDAO(x, MedusaEntry.getOwnClassInfo()));
          }
          clientDAO = new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig));
          getClients().put(details.getRequester(), clientDAO);

          Min min = (Min) MIN(MedusaEntry.INDEX);
          Count count = new Count();
          Sequence seq = new Sequence.Builder(x)
            .setArgs(new Sink[] {count, min})
            .build();

          // cache - mdao (cache, fixed size, last x received)
          // this includes storageTransient entries
          DAO cache = (DAO) x.get("medusaNodeDAO");
          cache.select(seq);

          Predicate p = GTE(MedusaEntry.INDEX, details.getMinIndex());
          if ( details.getMaxIndex() > 0 ) {
            p = AND(
                   p,
                   LTE(MedusaEntry.INDEX, details.getMaxIndex())
                );
          }

          if ( ((Long) count.getValue()) > 0 &&
               min.getValue() != null &&
               details.getMinIndex() >= (Long) min.getValue() ) {
            cache.where(p).select(new SetNodeSink(x, new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig))));
          } else {
            getJournal().replay(x, new MedusaSetNodeDAO(x, clientDAO).where(p));
            cache.where(p).select(new SetNodeSink(x, new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig))));
          }
        } else {
          logger.info("requester", cmd.getDetails().getRequester(), "requested min", cmd.getDetails().getMinIndex(), "greater than local max", info.getMaxIndex());
        }
        return cmd;
      }

      if ( obj instanceof foam.mlang.sink.Max ) {
        Max max = (Max) getDelegate().select((Max) obj);
        if ( max != null ) {
          ((Logger) x.get("logger")).info(this.getClass().getSimpleName(), "cmd", "Max", "response", max.getValue());
        }
        return max;
      }

      obj = getJournal().cmd(x, obj);

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
