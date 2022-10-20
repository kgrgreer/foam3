/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'DaggerVerifyBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.bench.Benchmark',
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
      name: 'sampleSize',
      class: 'Int',
      value: 1000
    },
    {
      name: 'entries',
      class: 'Int'
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
      name: 'setup',
      javaCode: `
    DAO dao = (DAO) x.get("medusaTestObjectDAO");
    for ( int i = 0; i < getSampleSize(); i++ ) {
      MedusaTestObject test = new MedusaTestObject();
      test.setDescription("MedusaTestObject");
      dao.put(test);
    }
    Count count = (Count) dao.select(new Count());
    setEntries((int) count.getValue());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
    DaggerService dagger = (DaggerService) x.get("daggerService");
    DAO dao = (DAO) x.get("medusaEntryDAO");
    MedusaEntry entry = null;
    for ( int i = 0; i < 10; i++ ) {
      long index = (long) (Math.random() * getEntries());
      if ( index < 3 ) {
        continue;
      }
      entry = (MedusaEntry) dao.find(EQ(MedusaEntry.INDEX, index));
      if ( entry != null ) {
        break;
      }
    }
    if ( entry != null ) {
      try {
        dagger.verify(x, entry);
      } catch ( foam.nanos.medusa.DaggerException e ) {
        getLogger().warning(e.getMessage());
      }
    } else {
      getLogger().warning("Failed to find entry");
    }
      `
    }
  ]
});
