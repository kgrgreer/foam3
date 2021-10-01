/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkRunner',

  implements: [
    'foam.core.ContextAgent',
    'foam.core.ContextAware',
    'foam.nanos.auth.EnabledAware',
  ],

  mixins: [
    'foam.nanos.auth.LastModifiedAwareMixin'
  ],

  imports: [
    'benchmarkResultDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.csv.CSVOutputterImpl',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'java.math.BigDecimal',
    'java.math.RoundingMode',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.CountDownLatch',
    'java.util.concurrent.atomic.AtomicLong'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  // legacy support so not to break 'scripts'. This suppresses
  // output to logger, which results in duplicate output, as
  // this runner already outputs the results.

  public String getResult() {
    return "";
  }

  public String formatResults() {
    return "";
  }
          `
        }));
      }
    }
  ],

  sections: [
    {
      name: 'benchmarkResultsSection',
      title: 'Results',
      order: 2
    },
    {
      name: '_defaultSection',
      title: 'Info',
      order: 1
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
    },
    {
      class: 'Int',
      name: 'threadCount'
    },
    {
      class: 'Boolean',
      name: 'runPerThread'
    },
    {
      class: 'Boolean',
      name: 'reverseThreads'
    },
    {
      class: 'Int',
      name: 'invocationCount'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.bench.Benchmark',
      name: 'benchmarkId'
    },
    {
      documentation: 'Used by scripts which create a benchmark inline.',
      class: 'FObjectProperty',
      of: 'foam.nanos.bench.Benchmark',
      name: 'benchmark',
      storageTransient: true
    },
    {
      class: 'Boolean',
      name: 'clearPMs',
      docmentation: 'clear PMs before executing the benchmark',
    },
    {
      class: 'Object',
      name: 'results',
      javaFactory: 'return new ArrayList();',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 140,
      storageTransient: true,
      storageOptional: true
    },
  ],

  methods: [
    {
      name: 'execute',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      final Benchmark benchmark;
      if ( getBenchmark() != null ) {
        benchmark = getBenchmark();
      } else {
        benchmark = (Benchmark) this.findBenchmarkId(x);
      }
      Logger log = (Logger) x.get("logger");
      if ( log != null ) {
        log = new foam.nanos.logger.StdoutLogger();
      }
      final Logger logger = new PrefixLogger(new String[] { benchmark.getClass().getSimpleName() }, log);

      AppConfig config = (AppConfig) x.get("appConfig");
      if ( config.getMode() == Mode.PRODUCTION ) {
        logger.warning("Benchmark execution disabled in PRODUCTION");
        return;
      }

      logger.info("execute", benchmark.getClass().getSimpleName());

      int availableThreads = Math.min(Runtime.getRuntime().availableProcessors(), getThreadCount());
      int run = 1;
      int threads = 1;

      if ( ! getRunPerThread() ||
           reverseThreads_ ) {
        threads = availableThreads;
      }

      try {
        while ( true ) {
          final CountDownLatch latch = new CountDownLatch(threads);
          final AtomicLong pass = new AtomicLong();
          final AtomicLong fail = new AtomicLong();
          ThreadGroup group = new ThreadGroup(name_);
          BenchmarkResult br = new BenchmarkResult();
          br.setOwner(getId());
          br.setName(benchmark.getClass().getSimpleName());
          br.setRun(run);
          br.setThreads(threads);

          // set up the benchmark
          logger.info("setup");
          benchmark.setup(x, br);

          if ( getClearPMs() ) {
            ((DAO) x.get("pmInfoDAO")).removeAll();
          }

          // get start time
          long startTime = System.currentTimeMillis();

          // execute all the threads
          for ( int i = 0 ; i < threads ; i++ ) {
            final int tno = i;
            Thread thread = new Thread(group, new Runnable() {
                @Override
                public void run() {
                  long passed = 0;
                  for ( int j = 0 ; j < getInvocationCount() ; j++ ) {
                    try {
                      benchmark.execute(x);
                      passed++;
                    } catch (Throwable t) {
                      fail.incrementAndGet();
                      Throwable e = t;
                      if ( t instanceof RuntimeException && t.getCause() != null ) {
                        e = t.getCause();
                      }
                      logger.error(e.getMessage());
                      logger.debug(e);
                    }
                  }
                  pass.addAndGet(passed++);

                  // count down the latch when finished
                  latch.countDown();
                }
              }) {
                @Override
                public String toString() {
                  return getName() + "-Thread " + tno;
                }
              };
            // start the thread
            thread.start();
          }

          // wait until latch reaches 0
          latch.await();

          // calculate length taken
          // get number of threads completed and duration
          // print out transactions per second
          long  endTime  = System.currentTimeMillis();
          float complete = (float) (threads * getInvocationCount());
          float duration = ((float) (endTime - startTime) / 1000.0f);
          br.setPass(pass.get());
          br.setFail(fail.get());
          br.setTotal(pass.get() + fail.get());
          br.setOperationsS(new BigDecimal((complete / duration)).setScale(2, RoundingMode.HALF_UP).floatValue());
          br.setOperationsST(new BigDecimal((complete / duration) / (float) threads).setScale(2, RoundingMode.HALF_UP).floatValue());

          logger.info("teardown");
          benchmark.teardown(x, br);

          br = (BenchmarkResult) ((DAO) x.get("benchmarkResultDAO")).put(br);

          ((List)getResults()).add(br);

          String results = formatResults(x, (List) getResults());
          logger.info(results);
          System.out.println(results);

          if ( getRunPerThread() ) {
            if ( reverseThreads_ ) {
              threads--;
            } else {
              threads++;
            }

            if ( threads <= 0 || threads > availableThreads ) {
              break;
            }

            run++;
          } else {
            break;
          }
        }
      } catch (Throwable t) {
        t.printStackTrace();
        logger.error(t);
      } finally {
        setLastRun(new java.util.Date());
      }
      `
    },
    {
      name: 'formatResults',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'results',
          type: 'java.util.List'
        }
      ],
      type: 'String',
      javaCode: `
      String benchmarkName = getBenchmark() == null ? String.valueOf(getBenchmarkId()) : getBenchmark().getClass().getSimpleName();
      StringBuilder csv = new StringBuilder();
      csv.append(benchmarkName);
      csv.append(",");
      csv.append(new java.util.Date().toString());
      csv.append("\\n");

      if ( results == null ||
           results.size() == 0 ) {
        csv.append("no results\\n");
        return csv.toString();
      }

      CSVOutputter out = new CSVOutputterImpl.Builder(getX())
        .setOf(BenchmarkResult.getOwnClassInfo())
        .build();
      for ( BenchmarkResult br : ((List<BenchmarkResult>)results) ) {
        out.outputFObject(x, br);
      }

      csv.append(out.toString());

      return csv.toString();
      `
    }
  ]
});
