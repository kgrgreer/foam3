/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger.benchmark',
  name: 'LoggerBenchmark',
  implements: [ 'foam.nanos.bench.Benchmark' ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.app.AppConfig',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'savedMode',
      class: 'Enum',
      of: 'foam.nanos.app.Mode'
    },
  ],

  methods: [
    {
      name: 'setup',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      AppConfig config = (AppConfig) x.get("appConfig");
      setSavedMode(config.getMode());
      // Something such that file system is not used.
      config.setMode(foam.nanos.app.Mode.STAGING);
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
    AppConfig config = (AppConfig) x.get("appConfig");
    Logger logger = (Logger) x.get("logger");
    logger.warning(this.getClass().getSimpleName(), "mode", config.getMode(), System.currentTimeMillis());
      `
    },
    {
      name: 'teardown',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'stats',
          type: 'Map'
        }
      ],
      javaCode: `
      AppConfig config = (AppConfig) x.get("appConfig");
      config.setMode(getSavedMode());
      `
    }
  ]
});
