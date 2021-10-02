/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.nanos.bench',
   name: 'BenchmarkRunnerScript',
   extends: 'foam.nanos.script.Script',

   documentation: `Executes command line BenchmarkRunner requests.  ./build.sh -BbenchmarkRunnerId`,

   javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.script.Language',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.bench.BenchmarkRunner',
    'foam.nanos.logger.LogLevelFilterLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.*',
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
      name: 'failedBenchmarkRunnersList',
      class: 'FObjectArray',
      of: 'BenchmarkRunner'
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

        // turn off logging to get rid of clutter.
        LogLevelFilterLogger loggerFilter = (LogLevelFilterLogger) x.get("logger");
        loggerFilter.setLogDebug(false);
        loggerFilter.setLogInfo(false);

        DAO dao = (DAO) x.get("benchmarkRunnerDAO");
        dao = dao.where(EQ(BenchmarkRunner.ENABLED, true));
        List<BenchmarkRunner> runners = ((ArraySink) dao.select(new ArraySink())).getArray();

        List<String> selectedBenchmarkRunners = null;
        if ( ! SafetyUtil.isEmpty(System.getProperty("foam.benchmarks")) ){
          String t = System.getProperty("foam.benchmarks");
          selectedBenchmarkRunners = Arrays.asList(t.split(","));
        }

        for ( BenchmarkRunner runner : runners ) {
          if ( selectedBenchmarkRunners != null ) {
            if ( selectedBenchmarkRunners.contains(runner.getId()) ||
                 selectedBenchmarkRunners.contains(runner.getName()) ) {
              executeBenchmarkRunner(x, runner);
            } else {
              continue;
            }
          } else {
            executeBenchmarkRunner(x, runner);
          }
        }

        int result = selectedBenchmarkRunners != null ? selectedBenchmarkRunners.size() : runners.size();
        System.out.println("DONE RUNNING " + result + " BenchmarkRunners");
        System.exit(0);
      `
    },
    {
      name: 'executeBenchmarkRunner',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'runner', type: 'foam.nanos.bench.BenchmarkRunner'
        }
      ],
      javaCode: `
        try {
          runner.execute(x);
        }
        catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error(e);
          addToFailedBenchmarkRunnersList(runner);
        }
      `
    },
    {
      name: 'addToFailedBenchmarkRunnersList',
      args: [
        {
          name: 'runner', javaType: 'BenchmarkRunner'
        }
      ],
      javaCode: `
        BenchmarkRunner[] failedBenchmarkRunners = getFailedBenchmarkRunnersList();
        BenchmarkRunner[] temp = new BenchmarkRunner[failedBenchmarkRunners.length+1];
        for ( int i = 0; i < failedBenchmarkRunners.length; i++ ) {
          temp[i] = failedBenchmarkRunners[i];
        }
        temp[failedBenchmarkRunners.length]=runner;
        setFailedBenchmarkRunnersList(temp);`
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
