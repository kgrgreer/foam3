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
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.FileRollCmd',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.log.LogLevel',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sequence',
    'foam.nanos.NanoService',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.Logger',
    'foam.nanos.er.EventRecord',
    'foam.nanos.pm.PM',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.time.Duration',
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
      documentation: 'Initiate Compaction process',
      name: 'COMPACTION_DRY_RUN_CMD',
      type: 'String',
      value: 'COMPACTION_DRY_RUN_CMD'
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
      value: 600000, // 10 minutes
      units: 'ms'
    },
    {
      documentation: 'true when blocking for dagger and node setup',
      name: 'blocking',
      class: 'Boolean',
      visibility: 'HIDDEN'
    },
    {
      name: 'eventRecord',
      class: 'FObjectProperty',
      of: 'foam.nanos.er.EventRecord'
    },
    {
      documentation: 'Map of maps of not found objects. Used to distinguish between not found and truely deleted.',
      name: 'notFound',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'dryRun',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( COMPACTION_CMD.equals(obj) ) {
        ((foam.nanos.om.OMLogger) x.get("OMLogger")).log(obj.toString());
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ) {
          Loggers.logger(x, this, "cmd").warning("Compaction not allowed during replay");
          throw new IllegalStateException("Compaction not allowed during Replay");
        }

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        if ( ! config.getIsPrimary() ) {
          throw new IllegalStateException("Compaction not allowed from Secondaries");
        }
        setDryRun(false);
        execute(x);
        return obj;
      }
      if ( COMPACTION_DRY_RUN_CMD.equals(obj) ) {
        ((foam.nanos.om.OMLogger) x.get("OMLogger")).log(obj.toString());
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        if ( replaying.getReplaying() ) {
          Loggers.logger(x, this, "cmd").warning("Compaction not allowed during replay");
          throw new IllegalStateException("Compaction not allowed during Replay");
        }
        setDryRun(true);
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
      Logger logger = Loggers.logger(x, this, "execute");
      long startTime = System.currentTimeMillis();
      logger.info("start");
      EventRecord er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, "Medusa", "compaction", "start")).fclone();
      er.clearId();
      setEventRecord(er);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      try {
        // system check
        logger.info("health");
        health(x);

        if ( getDryRun() ) {

          // compaction
          logger.info("compaction");
          long compactionTime = compaction(x);

        } else {

          // setup
          logger.info("stopServices");
          stopServices(x);

          // block
          logger.info("block");
          setBlocking(true);

          // wait
          logger.info("in-flight");
          try {
            inFlight(x);
          } catch (Throwable t) {
            setBlocking(false);
            throw t;
          }

          // nodes
          logger.info("roll");
          roll(x);

          // dagger
          logger.info("dagger");
          long oldGlobalIndex = dagger(x);

          // unblock
          logger.info("unblock");
          setBlocking(false);
          super.unblock(x);

          // compaction
          logger.info("compaction");
          long compactionTime = compaction(x);

          // purge
          logger.info("purge");
          purge(x, oldGlobalIndex, compactionTime);

          // startServices
          logger.info("startServices");
          startServices(x);
        }

        // report
        logger.info("report");
        report(x);

        logger.info("end");
        er = getEventRecord();
        er.setMessage("complete");
        ((DAO) x.get("eventRecordDAO")).put(er);

       } catch (Throwable t) {
        er = getEventRecord();
        er.setMessage(t.getMessage());
        er.setSeverity(LogLevel.ERROR);
        ((DAO) x.get("eventRecordDAO")).put(er);
        throw t;
      } finally {
        logger.info("end", "duration", Duration.ofMillis(System.currentTimeMillis() - startTime));
      }
      `
    },
    {
      name: 'stopServices',
      args: 'X x',
      javaCode: `
      NanoService service = (NanoService) x.get("promotedClearAgent");
      if ( service != null ) {
        service.stop();
      }
      service = (NanoService) x.get("medusaConsensusMonitor");
      if ( service != null ) {
        service.stop();
      }
      `
    },
    {
      name: 'startServices',
      args: 'X x',
      javaCode: `
      NanoService service = (NanoService) x.get("promotedClearAgent");
      if ( service != null ) {
        try {
          service.start();
        } catch (Throwable t) {
          Loggers.logger(x, this).warning("Failed to start", "promotedClearAgent");
        }
      }
      service = (NanoService) x.get("medusaConsensusMonitor");
      if ( service != null ) {
        try {
          service.start();
        } catch (Throwable t) {
          Loggers.logger(x, this).warning("Failed to start", "promotedClearAgent");
        }
      }
      `
    },
    {
      documentation: 'System check - make sure all nodes and mediators are online',
      name: 'health',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "health");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      DAO healthDAO = (DAO) x.get("healthDAO");

      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        MedusaHealth health = (MedusaHealth) healthDAO.find(cfg.getId());
        if ( health == null ||
             health.getMedusaStatus() != Status.ONLINE ) {
          logger.warning(cfg.getId(), "OFFLINE");
          throw new IllegalStateException(cfg.getId()+" OFFLINE");
        }
      }

      ClusterConfig[] mediators = support.getSfBroadcastMediators();
      for ( ClusterConfig cfg : mediators ) {
        MedusaHealth health = (MedusaHealth) healthDAO.find(cfg.getId());
        if ( health == null ||
             health.getMedusaStatus() != Status.ONLINE ) {
          logger.warning(cfg.getId(), "OFFLINE");
          throw new IllegalStateException(cfg.getId()+" OFFLINE");
        }
      }
      `
    },
    {
      documentation: 'Wait for in-flight operations on primary to finish',
      name: 'inFlight',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "in-flight");
      long startTime = System.currentTimeMillis();
      while ( System.currentTimeMillis() - startTime < getMaxWait() ) {
        Object response = getDelegate().cmd(MedusaBroadcast2NodesDAO.IN_FLIGHT_CMD);
        if ( response != null ) {
          Long inFlight = (Long) response;
          if ( inFlight > 0L ) {
            logger.warning(inFlight, "wait");
            synchronized (this) {
              try {
                Thread.currentThread().sleep(1000);
              } catch (InterruptedException e) {
                break;
              }
            }
          } else {
            return;
          }
        } else {
          return;
        }
      }
      logger.error("compaction,failed,timeout waiting for in-flight");
      throw new CompactionException("in-flight");
      `
    },
    {
      documentation: 'request all nodes roll their ledgers',
      name: 'roll',
      args: 'X x',
      javaCode: `
      final Logger logger = Loggers.logger(x, this, "roll");

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map failures = new HashMap();
      final Map replies = new HashMap();
      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "medusaEntryDAO", myConfig, cfg);
            try {
              FileRollCmd cmd = new FileRollCmd();
              cmd = (FileRollCmd) client.cmd(new FileRollCmd());
              replies.put(cfg.getId(), cmd);
              if ( ! foam.util.SafetyUtil.isEmpty(cmd.getError()) ) {
                logger.error("node,failed", cfg.getId(), cmd.getError());
                failures.put(cfg.getId(), cmd);
              } else {
                logger.info("node,complete", cfg.getId(), cmd.getRolledFilename());
              }
            } catch (RuntimeException e) {
              logger.error("node,failed", cfg.getId(), e.getMessage());
              failures.put(cfg.getId(), null);
            }
          }
        });
      }

      logger.debug("line.shutdown", "wait");
      // NOTE: line.shutdown() will block forever if a node does not reply.
      // Instead, perform manual polling for completion.
      long waited = 0L;
      long sleep = 10000L;
      while ( waited < getMaxWait() ) {
        try {
          logger.info("waiting on node roll completion");
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() == nodes.size() ) {
          break;
        }
      }
      if ( replies.size() < nodes.size() ||
           failures.size() > 0 ) {
        // TODO: in a failed state, need to shutdown - all mediators
        logger.error("compaction, failed. ", failures.size(), "of", nodes.size(), "failed", failures);
        throw new CompactionException("roll");
      }
      `
    },
    {
      documentation: 'Reset/reconfigure DaggerService',
      name: 'dagger',
      args: 'X x',
      type: 'Long',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "dagger");
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

      DaggerService service = (DaggerService) x.get("daggerService");
      long oldIndex = service.getGlobalIndex(x);

      // use next hashes.
      bootstrap.setBootstrapHashOffset(
        bootstrap.getBootstrapHashOffset() +
        bootstrap.getBootstrapHashEntries());

      bootstrap.setId(bootstrap.getId() + 1);
      bootstrap = (DaggerBootstrap) dao.put(bootstrap);

      long newIndex = service.getGlobalIndex(x);
      if ( oldIndex == newIndex ||
           newIndex != oldIndex + bootstrap.getBootstrapHashEntries() )  {
        logger.error("primary, reconfigurate, failed", "old", oldIndex, "new", newIndex);
        throw new CompactionException("dagger");
      }

      // update other mediators
      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig[] mediators = support.getSfBroadcastMediators();

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map failures = new HashMap();
      final Map replies = new HashMap();
      final DaggerBootstrap bs = bootstrap;

      for ( ClusterConfig cfg : mediators ) {
        if ( cfg.getId() == myConfig.getId() ) continue;
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "daggerBootstrapDAO", myConfig, cfg);
            try {
              Object response = client.put(bs);
              replies.put(cfg.getId(), response);
              logger.info("secondary,reconfigure,complete", cfg.getId());
            } catch (RuntimeException e) {
              logger.error("secondary,reconfigure,failed", cfg.getId(), e.getMessage());
              failures.put(cfg.getId(), e.getMessage());
            }
          }
        });
      }

      logger.debug("line.shutdown, wait");
      // NOTE: line.shutdown() will block forever if a mediator does not reply.
      // Instead perform manual polling for completion.
      long waited = 0L;
      long sleep = 1000L;
      while ( waited < getMaxWait() ) {
        try {
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() >= mediators.length -1 ) {
          break;
        }
      }
      // getSfBroacastMediators returns self as well, hence the -1
      if ( replies.size() < (mediators.length -1) ||
           failures.size() > 0 ) {
        // TODO: in a failed state, need to shutdown - all mediators
        logger.error("secondary, reconfigure, failed", failures.size(), "of", mediators.length -1, "failed", failures);
        throw new CompactionException("dagger");
      }
      // verify all bootstrap hashes are the same.
      for ( Object reply : replies.values() ) {
        for ( int i = 0; i < bootstrap.getBootstrapHashes().length; i++ ) {
          DaggerBootstrap db = (DaggerBootstrap) reply;
          if ( ! bootstrap.getBootstrapHashes()[i].equals(db.getBootstrapHashes()[i])) {
            logger.error("bootstrap hash mismatch", "expected", bootstrap.getBootstrapHashes()[i], "found", db.getBootstrapHashes()[i]);
            throw new CompactionException("dagger validation");
          }
          if ( ! bootstrap.getBootstrapDAGHashes()[i].equals(db.getBootstrapDAGHashes()[i])) {
            logger.error("bootstrap DAG hash mismatch", "expected", bootstrap.getBootstrapDAGHashes()[i], "found", db.getBootstrapDAGHashes()[i]);
            throw new CompactionException("dagger validation");
          }
        }
      }
      return oldIndex;
      `
    },
    {
      documentation: 'Dump medusa entry data to new ledger file',
      name: 'compaction',
      args: 'X x',
      type: 'Long',
      javaCode: `
      final Logger logger = Loggers.logger(x, this, "compaction");
      final DAO dao = ((DAO) x.get("medusaEntryDAO")).orderBy(MedusaEntry.ID);
      final Count total = (Count) dao.select(new Count());

      final Count compacted = new Count();
      final Count processed = new Count();
      final CompactibleSink compactibleSink = new CompactibleSink(x,
                    new CompactionSink(x,
                    new UniqueSink(x,
                    new NSpecSink(x, this,
                    new DaggerSink(x, this,
                    new Sequence.Builder(x)
                      .setArgs(new Sink[] {
                        compacted,
                        new NodeSink(x, this) })
                      .build()
                    )))));
      final Sink sink = new Sequence.Builder(x)
                     .setArgs(new Sink[] {
                       processed,
                       compactibleSink })
                     .build();

      final long startTime = System.currentTimeMillis();
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      Agency agency = (Agency) x.get(support.getThreadPoolName());
      agency.submit(x, new ContextAgent() {
        public void execute(X x) {
          logger.info("start");
          dao.select(sink);
          long compactionTime = System.currentTimeMillis() - startTime;
          logger.info("agency", "end", "duration", Duration.ofMillis(compactionTime));
        }
      }, this.getClass().getSimpleName()+".compaction");
      // wait for eof
      while ( ! compactibleSink.getIsEof() &&
              ((Long) processed.getValue()) < ((Long) total.getValue()) ) {
        long percentComplete = (long) ((((Long) processed.getValue()) / ((Long) total.getValue()).doubleValue()) * 100.0);
        logger.info("progress", "processed", processed.getValue(), "compacted", compacted.getValue(), "completed", percentComplete, "%");
        try {
          Thread.currentThread().sleep(5000);
        } catch (InterruptedException e) {
          break;
        }
      }
      double compressed = ((((Long) processed.getValue()) - ((Long) compacted.getValue())) / ((Long) processed.getValue()).doubleValue()) * 100.0;
      long compactionTime = System.currentTimeMillis() - startTime;
      double seconds = compactionTime / 1000.0;
      double minutes = compactionTime / 60;
      double replayedS = ((Long) processed.getValue()) / seconds;
      double promotedS = ((Long) compacted.getValue()) / seconds;
      double min100K = minutes / ( (Long) compacted.getValue() / 100000.0 );
      StringBuilder report = new StringBuilder();
      report.append("instance,processed,compacted,duration s,compressed,date");
      report.append("\\n");
      report.append(System.getProperty("hostname", "loalhost"));
      report.append(",");
      report.append(processed.getValue());
      report.append(",");
      report.append(compacted.getValue());
      report.append(",");
      report.append(Math.round(seconds));
      report.append(",");
      report.append(String.format("%.2f%%", compressed));
      report.append(",");
      report.append(new java.util.Date(startTime));

      logger.info("compactionComplete", "report", "\\n"+report.toString());

      EventRecord er = getEventRecord();
      er.setResponseMessage(report.toString());
      return compactionTime;
      `
    },
    {
      documentation: 'Clean up memory medusa entry daos after compaction',
      name: 'purge',
      args: 'X x, Long oldGlobalIndex, Long compactionTime',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "purge");
      logger.info("oldIndex", oldGlobalIndex);
      final MedusaEntryPurgeCmd cmd = new MedusaEntryPurgeCmd.Builder(x)
        .setMinIndex(0L)
        .setMaxIndex(oldGlobalIndex)
        .build();

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig[] mediators = support.getSfBroadcastMediators();

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map failures = new HashMap();
      final Map replies = new HashMap();

      for ( ClusterConfig cfg : mediators ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            if ( cfg.getId() == myConfig.getId() ) {
              replies.put(cfg.getId(), ((DAO) x.get("medusaMediatorDAO")).cmd(cmd));
            } else {
              DAO client = support.getClientDAO(x, "medusaMediatorDAO", myConfig, cfg);
              try {
                Object response = client.cmd(cmd);
                replies.put(cfg.getId(), response);
                logger.info("secondary,purge,complete", cfg.getId());
              } catch (RuntimeException e) {
                logger.error("secondary,purge,failed", cfg.getId(), e.getMessage());
                failures.put(cfg.getId(), e.getMessage());
              }
            }
          }
        });
      }

      logger.debug("line.shutdown, wait");
      // NOTE: line.shutdown will block forever if a mediator does not reply.
      // Instead, perform manual polling for completion.
      long waited = 0L;
      long sleep = 5000L;
      long waitTime = Math.max(getMaxWait(), compactionTime);
      while ( waited < waitTime ) {
        logger.debug("wait");
        try {
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() == mediators.length ) {
          break;
        }
      }
      if ( replies.size() < (mediators.length) ||
           failures.size() > 0 ) {
        // REVIEW: purge failure is ok, just means the same data may
        // written out again if another mediator is primary.
        logger.warning("secondary, purge, failed", failures.size(), "of", mediators.length, "failed");
        throw new CompactionException("purge");
      }
      `
    },
    {
      documentation: 'Report on not found objects, and cleanup',
      name: 'report',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "report");
      Map<String, Map<Object, MedusaEntry>> notFound = (Map<String, Map<Object, MedusaEntry>>) getNotFound();
      notFound.forEach((nspec, map) -> {
        if ( map.size() > 0 ) {
          logger.info("Not found", nspec, map.size());
          map.forEach((id, entry) -> {
            logger.info("Not found", nspec, id, entry.toSummary());
          });
        }
        map.clear();
      });
      notFound.clear();
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
          Compaction compaction = (Compaction) ((DAO) getX().get("compactionDAO")).find(entry.getNSpecName());
          if ( compaction != null &&
               ! compaction.getReducible() ) {
            getDelegate().put(obj, sub);
          }
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
        public NSpecSink(X x, CompactionDAO self, ProxySink delegate) {
          super(x, delegate);
          setSelf(self);
        }
      `,

      properties: [
        {
          name: 'self',
          class: 'foam.dao.DAOProperty',
          of: 'foam.nanos.medusa.CompactionDAO'
        }
      ],

      methods: [
        {
          name: 'put',
          javaCode: `
          X x = getX();
          Logger logger = Loggers.logger(x, this, "put");
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          MedusaEntry entry = (MedusaEntry) obj;
          if ( entry.getObjectId() == null ) {
             if ( ! "bootstrap".equals(entry.getNSpecName()) ) {
               logger.error("Object id null", entry.getNSpecName(), entry.getDop(), entry.getObjectId());
             }
             return;
          }

          DAO mdao = (DAO) support.getMdao(x, entry.getNSpecName());
          // Object nspec = x.get(entry.getNSpecName());
          //  if ( nspec == null ) {
          //   logger.warning("NSpec not found", entry.getNSpecName());
          //   return;
          // }
          // if ( ! ( nspec instanceof DAO ) ) {
          //   logger.warning("NSpec not DAO", entry.getNSpecName());
          //   return;
          // }
          // DAO mdao = (DAO) support.getMdao(x, entry.getNSpecName());
          FObject found = mdao.find(entry.getObjectId());
          if ( found == null ) {
            if ( entry.getDop().equals(DOP.REMOVE) ) {
              // OK
              Map map = (Map) getSelf().getNotFound().get(entry.getNSpecName());
              if ( map != null ) {
                map.remove(entry.getObjectId());
              }
              logger.info("Object removed", entry.getNSpecName(), entry.getDop(), entry.toSummary());
            } else {
              Map map = (Map) getSelf().getNotFound().get(entry.getNSpecName());
              if ( map == null ) {
                map = new HashMap();
                getSelf().getNotFound().put(entry.getNSpecName(), map);
              }
              if ( ! map.containsKey(entry.getObjectId()) ) {
                map.put(entry.getObjectId(), entry);
              }
              // delay reporting not found, see 'report'
              // logger.error("Object not found", entry.getNSpecName(), entry.getDop(), entry.toSummary());
            }
          } else {
            Compaction compaction = (Compaction) ((DAO) x.get("compactionDAO")).find(entry.getNSpecName());
            if ( found instanceof LifecycleAware &&
                 ((LifecycleAware) found).getLifecycleState() == LifecycleState.DELETED &&
                 compaction != null &&
                 compaction.getCompactLifecycleDeleted() ) {
              logger.info("Object removed, LifecycleState.DELETED", entry.getNSpecName(), entry.getDop(), entry.toSummary());
            } else {
              MedusaEntrySupport entrySupport = (MedusaEntrySupport) x.get("medusaEntrySupport");
              String data = entry.getData();

              if ( compaction == null ||
                   compaction.getReducible() ) {
                data = entrySupport.data(x, found, null, entry.getDop());
              }
              MedusaEntry me = (MedusaEntry) entry.fclone();
              MedusaEntry.ID.clear(me);
              MedusaEntry.DATA.clear(me);
              MedusaEntry.TRANSIENT_DATA.clear(me);
              MedusaEntry.OBJECT.clear(me);
              MedusaEntry.HASH.clear(me);
              me.setData(data);
              getDelegate().put(me, sub);
            }
          }
          `
        }
      ]
    },
    {
      name: 'DaggerSink',
      extends: 'foam.dao.ProxySink',

      documentation: 'Links new MedusaEntry',

      javaCode: `
        public DaggerSink(X x, CompactionDAO self, ProxySink delegate) {
          super(x, delegate);
          setSelf(self);
        }
      `,

      properties: [
        {
          name: 'self',
          class: 'foam.dao.DAOProperty',
          of: 'foam.nanos.medusa.CompactionDAO'
        }
      ],

      methods: [
        {
          name: 'put',
          javaCode: `
          X x = getX();
          Logger logger = Loggers.logger(x, this, "put");
          MedusaEntry entry = (MedusaEntry) obj;
          if ( ! getSelf().getDryRun() ) {
            DaggerService dagger = (DaggerService) x.get("daggerService");
            entry = dagger.link(x, entry);
          }
          getDelegate().put(entry, sub);
          `
        }
      ]
    },
    {
      name: 'CompactibleSink',
      extends: 'foam.dao.ProxySink',

      documentation: 'Skip entries which are not compactible',

      properties: [
        {
          name: 'isEof',
          class: 'Boolean'
        }
      ],

      javaCode: `
      public CompactibleSink(X x, Sink delegate) {
        super(x, delegate);
      }
      `,

      methods: [
        {
          name: 'put',
          javaCode: `
          MedusaEntry entry = (MedusaEntry) obj;
          if ( entry.getCompactible() ) {
            getDelegate().put(obj, sub);
          }
          `
        },
        {
          name: 'eof',
          javaCode: 'setIsEof(true);'
        }
      ]
    },
    {
      name: 'NodeSink',
      extends: 'foam.dao.AbstractSink',

      documentation: 'Sends MedusaEntry to nodes',

      javaCode: `
        public NodeSink(X x, CompactionDAO self) {
          setX(x);
          setSelf(self);
        }
      `,

      properties: [
        {
          name: 'self',
          class: 'foam.dao.DAOProperty',
          of: 'foam.nanos.medusa.CompactionDAO'
        },
        {
          class: 'foam.dao.DAOProperty',
          name: 'dao',
          javaFactory: `
          if ( getSelf().getDryRun() )
            return new foam.dao.NullDAO(getX(), MedusaEntry.getOwnClassInfo());

          return new MedusaBroadcast2NodesDAO(getX());
          `
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
