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

//TODO: retry, reader and writer, persistance, writer and reader async work.
foam.CLASS({
  package: 'foam.box.sf',
  name: 'StoreAndForwardBox',
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
    'java.util.PriorityQueue'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Long',
      name: 'maxFileSize'
    },
    {
      class: 'Object',
      name: 'storeDAO',
      javaFactory: `
        // get dao from context
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
      class: 'String',
      name: 'url'
    },
    {
      class: 'Boolean',
      name: 'isStore',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isHashEntry',
      value: false
    },
    {
      class: 'Boolean',
      name: 'async',
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
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getUrl()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        //persist
        //send delegate
        //if sucess
        //if fail - retry
        //how to know the fail
        //becarefull of replay box. and error

        SFEntry entry = new SFEntry.Builder(getX())
                              .setMessage(msg)
                              .build();
      
        /* Create store entry and persist it. */
        entry = (SFEntry)(((DAO) getStoreDAO()).put(entry));

        if ( getAsync() ) {
          sendAsync(getX(), entry);
        } else {
          sendSync(getX(), entry);
        }

      `
    },
    {
      name: 'sendSync',
      args: 'Context x, SFEntry entry',
      javaCode:`
        Message msg = entry.getMessage();
        int retryAttempt = 0;
        int delay = getInitialValue();

        while ( true ) {
          try {
            getDelegate().send(msg);

            /* Forward success. */
            SFEntry en = (SFEntry) entry.fclone();
            en.setStatus(SFStatus.COMPLETED);
            ((DAO) getStoreDAO()).put(en);
            break;
          } catch ( Throwable t ) {
            getLogger().warning(t.getMessage());

            /* Reach retry limit. */
            if ( getMaxRetryAttempts() > -1 &&
              retryAttempt >= getMaxRetryAttempts() ) {
              getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              
              SFEntry en = (SFEntry) entry.fclone();
              en.setStatus(SFStatus.CANCELLED);
              ((DAO) getStoreDAO()).put(en);
              throw new RuntimeException("Rejected, retry limit reached.");
            }

            retryAttempt += 1;

            /* Delay and retry */
            try {
              delay = getStepFunction().next(delay);
              if ( delay > getMaxRetryDelayMS() ) {
                delay = getMaxRetryDelayMS();
              }
              getLogger().info("retry attempt", retryAttempt, "delay", delay);
              Thread.sleep(delay);
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              throw t;
            }
          } 
        }
      `
    },
    {
      name: 'sendAsync',
      args: 'Context x, SFEntry entry',
      javaCode:`
        Agency pool = (Agency) x.get(getThreadPoolName());
        Message msg = entry.getMessage();

        pool.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            int retryAttempt = 0;
            int delay = getInitialValue();

            while( true ) {
              try {
                getDelegate().send(msg);

                /* Forward success. */
                SFEntry en = (SFEntry) entry.fclone();
                en.setStatus(SFStatus.COMPLETED);
                ((DAO) getStoreDAO()).put(en);
                break;
              } catch( Throwable t ) {
                getLogger().warning(t.getMessage());

                /* Reach retry limit. */
                if ( getMaxRetryAttempts() > -1 &&
                  retryAttempt >= getMaxRetryAttempts() ) {
                    getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts(), entry.toString());

                    SFEntry en = (SFEntry) entry.fclone();
                    en.setStatus(SFStatus.CANCELLED);
                    ((DAO) getStoreDAO()).put(en);
                    break;
                }

                retryAttempt += 1;

                /* Delay and retry */
                try {
                  delay = getStepFunction().next(delay);
                  if ( delay > getMaxRetryDelayMS() ) {
                    delay = getMaxRetryDelayMS();
                  }
                  getLogger().info("retry attempt", retryAttempt, "delay", delay);
                  Thread.sleep(delay);
                } catch(InterruptedException e) {
                  getLogger().warning(e.getMessage());
                }
              }
            }
          }
        }, String.format("%s SFBox retry %s", this.getFileName(), msg.toString()));
      `
    },
    {
      documentation: `Read unsend entries from file and send`,
      name: 'initReader',
      args: 'Context x',
      javaCode: `
        //TODO: search latest modify file or file index

        /* Get path from Context and find latest journal. */
        Path journalPath = getJournalPath(x);

        /* Read unsend entries and re-send. */
        if ( journalPath != null ) {
          resend(x, journalPath);
        }

        //trigger send. using async assembly.
        /* Get FileSystemStorage from Context. It has default data directory that register in Boot.js */
        return;
      `
    },
    {
      name: 'resend',
      args: 'Context x, Path journalPath',
      javaCode: `
        /* read unsend entries from journal */
        Agency pool = (Agency) x.get(getThreadPoolName());
        String fileName = journalPath.getFileName().toString();
        Journal readJournal = new ReadOnlyF3FileJournal.Builder(x)
                                  .setFilename(fileName)
                                  .setCreateFile(false)
                                  .build();
        
        MDAO dao = new foam.dao.MDAO(SFEntry.getOwnClassInfo());
        DAO tmpDAO = new FilterDAO(x, dao);
        readJournal.replay(x, tmpDAO);

        /* Store unsend entries in the queue. */
        final PriorityQueue<SFEntry> sfq = new PriorityQueue<SFEntry>(16, (s1, s2) -> {
                                                if ( s1.getScheduledTime() < s2.getScheduledTime() ) {
                                                  return -1;
                                                }
                                                if ( s1.getScheduledTime() > s2.getScheduledTime() ) {
                                                  return 1;
                                                }
                                                return 0;
                                              });

        tmpDAO.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            sfq.add((SFEntry) obj);
          }
        });

        /* resend entries */
        pool.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            while ( sfq.size() > 0 ) {
              if ( sfq.peek().getScheduledTime() <= System.currentTimeMillis() ) {
                SFEntry e = sfq.poll();
                try {
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
                    continue;
                  }

                  /* Continue next retry and set new schedule time. */
                  e.setRetryAttempt(e.getRetryAttempt()+1);
                  e.setCurStep(getStepFunction().next(e.getCurStep()));
                  if ( e.getCurStep() > getMaxRetryDelayMS() ) {
                    e.setCurStep(getMaxRetryDelayMS());
                  }
                  e.setScheduledTime(System.currentTimeMillis()+e.getCurStep());
                  sfq.add((SFEntry) e);
                }
              }

              long delay = System.currentTimeMillis() - sfq.peek().getScheduledTime();
              if ( delay > 0 ) {
                try {
                  Thread.sleep(delay);
                } catch(InterruptedException e) {
                  getLogger().warning(e.getMessage());
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