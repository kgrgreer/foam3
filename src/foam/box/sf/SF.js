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
  name: 'SF',
  abstract: true,

  javaImports: [
    'foam.core.X',
    'foam.core.ClassInfo',
    'foam.box.Box',
    'foam.box.Message',
    'foam.dao.*',
    'foam.core.FObject',
    'foam.mlang.sink.Max;',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.lib.NetworkPropertyPredicate',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.StoragePropertyPredicate',
    'java.nio.file.*',
    'java.nio.file.attribute.*',
    'java.io.IOException',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.concurrent.atomic.AtomicBoolean',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.*',
    'org.apache.commons.lang.exception.ExceptionUtils'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Int',
      name: 'fileSuffix',
      transient: true,
      value: 0
    },
    {
      class: 'Int',
      name: 'fileCapacity',
      value: 1024
    },
    {
      name: 'retryStrategy',
      class: 'FObjectProperty',
      of: 'foam.box.sf.RetryStrategy',
      javaFactory: `
        return (new DefaultRetryStrategy.Builder(getX())).build();
      `
    },
    {
      class: 'Int',
      name: 'timeWindow',
      documentation: 'In second. if -1, replay everything',
      value: 240
    },
    {
      class: 'Boolean',
      name: 'replayFailEntry',
      documentation: 'only reforward unsuccessful entires when system comes up, will need to write journal twice for each entry',
      value: false
    },
    {
      class: 'Int',
      name: 'loggingThredhold',
      documentation: 'Logging after n times retry fail',
      value: 4
    },
    {
      class: 'Boolean',
      name: 'ready',
      storageTransient: true,
      value: false,
      javaSetter:`
        readyIsSet_ = true;
        ready_ = val;
        return;
      `,
    },
    {
      class: 'Object',
      name: 'delegateObject',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      visibility: 'HIDDEN',
      transient: true,
    },
    {
      class: 'Object',
      name: 'nullDao',
      transient: true,
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      visibility: 'HIDDEN',
      javaFactory: `
        return new NullDAO.Builder(getX()).setOf(SFEntry.getOwnClassInfo()).build();
      `
    },
    {
      class: 'Object',
      name: 'manager',
      javaType: 'SFManager',
      transient: true,
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      visibility: 'HIDDEN',
      javaSetter: `
        managerIsSet_ = true;
        manager_ = val;
      `
    }
  ],

  methods: [
    {
      name: 'createWriteJournal',
      args: 'String fileName',
      documentation: 'help function for create a journal',
      javaType: 'SFFileJournal',
      javaCode: `
        boolean createFile = getReplayFailEntry() ? true : false;
        SFFileJournal journal = new SFFileJournal.Builder(getX())
                                  .setFilename(fileName)
                                  .setCreateFile(createFile)
                                  .setDao(new foam.dao.NullDAO())
                                  .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[SF]", fileName }, new foam.nanos.logger.StdoutLogger()))
                                  .build();
        if ( getReplayFailEntry() == false && journal.getFileExist() == false ) {
          journal.createJournalFile();
          journal.setFileOffset(0);
        }
        return journal;

      `
    },
    {
      name: 'forward',
      args: 'SFEntry e',
      documentation: 'Add the entry into process queue.',
      javaCode: `
        /* Assign initial time and enqueue. */
        e.setScheduledTime(System.currentTimeMillis());
        e.setSf(this);
        ((SFManager) getManager()).enqueue(e);
      `
    },
    {
      name: 'storeAndForward',
      args: 'FObject fobject',
      documentation: 'write entry to journal and forward',
      javaCode: `
        // Wait for the SF ready to serve.
        //while ( isReady_.get() == false ) {}
        SFEntry entry = new SFEntry.Builder(getX())
                            .setObject(fobject)
                            .build();
        entry.setCreated(new Date());

        if ( getReplayFailEntry() == true ) {
          long index = entryIndex_.incrementAndGet();
          entry.setIndex(index);
          SFFileJournal journal = getJournal(toFileName(entry));
          entry = (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);
          forward(entry);
        } else {
          synchronized ( writeLock_ ) {
            long index = entryIndex_.incrementAndGet();
            entry.setIndex(index);
            entry.setFileName(toFileName(entry));
            SFFileJournal journal = getJournal(toFileName(entry));
            entry = (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);

            synchronized ( onHoldListLock_ ) {
              if ( onHoldList_.size() == 0 ) {
                onHoldList_.add(entry);
                forward(entry);
              } else {
                onHoldList_.add(entry);
              }
            }
          }
        }
      `
    },
    {
      name: 'successForward',
      args: 'SFEntry e',
      documentation: 'handle entry when retry success',
      javaCode: `
        if ( getReplayFailEntry() == true ) {
          e.setStatus(SFStatus.COMPLETED);
          Journal journal = getJournal(toFileName(e));
          journal.put(getX(), "", (DAO) getNullDao(), e);
        } else {
          updateJournalOffsetAndForwardNext(e);
        }
      `
    },
    {
      name: 'updateJournalOffsetAndForwardNext',
      args: 'SFEntry e',
      javaCode: `
        updateJournalOffset(e);

        synchronized ( onHoldListLock_ ) {
          onHoldList_.remove(0);
          if ( onHoldList_.size() != 0 ) {
            forward(onHoldList_.get(0));
          }
        }
      `
    },
    {
      name: 'updateJournalOffset',
      args: 'SFEntry e',
      documentation: 'try to update byte offset to file atime',
      javaCode: `
        SFFileJournal journal = fetchJournal(e);
        long atime = journal.getFileOffset();
        long entrySize = journal.calculateSize(e);
        long offset = atime + entrySize;
        journal.setFileOffset(offset);
      `
    },
    {
      name: 'failForward',
      args: 'SFEntry e, Throwable t',
      documentation: 'handle entry when retry fail',
      javaCode: `
        /* Check retry attempt, then Update ScheduledTime and enqueue. */
        if ( getRetryStrategy().maxRetries() > -1 &&
              e.getRetryAttempt() >= getRetryStrategy().maxRetries() )  {
          logger_.warning("retryAttempt >= maxRetryAttempts", e.getRetryAttempt(), getRetryStrategy().maxRetries(), e.toString());

          if ( getReplayFailEntry() == true ) {
            e.setStatus(SFStatus.CANCELLED);
            Journal journal = getJournal(toFileName(e));
            journal.put(getX(), "", (DAO) getNullDao(), e);
          } else {
            //update file a-time.
            updateJournalOffsetAndForwardNext(e);
          }
        } else {
          updateNextScheduledTime(e);
          updateAttempt(e);
          ((SFManager) getManager()).enqueue(e);
        }
      `
    },
    {
      name: 'submit',
      args: 'Context x, SFEntry entry',
      javaCode: `
        Object delegate = getDelegateObject();
        if ( delegate instanceof Box ) ((Box) delegate).send((Message) entry.getObject());
        else if ( delegate instanceof DAO ) ((DAO) delegate).put_(x, entry.getObject());
        else if ( delegate instanceof Sink ) ((Sink) delegate).put(entry.getObject(), null);
        else throw new RuntimeException("DelegateObject do not support");
      `
    },
    {
      name: 'createDelegate',
      documentation: 'creating delegate when start up',
      javaCode: `
        return;
      `
    },
    {
      name: 'initial',
      args: 'Context x',
      documentation: 'when system start, SFManager will call this service to initial re-forward',
      javaCode: `
        logger_ = new PrefixLogger(new Object[] {
                    this.getClass().getSimpleName(),
                    this.getFileName()
                  }, (Logger) x.get("logger"));
        createDelegate();
        FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
        List<String> filenames = new ArrayList<>(fileSystemStorage.getAvailableFiles("", getFileName()+".*"));

        if ( filenames.size() == 0 ) {
          isReady_.getAndSet(true);
          return;
        }

        List<String> availableFilenames = null;
        //Sort file from high index to low.
        filenames.sort((f1, f2) -> {
          int l1 = Integer.parseInt(f1.split("\\\\.")[1]);
          int l2 = Integer.parseInt(f2.split("\\\\.")[1]);
          return l1 > l2 ? -1 : 1;
        });

        Date timeWindow = null;

        if ( getTimeWindow() == -1 ) {
          Collections.reverse(filenames);
          availableFilenames = filenames;
        } else {
          availableFilenames = new ArrayList<>();
          Calendar rightNow = Calendar.getInstance();
          rightNow.add(Calendar.SECOND, -getTimeWindow());
          timeWindow = rightNow.getTime();

          for ( String filename : filenames ) {
            BasicFileAttributes attr = fileSystemStorage.getFileAttributes(filename);
            Date fileLastModifiedDate = new Date(attr.lastModifiedTime().toMillis());
            //TODO: mark journal as finished if unneed.
            if ( fileLastModifiedDate.before(timeWindow) ) break;
            availableFilenames.add(0, filename);
          }

        }

        if ( getReplayFailEntry() == true ) {

          if ( availableFilenames.size() == 0 ) {
            availableFilenames.add(filenames.get(filenames.size() - 1));
          }
          ArraySink sink = new ArraySink(x);

          //Create predicate depends on condition.
          Predicate predicate = null;
          if ( getTimeWindow() == -1 ) {
            if ( getReplayFailEntry() == true ) {
              predicate = MLang.EQ(SFEntry.STATUS, SFStatus.FAILURE);
            } else {
              predicate = MLang.TRUE;
            }
          } else {
            if ( getReplayFailEntry() == true ) {
              predicate = MLang.AND(
                MLang.EQ(SFEntry.STATUS, SFStatus.FAILURE),
                MLang.GTE(SFEntry.CREATED, timeWindow)
              );
            } else {
              predicate = MLang.GTE(SFEntry.CREATED, timeWindow);
            }
          }

          MDAO tempDAO = new MDAO(SFEntry.getOwnClassInfo());
          for ( String filename : availableFilenames ) {
            Journal journal = new SFFileJournal.Builder(x)
                                .setDao(tempDAO)
                                .setFilename(filename)
                                .setCreateFile(false)
                                .build();
            journal.replay(x, tempDAO);
          }

          //Find entry index;
          Max max = (Max) tempDAO.select(MLang.MAX(SFEntry.INDEX));
          entryIndex_.set((Long)max.getValue());

          tempDAO.where(predicate).select(sink);
          List<SFEntry> sfEntryList = sink.getArray();
          logger_.log("Successfully read " + sfEntryList.size() + " entries from file: " + getFileName() + " in SF: " + getId());
          for ( SFEntry entry : sfEntryList ) {
            forward((SFEntry) entry.fclone());
          }
        } else {

          synchronized ( onHoldListLock_ ) {

            int maxFileIndex = getFileSuffix(filenames.get(filenames.size() - 1));

            for ( String filename : availableFilenames ) {

              SFFileJournal journal = new SFFileJournal.Builder(x)
                                      .setFilename(filename)
                                      .setCreateFile(false)
                                      .build();

              journalMap_.put(filename, journal);
              if ( journal.getFileOffset() == journal.getFileSize() ) continue;

              List<SFEntry> list = new LinkedList<SFEntry>();
              DAO tempDAO = new TempDAO(x, list);


              // Record atime, because read will change the atime.
              long offset = journal.getFileOffset();

              journal.replayFrom(x, tempDAO, offset);

              // Set back the offset.
              journal.setFileOffset(offset);

              for ( int i = 0 ; i < list.size() ; i++ ) {
                SFEntry e = list.get(i);
                e.setFileName(filename);
                onHoldList_.add(e);
              }

              logger_.log("Successfully read " + list.size() + " entries from file: " + journal.getFilename() + " in SF: " + getId());
            }

            if ( getTimeWindow() == -1 ) {
              for ( int i = 0 ; i < onHoldList_.size() ; i++ ) {
                SFEntry e = onHoldList_.get(i);
                if ( e.getCreated().before(timeWindow) ) {
                  updateJournalOffset(e);
                  onHoldList_.remove(0);
                } else {
                  break;
                }
              }
            }

            entryIndex_.set(maxFileIndex * getFileCapacity());
            if ( onHoldList_.size() != 0 ) forward(onHoldList_.get(0));
          }
        }

        isReady_.getAndSet(true);
      `
    },
    {
      name: 'updateNextScheduledTime',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setCurStep(getRetryStrategy().delay(e.getCurStep()));
        if ( e.getCurStep() > getRetryStrategy().maxRetryDelay() ) {
          e.setCurStep(getRetryStrategy().maxRetryDelay());
        }
        e.setScheduledTime(System.currentTimeMillis()+e.getCurStep());
        return e;
      `
    },
    {
      name: 'updateAttempt',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setRetryAttempt(e.getRetryAttempt()+1);
        return e;
      `
    },
    {
      name: 'getStackTrace',
      args: 'SFEntry e, Throwable t',
      javaType: 'String',
      javaCode:`
        String stackTrace = ExceptionUtils.getStackTrace(t);
        Outputter outputter = new Outputter(getX()).setPropertyPredicate(new NetworkPropertyPredicate());
        String entity = outputter.stringify(e.getObject());
        return entity + " \\n " + stackTrace;
      `
    },
    {
      name: 'toFileName',
      documentation: 'shot-cut help method to calculate filename from SFEntry',
      args: 'SFEntry entry',
      javaType: 'String',
      javaCode: `
        long index = entry.getIndex();
        long fileIndex = index / ((long) getFileCapacity());
        return getFileName() + "." + fileIndex;
      `
    },
    {
      name: 'getJournal',
      documentation: 'short-cut help method to get journal.',
      args: 'String filename',
      javaType: 'SFFileJournal',
      javaCode: `
        return journalMap_.computeIfAbsent(filename, k -> createWriteJournal(k));
      `
    },
    {
      name: 'fetchJournal',
      args: 'SFEntry entry',
      javaType: 'SFFileJournal',
      javaCode: `
        return journalMap_.get(entry.getFileName());
      `
    },
    {
      name: 'makeFileName',
      args: 'int suffix',
      javaType: 'String',
      javaCode: `
        return getFileName() + "." + suffix;
      `
    },
    {
      name: 'getFileSuffix',
      documentation: 'help method to get suffix from file name',
      javaType: 'int',
      args: 'String filename',
      javaCode: `
        return Integer.parseInt(filename.split("\\\\.")[1]);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            protected Logger logger_ = null;
            final protected AtomicLong entryIndex_ = new AtomicLong(0);
            final protected Map<String, SFFileJournal> journalMap_ = new ConcurrentHashMap<String, SFFileJournal>();
            final protected Object writeLock_ = new Object();
            final protected Object onHoldListLock_ = new Object();
            final protected AtomicBoolean isReady_ = new AtomicBoolean(false);
            final protected List<SFEntry> onHoldList_ = new LinkedList<SFEntry>();
            final protected PriorityQueue<SFEntry> completedEntries_ = new PriorityQueue<SFEntry>(16, (n, p) -> {
                                                                if ( n.getIndex() < p.getIndex() ) {
                                                                  return -1;
                                                                }
                                                                if ( n.getIndex() > p.getIndex() ) {
                                                                  return 1;
                                                                }
                                                                return 0;
                                                              });

            static private class TempDAO extends ProxyDAO {
              public foam.core.ClassInfo getOf() {
                return SFEntry.getOwnClassInfo();
              }
              protected List<SFEntry> list;
              @Override
              public FObject put_(X x, FObject obj) {
                SFEntry entry = (SFEntry) obj;
                list.add(entry);
                return obj;
              }

              public TempDAO(X x, List<SFEntry> l) {
                super(x, null);
                this.list = l;
              }
            }
          `
        }));
      }
    }
  ]
})
