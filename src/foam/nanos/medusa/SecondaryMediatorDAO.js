/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'SecondaryMediatorDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaEntryMediatorDAO'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config.getIsPrimary() ) {
        return getDelegate().put_(x, obj);
      }

      PM pm = PM.create(x, this.getClass().getSimpleName(), "put");
      MedusaEntry entry = (MedusaEntry) obj;
      try {
        // forward on to next mediator
        ClusterConfig serverConfig = support.getNextServer();
        DAO dao = support.getClientDAO(x, getServiceName(), config, serverConfig);
        // dao = new RetryClientSinkDAO.Builder(x)
          //             .setDelegate(dao)
          //             .setMaxRetryAttempts(support.getMaxRetryAttempts())
          //             .setMaxRetryDelay(support.getMaxRetryDelay())
          //             .build();
        // Loggers.logger(x, this).debug("put", "request", "to", serverConfig.getId(), getServiceName());
        return dao.put_(x, obj);
      } catch (Throwable t) {
        pm.error(x, entry.toSummary(), t);
        Loggers.logger(x, this).error("put", entry.toSummary(), t.getMessage(), t);
        throw t;
      } finally {
        pm.log(x);
      }
      `
    }
   ]
});
