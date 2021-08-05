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
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',

    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.CountDownLatch',
    'java.util.concurrent.atomic.AtomicLong'
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
      class: 'FObjectProperty',
      of: 'foam.nanos.bench.Benchmark',
      name: 'benchmark',
      docmentation: 'Used by legacy benchmarks',
      storageTransient: true
    },
    {
      class: 'Boolean',
      name: 'clearPms',
      docmentation: 'clear PMs before executing the benchmark',
    }
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
        logger.warning("Script execution disabled in PRODUCTION");
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
          Map stats = new HashMap<String, Object>();
          stats.put(RUN, run);
          stats.put(THREADCOUNT, threads);
  
          // set up the benchmark
          logger.info("setup");
          benchmark.setup(x);
  
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
                      if ( getClearPms() ) {
                        DAO pmDAO = (DAO) x.get("pmDAO");
                        pmDAO.removeAll();
                      }
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
          stats.put(PASS, pass.get());
          stats.put(FAIL, fail.get());
          stats.put(TOTAL, pass.get() + fail.get());
          stats.put(OPS, String.format("%.02f", (complete / duration)));
          stats.put(OPSPT, String.format("%.02f", (complete / duration) / (float) threads));
          stats.put(MEMORY, String.format("%.02f", (((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())) / 1024.0 / 1024.0 / 1024.0)));
  
          logger.info("teardown");
          benchmark.teardown(x, stats);
          results_.add(stats);
  
          if ( getRunPerThread() ) {
            String results = formatResults();
            System.out.println(results);
            logger.info(results);
  
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
            String results = formatResults();
            System.out.println(results);
            logger.info(results);
            break;
          }
        }
      } catch (Throwable t) {
        t.printStackTrace();
        logger.error(t);
      }
      `
    },
    {
      name: 'formatResults',
      type: 'String',
      javaCode: `
      String benchmarkName = getBenchmark() == null ? getBenchmarkId() : getBenchmark().getClass().getSimpleName();
      StringBuilder csv = new StringBuilder();
      csv.append(benchmarkName);
      csv.append(",");
      csv.append(new java.util.Date().toString());
      csv.append("\\n");
  
      if ( results_.size() == 0 ) {
        csv.append("no results\\n");
        return csv.toString();
      }
  
      Map<String, Object> r = results_.get(0);
  
      int index = 0;
      for ( Map.Entry<String, Object> entry : r.entrySet() ) {
        index++;
        csv.append(entry.getKey());
        if ( index < r.entrySet().size() ) csv.append(",");
      }
  
      csv.append("\\n");
  
      for ( Map<String, Object> result : results_ ) {
        index = 0;
        for ( Map.Entry<String, Object> entry : result.entrySet() ) {
          index++;
          Object val = entry.getValue();
          csv.append(val);
          if ( index < result.entrySet().size() ) csv.append(",");
        }
        csv.append("\\n");
      }
  
      return csv.toString();
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public static String RUN         = "Run";
            public static String THREADCOUNT = "Threads";
            public static String OPS         = "Operations/s";
            public static String OPSPT       = "Operations/s/t";
            public static String MEMORY      = "Memory GB";
            public static String TOTAL       = "Total";
            public static String PASS        = "Pass";
            public static String FAIL        = "Fail";
            protected List<Map<String, Object>> results_ = new ArrayList<Map<String, Object>>();
          `
        }));
      }
    }
  ]

});
