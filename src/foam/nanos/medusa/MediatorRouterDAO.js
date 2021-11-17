/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MediatorRouterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Router MedusaEntry to 'next' mediator, if not Primary.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
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
      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());

        if ( ! config.getIsPrimary() ) {
          // forward on to next mediator
          ClusterConfig serverConfig = support.getNextServer();
          DAO dao = support.getClientDAO(x, getServiceName(), config, serverConfig);
          // dao = new RetryClientSinkDAO.Builder(x)
          //             .setDelegate(dao)
          //             .setMaxRetryAttempts(support.getMaxRetryAttempts())
          //             .setMaxRetryDelay(support.getMaxRetryDelay())
          //             .build();
          Loggers.logger(x, this).debug("put", "request", "to", serverConfig.getId(), getServiceName());
          return dao.put_(x, obj);
        }
        return getDelegate().put_(x, obj);
      } catch (Throwable t) {
        MedusaEntry entry = (MedusaEntry) obj;
        Loggers.logger(x, this).error("put", entry.toSummary(), t.getMessage(), t);
        throw t;
      }
      `
    }
   ]
});
