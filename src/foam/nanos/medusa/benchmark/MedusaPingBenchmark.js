/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'MedusaPingBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  documentation: `for some sample size, ping all instances in cluster.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.Status',
    'foam.nanos.pm.PM',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NOT',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'clusterConfigDAO'
    },
    {
      documentation: 'This/self cluster config',
      name: 'config',
      class: 'FObjectProperty',
      javaSetter: `
      // explicit setter to suppress the generated 'assertNotFrozen'
      config_ = val;
      configIsSet_ = true;
      `
    },
    {
      name: 'clients',
      class: 'Array',
      javaSetter: `
      // explicit setter to suppress the generated 'assertNotFrozen'
      clients_ = val;
      clientsIsSet_ = true;
      `
    },
    {
      name: 'configs',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
      Logger logger = (Logger) getX().get("logger");
      if ( logger == null ) {
        logger = StdoutLogger.instance();
      }
      return new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'setup',
      javaCode: `
        if ( getConfigs().size() > 0 ) {
          return;
        }

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        setConfig(config);

        DAO dao = (DAO) x.get("localClusterConfigDAO");
        List<ClusterConfig> configs = (ArrayList) ((ArraySink) dao
          .where(
            AND(
              EQ(ClusterConfig.ENABLED, true),
              NOT(EQ(ClusterConfig.ID, config.getId())),
              EQ(ClusterConfig.REALM, config.getRealm()),
              EQ(ClusterConfig.STATUS, Status.ONLINE)
            ))
            .select(new ArraySink())).getArray();
        List<DAO> clients = new ArrayList();
        for ( ClusterConfig cfg : configs ) {
          DAO client = support.getClientDAO(x, getServiceName(), config, cfg);
          clients.add(client);
          getConfigs().put(client, cfg);
          getLogger().info("created,client", cfg.getId());
        }
        setClients(clients.toArray());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      if ( getClients().length == 0 ) {
        throw new RuntimeException("No clients found");
      }
      java.util.Random random = new java.util.Random();
      int index = random.nextInt(getClients().length);
      DAO client = (DAO) getClients()[index];
      ClusterConfig cfg = (ClusterConfig) getConfigs().get(client);
      if ( cfg == null ) {
       throw new RuntimeException("Client not found "+index);
      }
      PM pm = new PM(this.getClass().getSimpleName(), cfg.getId(), "ping");
      PingCmd cmd = new PingCmd();
      cmd.setDestination(cfg.getId());
      cmd.setStart(System.currentTimeMillis());
      cmd = (PingCmd) client.cmd(cmd);
      cmd.setEnd(System.currentTimeMillis());
      pm.log(x);
      `
    }
  ]
});
