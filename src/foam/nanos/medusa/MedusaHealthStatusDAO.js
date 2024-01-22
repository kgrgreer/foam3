/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaHealthStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Execute a ClusterConfigMonitorAgent to securely retreive possibly updated ClusterConfig changes.`,

  javaImports: [
    'foam.core.Agency',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.util.HashMap',
  ],

  properties: [
    {
      name: 'agents',
      class: 'Map',
      javaFactory: `return new HashMap();`
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( ! ( obj instanceof MedusaHealth ) ) {
        return getDelegate().put_(x, obj);
      }
      MedusaHealth nu = (MedusaHealth) obj;
      MedusaHealth old = (MedusaHealth) getDelegate().find_(x, nu.getId());
      nu = (MedusaHealth) getDelegate().put_(x, nu);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(nu.getId());
      if ( config != null && // May have recieved a base Health object.
           ! config.getId().equals(myConfig.getId()) && 
           ( old == null ||
             old.getStatus() != nu.getStatus() ||
             old.getMedusaStatus() != nu.getMedusaStatus() ||
             old.getBootTime() != nu.getBootTime() ||
             nu.getMedusaStatus() != config.getStatus() ||
             nu.getIsPrimary() != config.getIsPrimary() ) ) {

        ClusterConfigMonitorAgent agent = (ClusterConfigMonitorAgent) getAgents().get(config.getId());
        if ( agent == null ) {
          agent = new ClusterConfigMonitorAgent(x, config.getId());
          getAgents().put(config.getId(), agent);
        }
        Agency agency = (Agency) x.get(support.getThreadPoolName());
        // Loggers.logger(x, this).debug("agency", "ClusterConfigMonitorAgent", config.getId());
        agency.submit(x, agent, this.getClass().getSimpleName());
      }

      if ( config != null && 
           config.getType() == MedusaType.MEDIATOR &&
           config.getStatus() == Status.ONLINE && 
           nu.getIndex() > 0 &&
           old != null &&
           old.getIndex() != nu.getIndex() &&
           old.getIndex() > 0 ) {
        long delta = nu.getIndex() - old.getIndex();
        // if ( old != null ) delta -= old.getIndex();
        // explicit fold manager, fold for state
        ((foam.nanos.analytics.FoldManager) getX().get("ccomFoldManager"/*getFoldManagerContextKey()*/)).foldForState("medusa.index."+nu.getId(), new java.util.Date(nu.getHeartbeatTime()), delta);
      }

      return nu;
      `
    }
  ]
});
