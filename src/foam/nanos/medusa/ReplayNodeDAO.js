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
    'static foam.mlang.MLang.TRUE',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.time.Duration',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      value: 25
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
      Logger logger = Loggers.logger(x, this, "cmd", obj.getClass().getSimpleName());
      if ( obj instanceof ReplayDetailsCmd ) {
        ((foam.nanos.om.OMLogger) x.get("OMLogger")).log(obj.getClass().getSimpleName());
        ReplayDetailsCmd details = (ReplayDetailsCmd) obj;
        logger.info("request", details);

        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        details.setMinIndex(info.getMinIndex());
        details.setMaxIndex(info.getIndex());
        details.setCount(info.getCount());

        logger.info("response", details);

        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ((foam.nanos.om.OMLogger) x.get("OMLogger")).log(obj.getClass().getSimpleName());
        ReplayCmd cmd = (ReplayCmd) obj;
        ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails();
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        long indexAtStart = info.getIndex();

        logger.info("request", details.getRequester(), "min", details.getMinIndex(), "max", details.getMaxIndex());

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig fromConfig = support.getConfig(x, support.getConfigId());
        ClusterConfig toConfig = support.getConfig(x, details.getRequester());
        if ( details.getMinIndex() <= info.getIndex() ) {

          DAO clientDAO = (DAO) getClients().get(details.getRequester());
          if ( clientDAO != null ) {
            logger.info("cancel previous from", details.getRequester());
            // REVIEW: have replay write to null dao. How to cancel replay?
            // TODO: need the same support cache. For now expect cache to be small.
            clientDAO.cmd_(x, RetryClientSinkDAO.CANCEL_RETRY_CMD);
            ((ProxyDAO)clientDAO).setDelegate(new NullDAO(x, MedusaEntry.getOwnClassInfo()));
          }
          // NOTE: must use a retry client with a retry > 1.
          // Presently the first response appears to be rejected by the
          // caller.
          clientDAO = new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig));
          getClients().put(details.getRequester(), clientDAO);

          Predicate p = null;
          if ( details.getMinIndex() > info.getMinIndex() ) {
            p = GTE(MedusaEntry.INDEX, details.getMinIndex());
          }
          if ( details.getMaxIndex() > 0 &&
               details.getMaxIndex() < info.getIndex() ) {
            if ( p == null ) {
              p = LTE(MedusaEntry.INDEX, details.getMaxIndex());
            } else {
              p = AND(
                   p,
                   LTE(MedusaEntry.INDEX, details.getMaxIndex())
                );
            }
          }
          if ( p == null ) {
            p = TRUE;
          }

          logger.debug("cache,select,start", details.getRequester(), p);
          long startTime = System.currentTimeMillis();
          // cache - mdao (cache, fixed size, last x received)
          // this includes storageTransient entries
          DAO cache = (DAO) x.get("medusaNodeDAO");
          cache.where(p).select(new SetNodeSink(x, new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig))));
          logger.debug("cache,select,end", details.getRequester(), Duration.ofMillis(System.currentTimeMillis() - startTime));

          logger.debug("journal,select,start", details.getRequester(), p);
          startTime = System.currentTimeMillis();
          getJournal().replay(x, new PredicatedPutDAO(x, p, new MedusaSetNodeDAO(x, clientDAO)));
          logger.debug("journal,select,end", details.getRequester(), Duration.ofMillis(System.currentTimeMillis() - startTime));

          // send from cache again to capture anything received during journal replay
          cache.where(p).select(new SetNodeSink(x, new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig))));
          getClients().remove(details.getRequester());
        } else {
          logger.info("requester", cmd.getDetails().getRequester(), "requested min", cmd.getDetails().getMinIndex(), "greater than local max", info.getIndex());
        }
        return cmd;
      }

      if ( obj instanceof foam.mlang.sink.Max ) {
        Max max = (Max) getDelegate().select((Max) obj);
        if ( max != null ) {
          logger.info("response", max.getValue());
        }
        return max;
      }

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
