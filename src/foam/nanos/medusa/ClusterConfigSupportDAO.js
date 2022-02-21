/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigSupportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Monitor the ClusterConfig DAO and resets a selection of ClusterConfigSupport properties when configuration changes.`,

  javaImports: [
    'foam.nanos.logger.Loggers'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      // // test equality before delegate.put to avoid lastModified skewing results.
      // if ( old == null ||
      //      ! old.equals(nu) ) {
      //   ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      //   support.reset(x);
      //   // support.hasQuorum(x);
      // }
      return nu;
      `
    }
  ]
});
