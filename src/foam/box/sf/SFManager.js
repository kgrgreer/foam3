/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFManager',
  
  implements: [
    'foam.nanos.NanoService',
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.ReplyBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'foam.util.concurrent.SyncAssemblyLine',
    'foam.util.retry.RetryForeverStrategy',
    'foam.util.retry.RetryStrategy',
    'java.util.concurrent.locks.Condition',
    'java.util.concurrent.locks.ReentrantLock',
    'java.util.concurrent.TimeUnit',
    'java.util.PriorityQueue',
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'PriorityQueue',
      name: 'prorityQueue',
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PriorityQueue<SFEntry>(16, (n, p) -> {
          if ( n.getScheduledTime() < p.getScheduledTime() ) {
            return -1;
          }
          if ( n.getScheduledTime() > p.getScheduledTime() ) {
            return 1;
          }
          return 0;
        });
      `
    },
    {
      name: 'sfs',
      class: 'Map',
      javaCloneProperty: '//noop',
      javaFactory: `return new java.util.concurrent.ConcurrentHashMap();`
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'boxThreadPool'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],
  
  methods: [
    {
      name: 'enqueue',
      args: 'SFEntry e',
      documentation: 'add entry into process queue, initForwarder method will take over the rest of job',
      javaCode: `
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();
        lock_.lock();
        try {
          queue.offer(e);
          notAvailable_.signal();
        } finally {
          lock_.unlock();
        }
      `
    },
    {
      name: 'initForwarder',
      args: 'Context x',
      javaThrows: [],
      documentation: 'processor that polling entries from queue and try delegate.put when there are available entries',
      javaCode: `
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();
        Agency pool = (Agency) x.get(getThreadPoolName());

        //TODO: use below code after finish testing.
        // final AssemblyLine assemblyLine = x.get(getThreadPoolName()) == null ?
        //   new SyncAssemblyLine()   :
        //   new AsyncAssemblyLine(x) ;

        final AssemblyLine assemblyLine = new SyncAssemblyLine();

        pool.submit(x, new ContextAgent() {
          volatile long count = 0;
          @Override
          public void execute(X x) {
            lock_.lock();
            while ( true ) {
              //getLogger().info("$$$$ SF running: " + count++ + " queue size: " + queue.size());
              if ( queue.size() > 0 ) {
                if ( queue.peek().getScheduledTime() <= System.currentTimeMillis() ) {
                  SFEntry e = queue.poll();
                  assemblyLine.enqueue(new AbstractAssembly() { 
                    public void executeJob() {
                      try {
                        //getLogger().info("sfID: " + e.getSf().getId(), "sfObject: " + e.getObject());
                        e.getSf().submit(x, e);
                        try {
                          e.getSf().successForward(e);
                        } catch ( Throwable t ) {
                          throw new SFException(t);
                        }
                      }
                      catch ( SFException sfe ) {
                        getLogger().error( "sfID: " + e.getSf().getId(), sfe.getCause());
                        e.getSf().setReady(false);
                      }
                      catch ( Throwable t ) {
                        getLogger().warning("sfID: " + e.getSf().getId(), t.getMessage());
                        //getLogger().error("sfID: " + e.getSf().getId(), t);
                        try {
                          e.getSf().failForward(e, t);
                        } catch ( Throwable et ) {
                          getLogger().error("sfID: " + e.getSf().getId(), et);
                          e.getSf().setReady(false);
                        }
                      }
                    }
                  });
                } 

                if ( queue.size() > 0 ) {
                  long waitTime = queue.peek().getScheduledTime() - System.currentTimeMillis();
                  if ( waitTime > 0 ) {
                    try {
                      //getLogger().info("$$$ waitTime: " + waitTime);
                      notAvailable_.await(waitTime, TimeUnit.MILLISECONDS);
                    } catch ( InterruptedException e ) {
                      getLogger().info("SFManager interrupt: " + waitTime);
                    }
                  }
                } else {
                  try {
                    notAvailable_.await(2000, TimeUnit.MILLISECONDS);
                  } catch ( InterruptedException e ) {
                    getLogger().info("SFManager interrupt");
  
                  }
                }
              } else {
                try {
                  notAvailable_.await(2000, TimeUnit.MILLISECONDS);
                } catch ( InterruptedException e ) {
                  getLogger().info("SFManager interrupt");

                }
              }
            }
          }
        }, "sfManager");
      `
    },
    {
      name: 'start',
      documentation: 'Initial each SF',
      javaCode: `
        X context = getX();
        initForwarder(x_);
        final SFManager manager = this;
        DAO internalSFDAO = (DAO) getX().get("internalSFDAO");
        internalSFDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            String sfId = "";
            try {
              SF sf = (SF) ((FObject) obj).fclone();
              sfId = sf.getId();
              sf.setX(context);
              sf.setManager(manager);
              sf.initial(context);
              sf.setReady(true);
              getSfs().put(sf.getId(), sf);
              getLogger().info("Initialize successfully: " + sf.getId());
            } catch ( Throwable t ) {
              getLogger().error(sfId, t);
            }
          }
        });
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            private final ReentrantLock lock_ = new ReentrantLock();
            private final Condition notAvailable_ = lock_.newCondition();
          `
        }));
      }
    }
  ]
})
