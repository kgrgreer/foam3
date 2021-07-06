/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFBOX',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.java.JDAO',
    'foam.dao.NullDAO',
    'foam.dao.Journal',
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'foam.dao.WriteOnlyJDAO',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.core.X',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.nanos.fs.Storage',
    'foam.box.Message',
    'foam.nanos.fs.FileSystemStorage',
    'net.nanopay.security.HashingReplayJournal',
    'net.nanopay.security.HashingJDAO',
    'java.nio.file.Path',
    'java.nio.file.DirectoryStream',
    'java.nio.file.Files',
    'java.nio.file.DirectoryIteratorException',
    'java.io.IOException',
    'java.util.concurrent.atomic.AtomicInteger',
    'foam.mlang.MLang',
    'java.util.List',
    'java.util.PriorityQueue',
    'foam.util.concurrent.AssemblyLine',
    'java.util.concurrent.locks.ReentrantLock',
    'java.util.concurrent.locks.Condition',
  ],
  
  properties: [
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Int',
      name: 'fileSuffix',
      value: 0
    },
    {
      class: 'Object',
      name: 'storeDAO',
      javaFactory: `
        if ( getIsHashEntry() ) {
          return new HashingJDAO(
            getX(), 
            "SHA-256", 
            true, 
            false, 
            new NullDAO.Builder(getX())
              .setOf(SFEntry.getOwnClassInfo())
              .build(), 
            getFileName() + "." + getFileSuffix()
          );
        } else {
          return new WriteOnlyJDAO(
            getX(),
            SFEntry.getOwnClassInfo(),
            getFileName() + "." + getFileSuffix()
          );
        }
      `
    },
    {
      class: 'Boolean',
      name: 'isHashEntry',
      value: false
    },
    {
      class: 'Int',
      name: 'initialValue',
      value: 1000
    },
    {
      class: 'Object',
      javaType: 'StepFunction',
      name: 'stepFunction',
      javaFactory: `
        return x -> x*2;
      `
    },
    {
      class: 'Int',
      name: 'fileSuffix',
      value: 0
    },
    {
      class: 'Int',
      name: 'maxRetryDelayMS',
      value: 20000
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'threadPool'
    },
    {
      class: 'Object',
      javaType: 'PriorityQueue',
      name: 'prorityQueue',
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
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getFileName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        //TODO: add index.
        SFEntry entry = new SFEntry.Builder(getX())
                              .setMessage(msg)
                              .build();
      
        /* Create store entry and persist it. */
        entry = (SFEntry)(((DAO) getStoreDAO()).put(entry));

        entry.setScheduledTime(System.currentTimeMillis());
        // Add new entry into reader queue.
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();
        lock_.lock();
        try {
          queue.offer(entry);
          notEmpty_.signal();
        } finally {
          lock_.unlock();
        }
      `
    },
    {
      name: 'initReader',
      args: 'Context x',
      javaThrows: [],
      javaCode: `
        /* read unsend entries from journal */
        Path journalPath = getJournalPath(x);
        Agency pool = (Agency) x.get(getThreadPoolName());
        DAO dao = new foam.dao.MDAO(SFEntry.getOwnClassInfo());
        DAO tmpDAO = new FilterDAO(x, dao);
        if ( journalPath != null ) {
          String fileName = journalPath.getFileName().toString();
          Journal readJournal = new ReadOnlyF3FileJournal.Builder(x)
                                    .setFilename(fileName)
                                    .setCreateFile(false)
                                    .build();
          readJournal.replay(x, tmpDAO);
        }

        /* Store unsend entries in the queue. */
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();

        tmpDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            SFEntry entry = (SFEntry) obj;
            entry.setScheduledTime(System.currentTimeMillis());
            lock_.lock();
            try {
              queue.offer(entry);
              notEmpty_.signal();
            } finally {
              lock_.unlock();
            }
          }
        });
        getLogger().info("load ", queue.size(), " unsend entries from file: ", getFileName(), getFileSuffix());


        final AssemblyLine assemblyLine = x.get("threadPool") == null ?
          new foam.util.concurrent.SyncAssemblyLine()   :
          new foam.util.concurrent.AsyncAssemblyLine(x) ;

        /* resend entries */
        pool.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            final ReentrantLock lock = lock_;
            lock.lock();
            while ( true ) {
              if ( queue.size() > 0 ) {
                if ( queue.peek().getScheduledTime() <= System.currentTimeMillis() ) {
                  SFEntry e = queue.poll();

                  assemblyLine.enqueue(new foam.util.concurrent.AbstractAssembly() { 

                    public void executeJob() {
                      try {
                        e.getMessage().getAttributes().put("replyBox", (new SFReplayBox.Builder(x)).build());
                        getDelegate().send(e.getMessage());
      
                        /* Update entries in the journal. */
                        SFEntry en = (SFEntry) e.fclone();
                        en.setStatus(SFStatus.COMPLETED);
                        ((DAO) getStoreDAO()).put(en);
                      } catch ( Throwable t ) {
                        getLogger().warning(t.getMessage());
      
                        /* Reach retry limit. */
                        if ( getMaxRetryAttempts() > -1 &&
                          e.getRetryAttempt() >= getMaxRetryAttempts() ) {
                          getLogger().warning("retryAttempt >= maxRetryAttempts", e.getRetryAttempt(), getMaxRetryAttempts(), e.toString());
                          
                          SFEntry en = (SFEntry) e.fclone();
                          en.setStatus(SFStatus.CANCELLED);
                          ((DAO) getStoreDAO()).put(en);
                          return;
                        }
      
                        /* Continue next retry and set new schedule time. */
                        e.setRetryAttempt(e.getRetryAttempt()+1);
                        e.setCurStep(getStepFunction().next(e.getCurStep()));
                        if ( e.getCurStep() > getMaxRetryDelayMS() ) {
                          e.setCurStep(getMaxRetryDelayMS());
                        }
                        e.setScheduledTime(System.currentTimeMillis()+e.getCurStep());
                        lock_.lock();
                        try {
                          queue.offer(e);
                          notEmpty_.signal();
                        } finally {
                          lock_.unlock();
                        }
                      }
                    }
                  });
                  
                } else {
                  long delay = System.currentTimeMillis() - queue.peek().getScheduledTime();
                  try {
                    notEmpty_.awaitNanos(delay);
                  } catch ( InterruptedException e ) {

                  }
                }
              } else {
                try {
                  notEmpty_.await();
                } catch ( InterruptedException e ) {
                  
                }
              }                
            }
          }
        }, String.format("%s SFBox retry", this.getFileName()));
      `
    },
    {
      name: 'getJournalPath',
      args: 'Context x',
      javaType: 'Path',
      javaCode: `
        int latestSuffix = getFileSuffix();
        Path journalPath = null;
        Path rootPath = ((FileSystemStorage) x.get(Storage.class)).getRootPath();
        try ( DirectoryStream<Path> stream = Files.newDirectoryStream(rootPath) ) {
          for ( Path entry: stream ) {
            if ( entry.toString().contains(getFileName()) ) {
              int suffix = Integer.parseInt(entry.toString().split("\\\\.")[1]);
              if ( latestSuffix <= suffix  ) {
                latestSuffix =  suffix;
                journalPath = entry;
              }
            }
          }
        } catch ( IOException e ) {
          //throw e.getCause();
        }

        /* Update new file suffix. */
        setFileSuffix(latestSuffix);
        return journalPath;
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
            private final Condition notEmpty_ = lock_.newCondition();
        
            static private interface StepFunction {
              public int next(int cur);
            }
            static private class FilterDAO extends ProxyDAO {
              @Override
              public FObject put_(X x, FObject obj) {
                SFEntry entry = (SFEntry) obj;
                entry.setScheduledTime(System.currentTimeMillis());
                if ( entry.getStatus() == SFStatus.FAILURE ) return getDelegate().put_(x, entry);
                return obj;
              }

              public FilterDAO(X x, DAO delegate) {
                super(x, delegate);
              }
            }
          `
        }));
      }
    }
  ]
});