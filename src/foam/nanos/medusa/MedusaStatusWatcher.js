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
    'java.util.Timer',
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

  properties: [
    {
      name: 'watchDir',
      class: 'String',
      javaFactory: 'return System.getProperty("java.io.tmpdir", "/tmp");'
    },
    {
      name: 'statusFilename',
      class: 'String',
      value: 'OFFLINE'
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 60000
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      timer.schedule(
        new AgencyTimerTask(getX(), /*support.getThreadPoolName(),*/ this),
        getInitialTimerDelay());
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) x.get("logger"));
      logger.info("execute", getWatchDir());
      try {
        Path existing = Paths.get(getWatchDir(), getStatusFilename());
        Files.deleteIfExists(existing);
        existing.toFile().deleteOnExit();

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
                 getStatusFilename().equals(event.context().toString()) ) {
              logger.warning("detected", event.context());

              ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
              if ( support != null ) {
                ClusterConfig config = support.getConfig(x, support.getConfigId());
                config = (ClusterConfig) config.fclone();
                config.setStatus(Status.OFFLINE);
                ((DAO) x.get("localClusterConfigDAO")).put(config);
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
