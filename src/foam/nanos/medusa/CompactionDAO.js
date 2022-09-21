/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'CompactionDAO',
  extends: 'foam.nanos.medusa.BlockingDAO',

  documentation: `
Re-writes MedusaEntry DAO with a single full copy of each Object.

process:
CompactionDAO (only from primary), respond to CompactionCmd
  - not while replaying
send BlockingDAO BLOCK_CMD - handled by ReplayingDAO
send FileRollCmd to nodes to start new ledger.x with new message digest (AbstractF3FileJournal, HashingJournal)
reconfigure dagger with new hashes and new start links at next two indexes
send BlockingDAO UNBLOCK_CMD - handled by ReplayingDAO
compaction start - medusaentry data to nodes
compaction complete - purge medusaentry dao before new indexes

TODO: handle node roll failure - or timeout
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.FileRollCmd',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  constants: [
    {
      documentation: 'Initiate Compaction process',
      name: 'COMPACTION_CMD',
      type: 'String',
      value: 'COMPACTION_CMD'
    },
    {
      name: 'ALARM_NAME',
      type: 'String',
      value: 'Medusa Compaction'
    }
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "medusaNodeDAO";
      `
    },
    {
      name: 'maxWait',
      class: 'Long',
      value: 60000,
      units: 'ms'
    },
    {
      documentation: 'true when blocking for dagger and node setup',
      name: 'blocking',
      class: 'Boolean',
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( COMPACTION_CMD.equals(obj) ) {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ) {
          Loggers.logger(x, this).warning("Compaction not allowed during replay");
          throw new RuntimeException("Compaction not allowed during Replay");
        }

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        if ( ! config.getIsPrimary() ) {
          throw new RuntimeException("Compaction not allowed from Secondaries");
        }

        // TODO: start in own thread
        execute(x);
        return obj;
      }
      return getDelegate().cmd_(x, obj);
      `
    },
    {
      name: 'maybeBlock',
      args: 'X x',
      javaCode: `
      return getBlocking();
      `
    },
    {
      name: 'execute',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      logger.info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      try {
        // block
        logger.info("block");
        setBlocking(true);

        // wait
        logger.info("in-flight");
        Object response = getDelegate().cmd(MedusaBroadcast2NodesDAO.IN_FLIGHT_CMD);
        if ( response != null ) {
          Long inFlight = (Long) response;
          if ( inFlight > 0L ) {
            // TODO: wait
            logger.warning("in-flight", inFlight);
          }
        }

        // nodes
        logger.info("nodes");
        rollNodes(x);

        // dagger
        logger.info("dagger");
        long oldIndex = dagger(x);

        // unblock
        logger.info("unblock");
        setBlocking(false);
        super.unblock(x);

        // compaction
        logger.info("compaction");
        compaction(x);

        // purge
        logger.info("purge");
        purge(x, oldIndex);

        logger.info("end");
      } catch (Throwable t) {
        logger.error(t);
      }
      `
    },
    {
      name: 'rollNodes',
      args: 'X x',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      // logger.info("rollNodes");

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Set replies = new HashSet();
      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "medusaEntryDAO", myConfig, cfg);
            try {
              replies.add(client.cmd(new FileRollCmd()));
            } catch (RuntimeException e) {
              logger.error("rollNodes", "cmd", e);
            }
          }
        });
      }

      logger.debug("rollNodes", "line.shutdown", "wait");
      // NOTE: this will block forever if a node does not reply.
      // line.shutdown();
      // Perform manual polling for completion.
      long waited = 0L;
      long sleep = 1000L;
      while ( waited < getMaxWait() ) {
        try {
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() >= nodes.size() -1 ) {
          break;
        }
      }
      if ( replies.size() < nodes.size() ) {
        // potential failure.
      }
      logger.debug("rollNodes", "line.shutdown", "continue");
      `
    },
    {
      documentation: 'Reset/reconfigure DaggerService',
      name: 'dagger',
      args: 'X x',
      type: 'Long',
      javaCode: `
      DAO dao = (DAO) getX().get("daggerBootstrapDAO");
      ArrayList list = (ArrayList) ((ArraySink) dao.orderBy(new foam.mlang.order.Desc(DaggerBootstrap.ID)).limit(1).select(new ArraySink())).getArray();
      DaggerBootstrap bootstrap = null;
      if ( list.size() > 0 ) {
        bootstrap = (DaggerBootstrap) list.get(0);
      }

      if ( bootstrap == null ) {
        bootstrap = new DaggerBootstrap();
      } else {
        bootstrap = (DaggerBootstrap) bootstrap.fclone();
      }

      // use next hashes.
      bootstrap.setBootstrapIndex(
        bootstrap.getBootstrapIndex() +
        bootstrap.getBootstrapEntries());

      bootstrap.setId(bootstrap.getId() + 1);
      bootstrap = (DaggerBootstrap) dao.put(bootstrap);

      DaggerService service = (DaggerService) x.get("daggerService");
      long oldIndex = service.getGlobalIndex(x);
      service.reconfigure(x, bootstrap);
      long newIndex = service.getGlobalIndex(x);
      if ( oldIndex == newIndex ||
           ! ( newIndex == oldIndex + bootstrap.getBootstrapEntries()) ) {
        Loggers.logger(x, this).error("dagger", "reconfiguration failed", "old", oldIndex, "new", newIndex);
      }
      return oldIndex;
      `
    },
    {
      documentation: '',
      name: 'compaction',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      DAO dao = (DAO) x.get("medusaEntryDAO");
      dao = dao.orderBy(MedusaEntry.ID);
      Sink sink = new UniqueSink(x,
                    new NSpecSink(x,
                      new NodeSink(x)));
      logger.info("compaction", "start");
      dao.select(sink);
      logger.info("compaction", "end");
      `
    },
    {
      name: 'purge',
      args: 'X x, Long oldIndex',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      ContextAgent agent =
        new PromotedPurgeAgent.Builder(x)
          .setMinIndex(0L)
          .setMaxIndex(oldIndex)
          .setRetain(0L)
          .build();
      logger.info("purge", "start");
      agent.execute(x);
      logger.info("purge", "end");
      `
    }
  ],

  classes: [
    {
      name: 'UniqueSink',
      extends: 'foam.dao.ProxySink',

      documentation: 'Delegates once per NSpec-ObjectId',

      javaCode: `
        public UniqueSink(X x, ProxySink delegate) {
          super(x, delegate);
        }
      `,

      properties: [
        {
          class: 'Map',
          name: 'putResults',
          javaFactory: 'return new HashMap();'
        },
        {
          class: 'Map',
          name: 'removeResults',
          javaFactory: 'return new HashMap();'
        }
      ],

      methods: [
        {
          name: 'put',
          javaCode: `
          MedusaEntry entry = (MedusaEntry) obj;
          String id = entry.getNSpecName()+"-"+entry.getObjectId();
          Map results = getPutResults();
          if ( entry.getDop().equals(DOP.REMOVE) ) {
            results = getRemoveResults();
          }
          if ( results.get(id) == null ) {
            results.put(id, true);
            getDelegate().put(obj, sub);
          }
          `
        }
      ]
    },
    {
      name: 'NSpecSink',
      extends: 'foam.dao.ProxySink',

      documentation: 'Creates new MedusaEntry for current Object',

      javaCode: `
        public NSpecSink(X x, ProxySink delegate) {
          super(x, delegate);
        }
      `,

      methods: [
        {
          name: 'put',
          javaCode: `
          X x = getX();
          MedusaEntry entry = (MedusaEntry) obj;
          DAO dao = (DAO) x.get(entry.getNSpecName());
          if ( dao == null ) {
            Loggers.logger(x, this).error("NSpec not found", entry.getNSpecName());
          } else {
            FObject found = dao.find(entry.getObjectId());
            if ( found == null ) {
              if ( entry.getDop().equals(DOP.REMOVE) ) {
                // ok
              } else {
                Loggers.logger(x, this).error("Object not found", entry.getNSpecName(), entry.getObjectId());
              }
            } else {
              MedusaEntrySupport entrySupport = (MedusaEntrySupport) x.get("medusaEntrySupport");
              String data = entrySupport.data(x, found, null, entry.getDop());
              MedusaEntry me = (MedusaEntry) entry.fclone();
              MedusaEntry.ID.clear(me);
              MedusaEntry.DATA.clear(me);
              MedusaEntry.TRANSIENT_DATA.clear(me);
              MedusaEntry.OBJECT.clear(me);
              me.setData(data);
              DaggerService dagger = (DaggerService) x.get("daggerService");
              me = dagger.link(x, me);
              getDelegate().put(me, sub);
            }
          }
          `
        }
      ]
    },
    {
      name: 'NodeSink',
      extends: 'foam.dao.ProxySink',

      documentation: 'Sends MedusaEntry to nodes',

      javaCode: `
        public NodeSink(X x, DAO dao) {
          setX(x);
          setDao(dao);
        }
      `,

      properties: [
        {
          class: 'foam.dao.DAOProperty',
          name: 'dao',
          javaFactory: 'return new MedusaBroadcast2NodesDAO(getX());'
        }
      ],

      methods: [
        {
          name: 'put',
          javaCode: `
          getDao().put_(getX(), (FObject) obj);
          `
        }
      ]
    }
  ]
});
