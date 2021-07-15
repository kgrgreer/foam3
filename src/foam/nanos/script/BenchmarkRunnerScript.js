/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.script',
  name: 'BenchmarkRunnerScript',
  extends: 'foam.nanos.script.Script',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.script.Language',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.bench.BenchmarkRunner',
    'java.util.*',
    'foam.nanos.logger.LogLevelFilterLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    ' net.nanopay.tx.bench.BepayBenchmark',
    ' net.nanopay.tx.bench.IntuitBenchmark',
    ' net.nanopay.tx.bench.TrevisoBenchmark'
  ],
  constants: [
    {
      name: 'CHECK_MARK',
      type: 'String',
      value: '\u2713'
    },
    {
      name: 'CROSS_MARK',
      type: 'String',
      value: '\u2718'
    },
    {
      name: 'GREEN_COLOR',
      type: 'String',
      value: '\u001B[32m'
    },
    {
      name: 'RED_COLOR',
      type: 'String',
      value: '\u001B[31m'
    },
    {
      name: 'RESET_COLOR',
      type: 'String',
      value: '\u001B[0m'
    }
  ],
  properties: [
    {
      name: 'failedBenchmarksList',
      class: 'FObjectArray',
      of: 'Benchmark'
    }
  ],

  methods: [
    {
      name: 'runScript',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
//        foam.core.XLocator.set(x);

        // turn off logging to get rid of clutter.
        LogLevelFilterLogger loggerFilter = (LogLevelFilterLogger) x.get("logger");
        loggerFilter.setLogDebug(false);
        loggerFilter.setLogInfo(false);
        loggerFilter.setLogWarning(false);

        DAO benchmarkDAO = (DAO) x.get("benchmarkDAO");
        ArraySink benchmarks = (ArraySink) benchmarkDAO.select(new ArraySink());
        List benchmarkArray = benchmarks.getArray();

        List<String> selectedBenchmarks = null;
        if ( ! SafetyUtil.isEmpty(System.getProperty("foam.benchmarks")) ){
          String t = System.getProperty("foam.benchmarks");
          selectedBenchmarks = Arrays.asList(t.split(","));
        }

        for ( int i = 0; i < benchmarkArray.size(); i ++ ) {
          Benchmark benchmark = (Benchmark) benchmarkArray.get(i);

          if ( selectedBenchmarks != null ) {
            if ( selectedBenchmarks.contains(benchmark.getId()) ) {
              runBenchmark(x, benchmark);
            } else {
              continue;
            }
          } else {
            runBenchmark(x, benchmark);
          }
        }

        System.out.println("DONE RUNNING " + benchmarkArray.size() + " Benchmarks");
        System.exit(0);
      `
    },
    {
      name: 'runBenchmark',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'benchmark', type: 'foam.nanos.bench.Benchmark'
        }
      ],
      javaCode: `
        try {
          BenchmarkRunner runner = new BenchmarkRunner.Builder(x)
            .setInvocationCount(1)
            .setThreadCount(1)
            .setRunPerThread(false)
            .setBenchmark(benchmark)
            .build();
          runner.execute(x);
        }
        catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error(e);
          addToFailedBenchmarksList(benchmark);
        }
      `
    },
    {
      name: 'addToFailedBenchmarksList',
      args: [
        {
          name: 'benchmark', javaType: 'Benchmark'
        }
      ],
      javaCode: `
        Benchmark[] failedBenchmarks = getFailedBenchmarksList();
        Benchmark[] temp = new Benchmark[failedBenchmarks.length+1];
        for ( int i = 0;i < failedBenchmarks.length; i++ ) {
          temp[i] = failedBenchmarks[i];
        }
        temp[failedBenchmarks.length]=benchmark;
        setFailedBenchmarksList(temp);`
    },
    {
      name: 'printBold',
      args: [
        {
          name: 'message', type: 'String'
        }
      ],
      javaCode: 'System.out.println("\\033[0;1m" + message + RESET_COLOR);'
    }
  ]
});
