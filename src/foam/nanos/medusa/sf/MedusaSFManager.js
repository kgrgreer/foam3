/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.sf',
  name: 'MedusaSFManager',
  extends: 'foam.box.sf.SFManager',
  
  javaImports: [
    'foam.box.sf.*',
    'foam.box.sf.SF',
    'foam.box.sf.SFManager',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.EasyDAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.fs.FileSystemStorage',
    'foam.nanos.fs.Storage',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.util.retry.RetryForeverStrategy',
    'foam.util.retry.RetryStrategy',
    'java.nio.file.attribute.*',
    'java.util.*',
    'java.util.PriorityQueue'
  ],

  constants: [
    {
      type: 'Integer',
      name: 'MAXIMUM_REPLAY_DAYS',
      value: 365
    }
  ],
  
  properties: [
    {
      class: 'Int',
      name: 'medusaTimeWindow',
      units: 's',
      value: -1
    },
    {
      name: 'medusaRetryStrategy',
      class: 'FObjectProperty',
      of: 'foam.util.retry.RetryStrategy',
      javaFactory: `
      return (new RetryForeverStrategy.Builder(null))
      .setRetryDelay(1000)
      .build();
      `
    },
    {
      class: 'Int',
      name: 'medusaFileCapacity',
      value: 4096
    },
    {
      class: 'String',
      name: 'folderName',
      value: '../saf/'
    },
    {
      class: 'Int',
      documentation: 'set 0 or less replay nothing; set to MAXIMUM_REPLAY_DAYS or bigger replay all',
      name: 'replayStrategy',
      units: 'days',
      javaSetter: `
        replayStrategyIsSet_ = true;
        if ( val <= 0 ) replayStrategy_ = 0;
        else if ( val >=  MAXIMUM_REPLAY_DAYS ) replayStrategy_ = MAXIMUM_REPLAY_DAYS;
        else replayStrategy_ = val;
      `,
      value: 0
    }
  ],
  
  methods: [
    {
      documentation: 'override start method for medusa',
      name: 'start',
      javaCode: `
      super.start();

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      final X context = getX();

      //Setup SF between mediators.
      final SFManager manager = this;
      if ( myConfig.getType() == MedusaType.MEDIATOR ) {
        for ( ClusterConfig config : support.getSfBroadcastMediators() ) {
          try {
            getLogger().info("findMediator: " + config.getId());
            if ( config.getId().equals(myConfig.getId()) ) continue;
            
            SF sf = new SFMedusaClientDAO.Builder(context)
            .setId(config.getId())
            .setFileName(config.getId())
            .setTimeWindow(getMedusaTimeWindow())
            .setFileCapacity(getMedusaFileCapacity())
            .setRetryStrategy(getMedusaRetryStrategy())
            .setMyConfig(myConfig)
            .setToConfig(config)
            .setManager(manager)
            .build();
            sf.setX(context);
            sf.initial(context);
            sf.setReady(true);
            getSfs().put(sf.getId(), sf);
            getLogger().info("Initialize successfully: " + sf.getId());
          } catch ( Throwable t ) {
            getLogger().error(config.getId(), t);
          }
        }
      }
      `
    },
    {
      name: 'getFileSuffix',
      documentation: 'help method to get suffix from file name',
      javaType: 'int',
      args: 'String filename',
      javaCode: `
        return Integer.parseInt(filename.split("\\\\.")[filename.split("\\\\.").length-1]);
      `
    },
  ]
});
