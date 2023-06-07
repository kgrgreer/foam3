/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'MedusaCUTestBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  documentation: 'Create AND update a MedusaTestObject.',
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
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count'
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
    // create an update for later compaction testing
    test = (MedusaTestObject) test.fclone();
    test.setDescription(test.getDescription()+"-"+test.getDescription());
    test.setData(test.getData()+"-"+test.getData());
    test = (MedusaTestObject) ((DAO) x.get(getServiceName())).put(test);
      `
    },
    {
      name: 'teardown',
      javaCode: `
      // double stats as each operation is a create followed by an update.
      br.setPass(br.getPass() * 2);
      br.setFail(br.getFail() * 2);
      DAO dao = (DAO) x.get("medusaEntryDAO");
      Count entries = (Count) dao.select(new Count());
      if ( entries.getValue() > 0 ) {
        br.getExtra().put("MedusaEntries", entries.getValue());
      } else {
        br.getExtra().put("MedusaEntries", "0");
      }
      `
    }
  ]
});
