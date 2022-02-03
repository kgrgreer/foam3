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
    'foam.nanos.pm.PM',
    'foam.box.sf.SFEntry',
    'foam.box.sf.SFManager'
  ],
  
  properties: [
    {
      name: 'myConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaSetter: `
      myConfig_ = val;
      myConfigIsSet_ = true;
      DELEGATE.clear(this);
      `
    },
    {
      name: 'toConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaSetter: `
      toConfig_ = val;
      toConfigIsSet_ = true;
      DELEGATE.clear(this);
      `
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
      javaFactory: `
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
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
      PM pm = new PM("SMMedusaClientDAO", "submit", getMyConfig().getId(), getToConfig().getId());
      try {
        getDelegate().put(entry);
      } catch (RuntimeException e) {
        pm.error(x, e);
        throw e;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
      `
    },
  ]
});
