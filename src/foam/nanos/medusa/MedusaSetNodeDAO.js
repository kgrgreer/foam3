/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaSetNodeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Set 'node' property, so when broadcast we know where it's coming from`,

  javaImports: [
    'foam.nanos.logger.Loggers'
  ],

  javaCode: `
  public MedusaSetNodeDAO(foam.core.X x, foam.dao.DAO delegate) {
    super(x);
    setDelegate(delegate);
  }
  `,
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      // REVIEW: When entries are written to STANDBY Nodes by STANDBY Mediator, if the Node property is not updated, then all entries have same node value and later replay fails as consensus count is always 1. 
      if ( myConfig.getRegionStatus() == RegionStatus.ACTIVE ||
           myConfig.getType() == MedusaType.NODE &&
           ! support.getConfigId().equals(entry.getNode()) ) {
        if ( entry.isFrozen() ) {
          entry = (MedusaEntry) entry.fclone();
        }
        entry.setNode(support.getConfigId());
      }
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
