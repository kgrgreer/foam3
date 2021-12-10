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
    'foam.dao.Sink',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Loggers',
  ],

  properties: [
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
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

        Loggers.logger(x, this).info("ReplayDetailsCmd", "requester", details.getRequester(), "min", details.getMinIndex(), "count", details.getCount());
        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
        long indexAtStart = info.getIndex();

        Loggers.logger(x, this).info("ReplayCmd", "requester", cmd.getDetails().getRequester(), "min", cmd.getDetails().getMinIndex());

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig fromConfig = support.getConfig(x, cmd.getDetails().getResponder());
        ClusterConfig toConfig = support.getConfig(x, cmd.getDetails().getRequester());
        DAO clientDAO = support.getBroadcastClientDAO(x, cmd.getServiceName(), fromConfig, toConfig);

        // mdao (cache, fixed size, last x received) - this includes storageTransient entries.
        DAO cache = (DAO) x.get("medusaNodeDAO");

        ReplayDetailsCmd details = (ReplayDetailsCmd) cmd.getDetails();
        if ( details.getMinIndex() <= info.getMaxIndex() ) {
          Min min = (Min) MIN(MedusaEntry.INDEX);
          Count count = new Count();
          Sequence seq = new Sequence.Builder(x)
            .setArgs(new Sink[] {count, min})
            .build();
          cache.select(seq);

          if ( ((Long) count.getValue()) == 0 ||
               min != null &&
               min.getValue() != null &&
               details.getMinIndex() < (Long) min.getValue() ) {
;

            // replay from file system
            getJournal().replay(x, new MedusaSetNodeDAO(x, new RetryClientSinkDAO(x, 3, clientDAO)));
          }

          // replay from cache
          // cache.select(new RetryClientSinkDAO(x, 3, clientDAO));
          if ( info.getIndex() > indexAtStart ) {
            // send the extra received since we started the cache replay
            cache.where(GT(MedusaEntry.INDEX, info.getIndex())).select(new SetNodeSink(x, new RetryClientSinkDAO(x, 3, clientDAO)));
          }
        }
        return cmd;
      }

      if ( obj instanceof foam.mlang.sink.Max ) {
        Loggers.logger(x, this).debug("Max", "received");
        Max max = (Max) getDelegate().select((Max) obj);
        if ( max != null ) {
          Loggers.logger(x, this).debug("Max", "response", max.getValue());
        }
        return max;
      }

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
