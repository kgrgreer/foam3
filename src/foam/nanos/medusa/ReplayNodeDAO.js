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
    'static foam.mlang.MLang.MIN',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
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
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayDetailsCmd ) {
        ReplayDetailsCmd details = (ReplayDetailsCmd) obj;

        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");

        details.setMinIndex(info.getMinIndex());
        details.setMaxIndex(info.getMaxIndex());
        details.setCount(info.getCount());

        getLogger().info("ReplayDetailsCmd", "requester", details.getRequester(), "min", details.getMinIndex(), "count", details.getCount());
        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");

        getLogger().info("ReplayCmd", "requester", cmd.getDetails().getRequester(), "min", cmd.getDetails().getMinIndex());

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
            getJournal().replay(x, new RetryClientSinkDAO(x, clientDAO));
          }

          // replay from cache
          // long indexAtStart = info.getIndex();
          cache.select(new RetryClientSinkDAO(x, clientDAO));

          // if ( info.getIndex() > indexAtStart ) {
          //   // send the extra received since we started the cache replay
          //   // Often after replay, the last storageTransient entry is not sent.
          //   cache.where(GT(MedusaEntry.INDEX, info.getIndex())).select(new RetryClientSinkDAO(x, clientDAO));
          // }
        }
        return cmd;
      }

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
