/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaStatusWatcher',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: 'Monitor the etc directory for the apperance of a file named OFFLINE which will trigger the instance to transition to OFFLINE.  This will allow ssh control of an mediator or node.',

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Timer',
    'java.util.stream.Collectors',
    'java.io.File',
    'java.io.IOException',
    'java.nio.file.Files',
    'java.nio.file.Path',
    'java.nio.file.Paths',
    'java.nio.file.FileSystems',
    'java.nio.file.WatchEvent',
    'java.nio.file.WatchKey',
    'java.nio.file.WatchService',
    'java.nio.file.StandardWatchEventKinds'
  ],

  constants: [
    {
      name: 'ONLINE',
      type: 'String',
      value: 'ONLINE'
    },
    {
      name: 'OFFLINE',
      type: 'String',
      value: 'OFFLINE'
    },
    {
      name: 'SHUTDOWN',
      type: 'String',
      value: 'SHUTDOWN'
    },
    {
      name: 'DISSOLVE',
      type: 'String',
      value: 'DISSOLVE'
    },
    {
      name: 'SIR',
      type: 'String',
      value: 'SIR'
    }
  ],

  properties: [
    {
      name: 'watchDir',
      class: 'String',
      javaFactory: 'return System.getProperty("java.io.tmpdir", "/tmp");'
    },
   {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 60000
   },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) x.get("logger"));
      logger.info("execute", getWatchDir());
      try {
        Path existing = Paths.get(getWatchDir(), OFFLINE);
        Files.deleteIfExists(existing);
        existing.toFile().deleteOnExit();
      } catch ( IOException e) {
        // Can fail to delete when it was touch by root, for example.
        logger.warning(e);
      }

      try {
        Path existing = Paths.get(getWatchDir(), SHUTDOWN);
        Files.deleteIfExists(existing);
        existing.toFile().deleteOnExit();
      } catch ( IOException e) {
        logger.warning(e);
      }

      try {
        WatchService watchService = FileSystems.getDefault().newWatchService();
        Path path = Paths.get(getWatchDir());
        path.register(
          watchService,
          StandardWatchEventKinds.ENTRY_CREATE
        );

        WatchKey key;
        while ((key = watchService.take()) != null) {
          for (WatchEvent<?> event : key.pollEvents()) {
            if ( event.kind() == StandardWatchEventKinds.ENTRY_CREATE &&
                 ( SHUTDOWN.equals(event.context().toString()) ||
                   OFFLINE.equals(event.context().toString()) ||
                   ONLINE.equals(event.context().toString()) ||
                   DISSOLVE.equals(event.context().toString()) ||
                   SIR.equals(event.context().toString()) ) ) {
              logger.warning("detected", event.context());

              ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
              if ( support != null ) {
                String request = event.context().toString();
                if ( SHUTDOWN.equals(request) ) {
                  support.setShutdown(true);
                  request = OFFLINE;
                }
                ClusterConfig config = support.getConfig(x, support.getConfigId());
                config = (ClusterConfig) config.fclone();
                if ( OFFLINE.equals(request) &&
                     config.getStatus() != Status.OFFLINE ) {
                  config.setStatus(Status.OFFLINE);
                  ((DAO) x.get("localClusterConfigDAO")).put(config);
                } else if ( ONLINE.equals(request) &&
                            config.getStatus() != Status.ONLINE ) {
                  config.setStatus(Status.ONLINE);
                  ((DAO) x.get("localClusterConfigDAO")).put(config);
                } else if ( DISSOLVE.equals(request) &&
                            config.getStatus() == Status.ONLINE &&
                            config.getType() == MedusaType.MEDIATOR ) {
                  ElectoralService electoral = (ElectoralService) x.get("electoralService");
                  electoral.dissolve(x);
                } else if ( SIR.equals(request) &&
                            config.getType() == MedusaType.MEDIATOR ) {
                  try {
                    Path file = path.resolve(event.context().toString());
                    String contents = Files.readAllLines(file).get(0);
                    logger.info("SIR contents", contents);
                    if ( ! SafetyUtil.isEmpty(contents) ) {
                      List<Long> sir =
                        Arrays.stream(contents
                         .split(","))
                         .map(String::trim)
                         .map(Long::valueOf)
                         .collect(Collectors.toList());
                       logger.warning("SIR", sir.toString());
                       support.setSir(sir);
                    } else {
                      logger.warning("SIR ignored, system is not replaying");
                    }
                  } catch (Exception e) {
                    logger.warning("SIR processing failed", e.getMessage());
                  }
                }
                break;
              }
            }
          }
          key.reset();
        }
        logger.info("exit");
      } catch (IOException e) {
        logger.error("exit", e);
      } catch (InterruptedException e) {
        // noop
      }
      `
    }
  ]
});
