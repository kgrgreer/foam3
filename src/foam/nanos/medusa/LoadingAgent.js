/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'LoadingAgent',
  implements: [ 'foam.core.ContextAgent',
                  'foam.core.ContextAware' ],

  documentation: `
Requirement:
Load a medusa system from an existing non-medusa system.
Data residing in individual journals, replayed into mdaos, and then output as medusa entries to a ledger.

Considerations:
All but transactions can be loaded into their respective MDAO without side effects. Meaning, loading accounts for users that do not exist yet is viable.
Transactions had additional requirements:
All Transactions versions must be replayed as replay rebuilds associated account balances. This process has side effects, transaction replay validates both users and accounts.
Future compaction requires all transaction versions are retained. Hithertoo this is accomplished via retaining the associated MedusaEntry for each.

Process:
Replay each file journal through a MedusaAdaptorDAO.
Given any regularly configured medusa cluster, for each DAO nspec that has a journal, create a JDAO which delegates to MedusaAdapterDAO.  This feeds all 'put's from the journal into medusa as any other.

Using LoadingAgent
From the primary of a completely ONLINE new medusa cluster:
1. copy all journals to be processed, except that of transactions, into the journal folder of the primary
2. execute LoadingAgent
3. remove all processed journals
4. copy the transaction journal into th journal folder of the primary
5. execute LoadingAgent
6. remove the transactions journal
7. No restart is required, the cluster is viable.
`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.F3FileJournal',
    'foam.dao.JournalType',
    'foam.dao.ProxyDAO',
    'foam.dao.java.JDAO',
    'foam.log.LogLevel',
    'foam.nanos.boot.NSpec',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.Logger',
    'foam.nanos.medusa.MedusaAdapterDAO',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'foam.util.concurrent.SyncAssemblyLine',
    'java.time.Duration',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.stream.Collectors'
  ],

  methods: [
    {
      name: 'execute',
      args: 'X x',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "execute");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      if ( replaying.getReplaying() ) {
        Loggers.logger(x, this, "cmd").warning("Load not allowed during replay");
        throw new IllegalStateException("Load not allowed during Replay");
      }

      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( ! config.getIsPrimary() ) {
        throw new IllegalStateException("Load not allowed from Secondaries");
      }

      long startTime = System.currentTimeMillis();
      logger.info("start");
      EventRecord er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, "Medusa", "loading", "start")).fclone();
      er.clearId();

      try {
        // system check
        logger.info("health");
        health(x);

        // load
        logger.info("load");
        Map<String, String> report = load(x);

        er.setMessage("complete");
        String message = report.keySet()
          .stream()
          .map(key -> key + " " +report.get(key))
          .collect(Collectors.joining("\\n"));
        er.setResponseMessage(message);
        ((DAO) x.get("eventRecordDAO")).put(er);
        logger.info("report", message);
      } catch (Throwable t) {
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
      name: 'load',
      args: 'X x',
      type: 'Map',
      javaCode: `
      final Logger logger = Loggers.logger(x, this, "loading");
      final HashMap report = new HashMap();
      logger.info("start");
      final long startTime = System.currentTimeMillis();
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      // NOTE: to use AsyncAssemblyLine, we have to manually determine
      // when all have been processed, as the JDAO replay is itself a
      // AsyncAssemblyLine, so it returns immediately.
      // AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      AssemblyLine line = new SyncAssemblyLine(x);
      DAO serviceDAO = new JDAO(x, new foam.dao.MDAO(NSpec.getOwnClassInfo()), "services", false);
      List<NSpec> services = (List) ((ArraySink) serviceDAO.select(new ArraySink())).getArray();
      for ( NSpec service : services ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            logger.info("load", "start", service.getId());
            EasyDAO easyDAO = null;
            try {
              easyDAO = getEasyDAO(x, service);
              if ( easyDAO == null ) return;
            } catch (Throwable e) {
              logger.info(service.getId(), "skipped", e.getMessage());
              report.put(service.getId(), e.getMessage());
              return;
            }
            DAO delegate = null;
            if ( easyDAO.getSAF() ) {
              delegate = new foam.nanos.medusa.sf.SFBroadcastDAO.Builder(x)
                .setNSpec(service)
                .setDelegate(easyDAO.getLastDao())
                .build();
            } else {
              // Use the nspec setup MedusaAdapterDAO if available
              delegate = getMedusaAdapterDAO(x, easyDAO);
              if ( delegate == null ) {
                delegate = new MedusaAdapterDAO.Builder(x)
                  .setNSpec(service)
                  .setDelegate(easyDAO.getLastDao())
                  .build();
              }
            }
            JDAO jdao = new JDAO();
            jdao.setX(x);
            if ( SafetyUtil.isEmpty(easyDAO.getJournalName()) ) {
              // handle custom nspecs with explicit jdao or clustering setup
              Compaction compaction = (Compaction) ((DAO) x.get("compactionDAO")).find(service.getId());
              if ( compaction != null &&
                   ! SafetyUtil.isEmpty(compaction.getJournalName()) ) {
                jdao.setFilename(compaction.getJournalName());
              } else {
                logger.warning("load", service.getId(), "JournalName not found");
                return;
              }
            } else {
              jdao.setFilename(easyDAO.getJournalName());
            }
            jdao.setReadOnly(true);
            jdao.setRuntimeOnly(true);

            // this will trigger replay
            long loadStartTime = System.currentTimeMillis();
            try {
              jdao.setDelegate(delegate);
              F3FileJournal journal = (F3FileJournal) jdao.getJournal();
              if ( journal.getPassCount() + journal.getFailCount() > 0 ) {
                report.put(service.getId(), "processed "+journal.getPassCount()+" of "+(journal.getFailCount()+journal.getPassCount()));
              } else {
                logger.info(service.getId(), "skipped", "empty journal");
              }
              logger.info("load", "end", service.getId());
            } catch (Throwable t) {
              logger.error("load", "end", service.getId(), t);
              report.put(service.getId(), t.getMessage());
            }
          }
        });
      }
      line.shutdown();
      logger.info("end");
      return report;
      `
    },
    {
      name: 'getEasyDAO',
      args: 'X x, NSpec service',
      type: 'foam.dao.EasyDAO',
      javaThrows: ['Throwable'],
      javaCode: `
      Compaction compaction = (Compaction) ((DAO) x.get("compactionDAO")).find(service.getId());
      if ( compaction != null &&
           ! compaction.getLoadable() ) {
        Loggers.logger(x, this).info("getEasyDAO", service.getId(), "not loadable");
        return null;
      }
      if ( SafetyUtil.isEmpty(service.getServiceScript()) ) {
        Loggers.logger(x, this).info("getEasyDAO", service.getId(), "no service script");
        return null;
      }
      if ( ! service.getServiceScript().contains("EasyDAO") ) {
        Loggers.logger(x, this).info("getEasyDAO", service.getId(), "not EasyDAO script");
        return null;
      }
      if ( ! ( x.get(service.getId()) instanceof DAO ) ) {
        Loggers.logger(x, this).info("getEasyDAO", service.getId(), "service not DAO");
        return null;
      }
      DAO dao = (DAO) x.get(service.getId());
      while ( dao != null ) {
        if ( dao instanceof EasyDAO ) {
          EasyDAO easyDAO = (EasyDAO) dao;
          if ( easyDAO.getNullify() ) {
            Loggers.logger(x, this).info("getEasyDAO", service.getId(), "nullify");
            break;
          }
          if ( ! easyDAO.getCluster() ) {
            if ( ! service.getServiceScript().contains("MedusaAdapterDAO") ) {
              // custom nspec may explicitly setup clustering
              Loggers.logger(x, this).info("getEasyDAO", service.getId(), "not clustered");
              break;
            }
          }
          if ( ! easyDAO.getJournalType().equals(JournalType.SINGLE_JOURNAL) ) {
            if ( ! service.getServiceScript().contains("JDAO") ) {
              // custom nspec may explicitly setup journalling
              Loggers.logger(x, this).info("getEasyDAO", service.getId(), "no journal/jdao");
              break;
            }
          }
          return easyDAO;
        }
        if ( dao instanceof ProxyDAO ) {
          dao = ((ProxyDAO) dao).getDelegate();
        } else {
          Loggers.logger(x, this).warning("getEasyDAO", service.getId(), "not found");
          break;
        }
      }
      return null;
      `
    },
    {
      name: 'getMedusaAdapterDAO',
      args: 'X x, DAO dao',
      type: 'MedusaAdapterDAO',
      javaCode: `
      while ( dao != null ) {
        if ( dao instanceof MedusaAdapterDAO ) {
          return (MedusaAdapterDAO) dao;
        }
        if ( dao instanceof ProxyDAO ) {
          dao = ((ProxyDAO) dao).getDelegate();
        } else {
          break;
        }
      }
      return null;
      `
    },
    {
      name: 'getJDAO',
      args: 'X x, DAO dao',
      type: 'JDAO',
      javaCode: `
      while ( dao != null ) {
        if ( dao instanceof JDAO ) {
          return (JDAO) dao;
        }
        if ( dao instanceof ProxyDAO ) {
          dao = ((ProxyDAO) dao).getDelegate();
        } else {
          break;
        }
      }
      return null;
      `
    }
  ]
})
