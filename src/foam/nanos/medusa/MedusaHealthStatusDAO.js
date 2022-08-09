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
    'foam.nanos.logger.Loggers'
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
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(nu.getId());
      if ( config != null && // May have recieved a base Health object.
           ( old == null ||
             old.getStatus() != nu.getStatus() ||
             old.getMedusaStatus() != nu.getMedusaStatus() ||
             old.getBootTime() != nu.getBootTime() ||
             nu.getMedusaStatus() != config.getStatus() ||
             nu.getIsPrimary() != config.getIsPrimary() ) ) { 
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        Agency agency = (Agency) x.get(support.getThreadPoolName());
        // Loggers.logger(x, this).debug("agency", "ClusterConfigMonitorAgent", nu.getId());
        agency.submit(x, new ClusterConfigMonitorAgent(x, nu.getId()), this.getClass().getSimpleName());
      }
      return nu;
      `
    }
  ]
});
