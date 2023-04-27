/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.medusa.sf',
  name: 'SFBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.box.sf.SFEntry',
    'foam.box.sf.SFManager'
  ],
  
  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec'
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'boxThreadPool'
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
        this.getClass().getSimpleName(),
        getNSpec().getName()
      }, (Logger) getX().get("logger"));
      `
    }
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      FObject o = getDelegate().put_(x, obj);
      broadcast(x, o, DOP.PUT);
      return o;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject o = getDelegate().remove_(x, obj);
      broadcast(x, o, DOP.REMOVE);
      return o;
      `
    },
    {
      documentation: 'Broadcast to mediators',
      name: 'broadcast',
      args: 'Context x, FObject obj, DOP dop',
      javaCode: `
      //Find other mediators and send.
      
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      
      if ( myConfig.getType() != MedusaType.MEDIATOR || myConfig.getStatus() != Status.ONLINE ) return;
      
      final SFManager sfManager = (SFManager) x.get("sfManager");
      
      SFEntry entry = x.create(SFEntry.class);
      entry.setNSpecName(getNSpec().getName());
      entry.setDop(dop);
      entry.setObject(obj);
      
      Agency agency = (Agency) x.get(getThreadPoolName());
      for ( ClusterConfig config : support.getSfBroadcastMediators() ) {
        if ( config.getId().equals(myConfig.getId()) ) continue;
        agency.submit(x, new ContextAgent() {
          public void execute(X x) {
            try {
              DAO clientDAO = (DAO) sfManager.getSfs().get(config.getId());
              clientDAO.put((SFEntry) entry.fclone());
            } catch ( Throwable t ) {
              getLogger().error(config.getId(), t);
            }
          }
        }, this.getClass().getSimpleName());
      }
      
      return;
      `
    }
  ]
});
