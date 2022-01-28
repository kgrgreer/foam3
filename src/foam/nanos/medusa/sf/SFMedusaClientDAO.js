/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.sf',
  name: 'SFMedusaClientDAO',
  extends: 'foam.box.sf.SFDAO',
  
  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.box.sf.SFEntry',
    'foam.box.sf.SFManager'
  ],
  
  properties: [
    {
      name: 'myConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'toConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig'
    },
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "sfBroadcastReceiverDAO";
      `
    },
    {
      class: 'Proxy',
      of: 'foam.dao.DAO',
      name: 'delegate',
      transient: true,
      javaSetter: `
      if ( ! delegateIsSet_ ) {
        delegate_ = val;
        delegateIsSet_ = true;
      }
      `,
      javaGetter: ` 
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      DAO dao = support.getBroadcastClientDAO(getX(), getServiceName(), getMyConfig(), getToConfig());
      return dao;
      `
    }
  ],
  
  methods: [
    {
      name: 'put',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);     
        return this.storeAndForward((FObject) obj);     
      return this.storeAndForward((FObject) obj);     
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
      getDelegate().put(entry);
      `
    },
    {
      name: 'put_',
      code: function() {},
      swiftCode: '// NOOP',
      javaCode: `
      return this.storeAndForward((FObject) obj);      
        return this.storeAndForward((FObject) obj);      
      return this.storeAndForward((FObject) obj);      
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
      `
    },
  ]
})