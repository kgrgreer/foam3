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
      name: 'inFlightEntries',
      documentation: 'In Flight',
      storageTransient: true,
      visibility: 'RO',
      javaSetter:`
        inFlightEntriesIsSet_ = true;
        return;
      `,
      javaGetter:`
        return inFlight_.get();
      `
    },
    {
      class: 'Int',
      name: 'failedEntries',
      documentation: 'Failed',
      storageTransient: true,
      visibility: 'RO',
      javaSetter:`
        failedEntriesIsSet_ = true;
        return;
      `,
      javaGetter:`
        return failed_.get();
      `
    },
    {
      class: 'Int',
      name: 'loggingThredhold',
      documentation: 'Logging after n times retry fail',
      value: 4
    },
    // {
    //   class: 'Map',
    //   name: 'retryCause',
    //   documentation: 'Record fail retry reason',
    //   storageTransient: true,
    //   visibility: 'RO',
    //   factory: function() { return {}; },
    //   javaSetter: `
    //     retryCauseIsSet_ = true;
    //   `,
    //   javaGetter: `
    //     return retryCauseMap_;
    //   `
    // },
    // {
    //   class: 'Map',
    //   name: 'failCause',
    //   documentation: 'Record fail reason',
    //   storageTransient: true,
    //   visibility: 'RO',
    //   factory: function() { return {}; },
    //   javaSetter: `
    //     failCauseIsSet_ = true;
    //   `,
    //   javaGetter: `
    //     return failCauseMap_;
    //   `,
    // },
    {
      class: 'Object',
      name: 'delegateObject',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN',
      visibility: 'HIDDEN',
      transient: true,
    },
    // {
    //   class: 'Object',
    //   name: 'manager',
    //   transient: true,
    //   javaFactory: `
    //     return (SFManager) getX().get("SFManager");
    //   `
    // },
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
    }
  ],

  methods: [
    {
      name: 'getManager',
      javaType: 'SFManager',
      javaCode: `
        return (SFManager) getX().get("SFManager");
      `
    },
    {
      name: 'createWriteJournal',
      args: 'String fileName',
      documentation: 'help function for create a journal',
      javaType: 'SFFileJournal',
      javaCode: `
        return new SFFileJournal.Builder(getX())
                .setFilename(fileName)
                .setCreateFile(true)
                .setDao(new foam.dao.NullDAO())
                .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[SF]", fileName }, new foam.nanos.logger.StdoutLogger()))
                .build();

      `
    },
    {
      name: 'store',
      args: 'FObject fobject',
      javaType: 'SFEntry',
      documentation: 'Persist SFEntry into Journal.',
      javaCode: `
        SFEntry entry = new SFEntry.Builder(getX())
                              .setObject(fobject)
                              .build();

        entry.setCreated(new Date());

        if ( getReplayFailEntry() == true ) {
          long index = entryIndex_.incrementAndGet();
          entry.setIndex(index);
          SFFileJournal journal = getJournal(toFileName(entry));
          return (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);
        } else {
          synchronized(writeLock_) {
            long index = entryIndex_.incrementAndGet();
            entry.setIndex(index);
            SFFileJournal journal = getJournal(toFileName(entry));
            return (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);
          }
        }
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
        inFlight_.incrementAndGet();
        ((SFManager) getManager()).enqueue(e);
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
          //update file a-time.
          maybeUpdateAtime(e);
        }
        inFlight_.decrementAndGet();
        //cleanRetryCause(e);
      `
    },
    {
      name: 'maybeUpdateAtime',
      args: 'SFEntry e',
      documentation: 'try to update byte offset to atime',
      javaCode: `
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
          }
          inFlight_.decrementAndGet();
          failed_.incrementAndGet();
          //cleanRetryCause(e);
          //updateFailCause(e, t);
        } else {
          // if ( e.getRetryAttempt() > getLoggingThredhold() )
          // {
          //   updateRetryCause(e, t);
          // }
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
        // Do nothing if no file
        if ( filenames.size() == 0 ) return;

        List<String> availableFilenames = null;
        //Sort file from high index to low.
        filenames.sort((f1, f2) -> {
          int l1 = Integer.parseInt(f1.split("\\\\.")[1]);
          int l2 = Integer.parseInt(f2.split("\\\\.")[1]);
          return l1 > l2 ? -1 : 1;
        });

        ArraySink sink = new ArraySink(x);
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
            if ( fileLastModifiedDate.before(timeWindow) ) break;
            availableFilenames.add(0, filename);
          }

          if ( availableFilenames.size() == 0 ) {
            availableFilenames.add(filenames.get(filenames.size() - 1));
          }

        }

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
        successEntryIndex_.set((Long)max.getValue());

        tempDAO.where(predicate).select(sink);
        List<SFEntry> sfEntryList = sink.getArray();
        logger_.log("Successfully read " + sfEntryList.size() + " entries from file: " + getFileName() + " in SF: " + getId());
        for ( SFEntry entry : sfEntryList ) {
          forward((SFEntry) entry.fclone());
        }
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
    // {
    //   name: 'updateFailCause',
    //   args: 'SFEntry e, Throwable t',
    //   javaCode: `
    //     String stackTrace = getStackTrace(e, t);
    //     getFailCause().put(e.getIndex(), stackTrace);
    //   `

    // },
    // {
    //   name: 'updateRetryCause',
    //   args: 'SFEntry e, Throwable t',
    //   javaCode:`
    //     String stackTrace = getStackTrace(e, t);
    //     getRetryCause().put(e.getIndex(), stackTrace);
    //   `
    // },
    // {
    //   name: 'cleanRetryCause',
    //   args: 'SFEntry e',
    //   javaCode:`
    //     getRetryCause().remove(e.getIndex());
    //   `
    // },
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
      name: 'createMap',
      documentation: `helper function to create thread safe LRU map`,
      args: 'int capacity',
      javaType: 'Map',
      javaCode:`
        LinkedHashMap<Integer, String> lruMap;
        lruMap = new LinkedHashMap<Integer, String>(capacity, 0.75f, false) {
          protected boolean removeEldestEntry(Map.Entry eldest) {
            return size() > capacity;
          }
        };
        return (Map<Integer, String>) Collections.synchronizedMap(lruMap);
      `
    },
    {
      name: 'isFileProcessComplete',
      documentation: 'helper function to determine if file is processed completed',
      args: 'String fileName',
      javaType: 'boolean',
      javaCode: `
        SFFileJournal journal = getJournal(fileName);
        return journal.getFileSize() == journal.getFileLastAccessTime() ? true : false;
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
            final protected AtomicLong successEntryIndex_ = new AtomicLong(0);
            final protected Map<String, SFFileJournal> journalMap_ = new ConcurrentHashMap<String, SFFileJournal>();
            final protected AtomicInteger inFlight_ = new AtomicInteger(0);
            final protected AtomicInteger failed_ = new AtomicInteger(0);
            final protected Object writeLock_ = new Object();
            // final Map<Integer, String> retryCauseMap_ = createMap(100);
            // final Map<Integer, String> failCauseMap_ = createMap(100);

            //Make to public because beanshell do not support.
            static public interface StepFunction {
              public int next(int cur);
            }

            static private class FilterDAO extends ProxyDAO {
              @Override
              public FObject put_(X x, FObject obj) {
                SFEntry entry = (SFEntry) obj;
                return obj;
              }

              public FilterDAO(X x, DAO delegate) {
                super(x, delegate);
              }
            }

            // protected static ThreadLocal<JSONFObjectFormatter> formatter = new ThreadLocal<JSONFObjectFormatter>() {
            //   @Override
            //   protected JSONFObjectFormatter initialValue() {
            //     return new JSONFObjectFormatter();
            //   }
            //   @Override
            //   public JSONFObjectFormatter get() {
            //     JSONFObjectFormatter b = super.get();
            //     b.reset();
            //     b.setPropertyPredicate(new StoragePropertyPredicate());
            //     b.setOutputShortNames(true);
            //     return b;
            //   }
            // };
  
            // protected JSONFObjectFormatter getFormatter(X x) {
            //   JSONFObjectFormatter f = formatter.get();
            //   f.setX(x);
            //   return f;
            // }
          `
        }));
      }
    }
  ]
})
