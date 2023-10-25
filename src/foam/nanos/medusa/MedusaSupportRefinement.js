/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaSupportRefinement',
  refines: 'foam.nanos.medusa.MedusaSupport',

  documentation: 'Enabled by the main medusa pom.',

  javaImports: [
    'foam.nanos.medusa.ClusterConfigSupport'
  ],

  methods: [
    {
      documentation: `check for primary as clusterable cron jobs should
only run on the primary mediator.`,
      name: 'cronEnabled',
      args: 'Context x, boolean clusterable',
      type: 'Boolean',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      return support.cronEnabled(x, clusterable);
      `
    },
    {
      documentation: 'test if system is replaying',
      name: 'isReplaying',
      args: 'Context x',
      type: 'Boolean',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      return support.isReplaying(x);
      `
    },
    {
      documentation: `Decorate the root serviceDAO to 'cluster' serviceDAO updates`,
      name: 'clusterServiceDAO',
      args: 'Context x, foam.dao.DAO delegate',
      type: 'foam.dao.DAO',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      return support.clusterServiceDAO(x, delegate);
      `
    }
  ]
})
