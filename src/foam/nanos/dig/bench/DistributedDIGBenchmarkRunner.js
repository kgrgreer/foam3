/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.dig.bench',
  name: 'DistributedDIGBenchmarkRunner',
  extends: 'foam.nanos.bench.BenchmarkRunner',

  javaImports: [
    'foam.nanos.bench.Benchmark',
    'foam.nanos.bench.BenchmarkRunner',
    'foam.nanos.dig.DIG',
    'foam.nanos.dig.bench.DIGBenchmark',
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.AUIDGenerator',
    'foam.util.UIDGenerator',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.util.HashMap',
    'java.util.Map',
  ],

  properties: [
    {
      name: 'digBenchmark',
      class: 'FObjectProperty',
      of: 'foam.nanos.dig.bench.DIGBenchmark'
    },
    {
      documentation: 'Poll for completion or error in milliseconds',
      name: 'pollInterval',
      class: 'Long',
      units: 'ms',
      value: 10000
    },
    {
      documentation: 'Maximum time to wait for completion or error in minutes',
      name: 'maxWait',
      class: 'Long',
      units: 'm',
      value: 10
    },
    {
      name: 'runners',
      class: 'Map',
      javaFactory: 'return new HashMap<String, BenchmarkRunner>();'
    }
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
      try {
      final Logger logger = Loggers.logger(x, this);
      final UIDGenerator uid = new AUIDGenerator(x, this.getClass().getName());
      final BenchmarkRunner self = this;
      final Benchmark benchmark = getBenchmark(x);
      final DIGBenchmark digBenchmark = getDigBenchmark();
      AssemblyLine line = new AsyncAssemblyLine(x);
      for ( String url : digBenchmark.getUrls() ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DIG dig = new DIG(x, "benchmarkDAO", digBenchmark);
            dig.setPostURL(url);
            dig.put(benchmark);

            BenchmarkRunner runner = new BenchmarkRunner();
            runner.copyFrom(self);
            runner.setId(uid.getNextString());
            runner.setStatus(ScriptStatus.SCHEDULED);
            runner.setClusterable(false);
            dig.setNSpecName("benchmarkRunnerDAO");
            runner = (BenchmarkRunner) dig.put(runner);
            getRunners().put(url, runner);
            long waited = 0;
            while ( waited < getMaxWait() ) {
              try {
                Thread.currentThread().sleep(getPollInterval());
                runner = (BenchmarkRunner) dig.find(runner.getId());
                if ( runner.getStatus() == ScriptStatus.RUNNING ) {
                  getRunners().put(url, runner);
                  break;
                }
                waited += getPollInterval();
              } catch ( InterruptedException e ) {
                break;
              }
            }
          }
        });
      }
      logger.debug("line.shutdown", "wait");
      line.shutdown();
      logger.debug("line.shutdown", "continue");
      for ( Object key : getRunners().keySet() ) {
        BenchmarkRunner runner = (BenchmarkRunner) getRunners().get(key);
        if ( runner != null ) {
          logger.info("result", key, runner.getStatus());
        } else {
          logger.info("result", key, "null");
        }
      }
      } catch (Throwable t) {
        throw new RuntimeException(t);
      }
      `
    }
  ]
});
