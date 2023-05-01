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
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Journal',
    'foam.dao.ProxyDAO',
    'foam.dao.NullDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
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
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM',
    'java.time.Duration',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.concurrent.atomic.AtomicBoolean'
  ],

  properties: [
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      value: 8
    },
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
    {
      name: 'replaysInProgress',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  javaCode: `
  Object lock_ = new Object();
  `,

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      final Logger logger = Loggers.logger(x, this, "cmd", obj.getClass().getSimpleName());
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
        final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ((OMLogger) x.get("OMLogger")).log(obj.getClass().getSimpleName());
        final ReplayCmd cmd = (ReplayCmd) obj;
        final ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails();
        final ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");

        logger.info("request", details.getRequester(), "min", details.getMinIndex(), "max", details.getMaxIndex());

        final ClusterConfig fromConfig = support.getConfig(x, support.getConfigId());
        final ClusterConfig toConfig = support.getConfig(x, details.getRequester());
        if ( details.getMinIndex() <= info.getIndex() ) {
         Agency agency = (Agency) x.get(support.getThreadPoolName());
          agency.submit(x, new ContextAgent() {
            public void execute(X x) {
              ((OMLogger) x.get("OMLogger")).log("ReplayCmd", details.getRequester());
              PM pm = PM.create(x, "ReplayNodeDAO", "ReplayCmd");

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

              long startTime = 0L;
              DAO clientDAO = new RetryClientSinkDAO(x, getMaxRetryAttempts(), support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig));
              DAO cacheDAO = (DAO) x.get("medusaNodeDAO");
              // use cache if it has min max range.
              if ( ! TRUE.equals(p) &&
                   details.getMinIndex() > 0 &&
                   details.getMaxIndex() > 0 &&
                   cacheDAO.find(details.getMinIndex()) != null &&
                   cacheDAO.find(details.getMaxIndex()) != null ) {
                logger.info("cache,select,start", details.getRequester(), p);
                startTime = System.currentTimeMillis();
                cacheDAO.where(p).select(new SetNodeSink(x, (Sink) clientDAO));
                logger.info("cache,select,end", details.getRequester(), Duration.ofMillis(System.currentTimeMillis() - startTime));
              } else {
                synchronized ( lock_ ) {
                  AtomicBoolean ab = (AtomicBoolean) getReplaysInProgress().get(details.getRequester());
                  if ( ab == null ) {
                    ab = new AtomicBoolean(false);
                    getReplaysInProgress().put(details.getRequester(), ab);
                  }
                  if ( ab.get() ) {
                    logger.info("journal,select,already in progress,ignoring request", details.getRequester(), p);
                    return;
                  } else {
                    ab.set(true);
                  }
                }
                try {
                  logger.info("journal,select,start", details.getRequester(), p);
                  startTime = System.currentTimeMillis();
                  getJournal().replay(x, new PredicatedPutDAO(x, p, new MedusaSetNodeDAO(x, clientDAO)));
                  logger.info("journal,select,end", details.getRequester(), Duration.ofMillis(System.currentTimeMillis() - startTime));

                  // cache of last x received, including storage transient
                  logger.info("cache,select,start", details.getRequester());
                  startTime = System.currentTimeMillis();
                  cacheDAO.select(new SetNodeSink(x, (Sink) clientDAO));
                  logger.info("cache,select,end", details.getRequester(), Duration.ofMillis(System.currentTimeMillis() - startTime));
                } finally {
                  AtomicBoolean ab = (AtomicBoolean) getReplaysInProgress().get(details.getRequester());
                  ab.set(false);
                }
              }
              pm.log(x);
            }
          }, "ReplayNodeDAO-replay");
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
