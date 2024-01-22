/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaSupport',

  documentation: `Provided for the nanos system to determine if the
application is running in clustered environment and if should be
responsible for tasks which should only run on the primary.
This model is refined by the real medusa system to use the
real ClusterConfigSupport.
See MedusaSupportRefinement
`,

  methods: [
    {
      documentation: `check for primary as clusterable cron jobs should
only run on the primary mediator.`,
      name: 'cronEnabled',
      args: 'Context x, boolean clusterable',
      type: 'Boolean',
      javaCode: 'return true;'
    },
    {
      documentation: 'test if system is replaying',
      name: 'isReplaying',
      args: 'Context x',
      type: 'Boolean',
      javaCode: 'return false;'
    },
    {
      documentation: `Decorate the root serviceDAO to 'cluster' serviceDAO updates`,
      name: 'clusterServiceDAO',
      args: 'Context x, foam.dao.DAO delegate',
      type: 'foam.dao.DAO',
      javaCode: 'return delegate;'
    }
  ]
});
