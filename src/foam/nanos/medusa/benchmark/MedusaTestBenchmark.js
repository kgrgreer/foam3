/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'MedusaTestBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.MedusaEntry',
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.medusa.test.MedusaTestObject',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaTestObjectDAO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
      Logger logger = (Logger) getX().get("logger");
      if ( logger == null ) {
        logger = StdoutLogger.instance();
      }
      return new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
    MedusaTestObject test = new MedusaTestObject();
    test.setDescription("MedusaTestObject");
    test.setData("MedusaTestObject");
    test = (MedusaTestObject) ((DAO) x.get(getServiceName())).put(test);
      `
    }
  ]
});
