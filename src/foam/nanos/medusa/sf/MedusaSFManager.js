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
    'foam.core.X',
    'foam.box.sf.SFManager',
    'foam.box.sf.SF',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.util.retry.RetryStrategy',
    'foam.util.retry.RetryForeverStrategy',
    'java.util.PriorityQueue',
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
  ],
  
  methods: [
    {
      documentation: 'override start method for medusa',
      name: 'start',
      javaCode: `
      super.start();
      
      final SFManager manager = this;
      X context = getX();
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
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
    }
  ]
});