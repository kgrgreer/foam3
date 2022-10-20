/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigSupportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Reset ClusterConfigSupport properties on ClusterConfig changes`,

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfig nu = (ClusterConfig) getDelegate().put_(x, obj);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      ClusterConfigSupport.BROADCAST_MEDIATORS.clear(support);
      ClusterConfigSupport.NODE_COUNT.clear(support);
      ClusterConfigSupport.NODE_QUORUM.clear(support);
      ClusterConfigSupport.SF_BROADCAST_MEDIATORS.clear(support);
      return nu;
      `
    }
  ]
});
