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
    'foam.nanos.logger.Loggers'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaHealth nu = (MedusaHealth) obj;
      MedusaHealth old = (MedusaHealth) getDelegate().find_(x, nu.getId());
      nu = (MedusaHealth) getDelegate().put_(x, nu);
      if ( old == null ||
           old.getStatus() != nu.getStatus() ||
           old.getMedusaStatus() != nu.getMedusaStatus() ||
           old.getBootTime() != nu.getBootTime() ) {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        Agency agency = (Agency) x.get(support.getThreadPoolName());
        Loggers.logger(x, this).info("agency", "ClusterConfigMonitorAgent", nu.getId());
        agency.submit(x, new ClusterConfigMonitorAgent(x, nu.getId()), this.getClass().getSimpleName());
      }
      return nu;
      `
    }
  ]
});
