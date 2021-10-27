/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkRunner',
  extends: 'foam.nanos.script.Script',

  implements: [
    'foam.core.ContextAgent',
    'foam.core.ContextAware'
  ],

  imports: [
    'benchmarkResultDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.XLocator',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.csv.CSVOutputterImpl',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.Subject',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM',
    'foam.nanos.script.BeanShellExecutor',
    'foam.nanos.script.JShellExecutor',
    'foam.nanos.script.Language',
    'foam.nanos.script.ScriptEvent',
    'foam.nanos.script.ScriptStatus',
    'foam.util.SafetyUtil',
    'foam.util.UIDGenerator',
    'java.io.IOException',
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

  tableColumns: [
    'id',
    'lastRun',
    'status',
    'threadCount',
    'runPerThread',
    'invocationCount',
    'benchmarkId'
  ],

  constants: [
    {
      documentation: 'Context key to benchmark access to the runner.',
      name: 'RUNNER',
      value: 'RUNNER'
    },
    {
      documentation: 'Context key informating the execute method which Thread number the current run is.',
      name: 'THREAD',
      value: 'THREAD'
    },
    {
      documentation: 'Context key informaing the execute method which invocation the current run is.',
      name: 'INVOCATION',
      value: 'INVOCATION'
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'threadCount',
      value: 4,
      javaFactory: 'return Runtime.getRuntime().availableProcessors();'
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
      name: 'invocationCount',
      value: 1000
    },
    {
      class: 'Boolean',
      name: 'clearPMs',
      docmentation: 'clear PMs before executing the benchmark',
    },
    {
      class: 'Boolean',
      name: 'oneTimeSetup'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.bench.Benchmark',
      name: 'benchmarkId'
    },
    {
      class: 'List',
      name: 'results',
      javaFactory: 'return new ArrayList();',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'benchmarkRunnerDAO',
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'benchmarkRunnerEventDAO',
      transient: true,
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'runScript',
      javaCode: `
      PM pm = new PM(this.getClass(), getId());
      try {
        execute(x.put(RUNNER, this));
      } finally {
        setLastRun(new java.util.Date());
        setLastDuration(pm.getTime());

        ScriptEvent event = new ScriptEvent(x);
        event.setLastRun(this.getLastRun());
        event.setLastDuration(this.getLastDuration());
        event.setOutput(this.getOutput());
        event.setOwner(this.getId());
        event.setScriptId(this.getId());
        event.setHostname(System.getProperty("hostname", "localhost"));
        event.setClusterable(this.getClusterable());
        ((DAO) x.get(getEventDaoKey())).put(event);
      }
      `
    },
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
      Logger log = (Logger) x.get("logger");
      if ( log != null ) {
        log = new foam.nanos.logger.StdoutLogger();
      }
      final Logger logger = new PrefixLogger(new String[] { getId() }, log);

      AppConfig config = (AppConfig) x.get("appConfig");
      if ( config.getMode() == Mode.PRODUCTION ) {
        logger.warning("Benchmark execution disabled in PRODUCTION");
        return;
      }

      try {
        final Benchmark benchmark = getBenchmark(x);

        logger.info("execute", benchmark.getClass().getSimpleName());
        UIDGenerator uidGenerator = new UIDGenerator.Builder(getX())
            .setSalt("benchmarkResultDAO")
            .build();
        String uid = String.valueOf(uidGenerator.getNextLong());

        int availableThreads = Math.min(Runtime.getRuntime().availableProcessors(), getThreadCount());
        int run = 1;
        int threads = 1;

        if ( ! getRunPerThread() ||
             reverseThreads_ ) {
          threads = availableThreads;
        }

        boolean setup = false;
        while ( true ) {
          final CountDownLatch latch = new CountDownLatch(threads);
          final AtomicLong pass = new AtomicLong();
          final AtomicLong fail = new AtomicLong();
          ThreadGroup group = new ThreadGroup("BenchmarkRunner");
          BenchmarkResult br = new BenchmarkResult();
          br.setUid(uid);
          br.setRun(run);
          br.setHostname(System.getProperty("hostname", "localhost"));
          // br.setName(benchmark.getName());
          br.setName(this.getId());
          br.setThreads(threads);

          if ( ! getOneTimeSetup() ||
               getOneTimeSetup() && ! setup ) {
            // set up the benchmark
            logger.info("setup");
            benchmark.setup(x, br);
            setup = true;
          }
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
                      X y = x.put(THREAD, tno).put(INVOCATION, j);
                      XLocator.set(y);
                      benchmark.execute(y);
                      passed++;
                    } catch (Throwable t) {
                      fail.incrementAndGet();
                      Throwable e = t;
                      if ( t instanceof RuntimeException && t.getCause() != null ) {
                        e = t.getCause();
                      }
                      logger.error(e.getMessage());
                      logger.debug(e);
                    } finally {
                      XLocator.set(null);
                    }
                  }
                  pass.addAndGet(passed++);

                  // count down the latch when finished
                  latch.countDown();
                }
              }) {
                @Override
                public String toString() {
                  return getId() + "-Thread " + tno;
                }
              };
            // start the thread
            thread.start();
          }

          // wait until latch reaches 0
          try {
            latch.await();
          } catch (InterruptedException e) {
            break;
          }

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

          br = (BenchmarkResult) getBenchmarkResults(x).put(br);

          getResults().add(br);

          String results = formatResults(x, getResults());
          setOutput(results);
          logger.info(results);

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
      } catch (Throwable e) {
        throw new RuntimeException(e);
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
      StringBuilder csv = new StringBuilder();
      csv.append(getId());
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
    },
    {
      name: 'getBenchmark',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'foam.nanos.bench.Benchmark',
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getBenchmarkId()) ) {
          return (Benchmark) ((DAO) x.get("benchmarkDAO")).find(getBenchmarkId()).fclone();
        }

        Language l = getLanguage();
        if ( l == foam.nanos.script.Language.JSHELL )
          return (Benchmark) new JShellExecutor().runExecutor(x, null, getCode());
        else if ( l == foam.nanos.script.Language.BEANSHELL )
          return (Benchmark) new BeanShellExecutor(null).execute(x, null, getCode());
        else
          throw new RuntimeException("Script language not supported");
      `,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException',
        'SecurityException',
        'NoSuchFieldException',
        'IOException',
        'Exception'
      ]
    }
  ]
});
