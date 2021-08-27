/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'ThreadPoolAgency',
  extends: 'foam.nanos.pool.AbstractFixedThreadPool',

  implements: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.core.XLocator',
    'foam.core.ProxyX',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'java.util.concurrent.LinkedBlockingQueue',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.RejectedExecutionException',
    'java.util.concurrent.ThreadFactory',
    'java.util.concurrent.ThreadPoolExecutor',
    'java.util.concurrent.TimeUnit',
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected ThreadPoolExecutor pool_          = null;
  protected Object             queuedLock_    = new Object();
  protected Object             executingLock_ = new Object();
  protected Object             executedLock_  = new Object();
  protected ThreadGroup        threadGroup_   = null;

  protected class ContextAgentRunnable
    implements Runnable {

    protected X            x_;
    protected ContextAgent agent_;
    protected String       description_;

    public ContextAgentRunnable(X x, ContextAgent agent, String description) {
      x_ = x;
      agent_ = agent;
      description_ = description;
    }

    public void run() {
      incrExecuting(1);
      incrQueued(-1);

      PM     pm     = PM.create(x_, this.getClass(), agent_.getClass().getSimpleName() + ":" + description_);

      X oldX = ((ProxyX) XLocator.get()).getX();

      try {
        XLocator.set(x_);
        agent_.execute(x_);
      } catch (Throwable t) {
        Loggers.logger(x_, this).error(agent_.getClass().getSimpleName(), description_, t.getMessage(), t);
      } finally {
        XLocator.set(oldX);
        incrExecuting(-1);
        incrExecuted();
        pm.log(x_);
      }
    }
  }
          `
        }));
      }
    }
  ],

  properties: [
    {
      documentation: 'report stats when true',
      name: 'debug',
      class: 'Boolean',
      value: true
    },
    {
      name: 'reportInterval',
      class: 'Long',
      value: 1000
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
    threadGroup_ = new ThreadGroup(Thread.currentThread().getThreadGroup(), getPrefix());
    pool_ = new ThreadPoolExecutor(
      getNumberOfThreads(),
      getNumberOfThreads(),
      10,
      TimeUnit.SECONDS,
      new LinkedBlockingQueue<Runnable>(),
      new ThreadFactory() {
        final AtomicInteger threadNumber = new AtomicInteger(1);

        public Thread newThread(Runnable runnable) {
          Thread thread = new Thread(
            threadGroup_,
            runnable,
            getPrefix() + "-" + threadNumber.getAndIncrement(),
            0
            );
          // Thread does not block server from shut down.
          thread.setDaemon(true);
          thread.setPriority(Thread.NORM_PRIORITY);
          return thread;
        }
      }
    );
    pool_.allowCoreThreadTimeOut(true);

    if ( getDebug() ) {
      java.util.Timer timer = new java.util.Timer(this.getClass().getSimpleName(), true);
      timer.schedule(new foam.core.ContextAgentTimerTask(getX(), this), getReportInterval(), getReportInterval());
    }
    `
    },
    {
      name: 'incrExecuting',
      args: [
        {
          name: 'd',
          type: 'int'
        }
      ],
      javaCode: `
    synchronized ( executingLock_ ) {
      setExecuting(getExecuting() + d);
      try {
      if ( getQueued() == 0 &&
           getExecuting() < pool_.getMaximumPoolSize() &&
           pool_.getMaximumPoolSize() > getNumberOfThreads() ) {
        // Thread exited or running after wait,
        // and we previously increased the pool size
        pool_.setMaximumPoolSize(pool_.getMaximumPoolSize() - 1);
        foam.nanos.logger.Loggers.logger(x_, this).info("pool", getPrefix(), "available", pool_.getMaximumPoolSize(), "queued", getQueued(), "executing", getExecuting(), "executed", getExecuted(), "DECREASE");
      }
      } catch ( Throwable t ) {
        t.printStackTrace();
      }
    }
      `
    },
    {
      name: 'incrExecuted',
      javaCode: `
    synchronized ( executingLock_ ) {
      setExecuted(getExecuted() + 1);
    }
      `
    },
    {
      name: 'incrQueued',
      args: [
        {
          name: 'd',
          type: 'int'
        }
      ],
      javaCode: `
    synchronized ( queuedLock_ ) {
      setQueued(getQueued() + d);
      try {
      if ( getExecuting() == pool_.getMaximumPoolSize() &&
           getQueued() >= pool_.getMaximumPoolSize() * 0.1 ) {
        long waiting = 0;
        Thread[] threads = new Thread[threadGroup_.activeCount()];
        int count = threadGroup_.enumerate(threads);
        for ( int i = 0; i < count; i++ ) {
          Thread thread = threads[i];
          if ( thread.getState() == Thread.State.WAITING ) {
            waiting++;
          }
        }
        if ( waiting > getExecuting() * 0.1 ) {
          pool_.setMaximumPoolSize(pool_.getMaximumPoolSize() + 1);
          foam.nanos.logger.Loggers.logger(x_, this).info("pool", getPrefix(), "available", pool_.getMaximumPoolSize(), "queued", getQueued(), "executing", getExecuting(), "waiting", waiting, "executed", getExecuted(), "INCREASE");
        } else if ( waiting > 0 ) {
          foam.nanos.logger.Loggers.logger(x_, this).info("pool", getPrefix(), "available", pool_.getMaximumPoolSize(), "queued", getQueued(), "executing", getExecuting(), "waiting", waiting, "executed", getExecuted());
        }
      }
} catch ( Throwable t ) {
t.printStackTrace();
}
    }
    `
    },
    {
      name: 'getPool',
      type: 'ExecutorService',
      javaCode: `
    return pool_;
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'agent',
          type: 'foam.core.ContextAgent'
        },
        {
          name: 'description',
          type: 'String'
        }
      ],
      javaCode: `
    incrQueued(1);
    getPool().submit(new ContextAgentRunnable(x, agent, description));
     `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      if ( getQueued() > 0 ) {
        foam.nanos.logger.Loggers.logger(x, this).info("pool", getPrefix(), "available", pool_.getMaximumPoolSize(), "queued", getQueued(), "executing", getExecuting(), "executed", getExecuted());
      }
      `
    }
  ]
});
