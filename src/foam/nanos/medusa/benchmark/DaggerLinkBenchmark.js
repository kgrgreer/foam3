/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'DaggerLinkBenchmark',
  extends: 'foam.nanos.bench.Benchmark',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.MedusaEntry',
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.medusa.test.MedusaTestObject'
  ],

  properties: [
    {
      name: 'sampleSize',
      type: 'Int',
      value: 1000,
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
      DaggerService dagger = (DaggerService) x.get("daggerService");
      dagger.link(x, x.create(MedusaEntry.class));
      `
    }
  ]
});
