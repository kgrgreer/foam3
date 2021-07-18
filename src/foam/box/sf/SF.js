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
    'java.nio.file.*',
    'java.nio.file.attribute.*',
    'java.io.IOException',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.*'
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
      name: 'fileCapability',
      value: 1024
    },
    {
      name: 'retryStrategy',
      class: 'Enum',
      of: 'foam.box.sf.RetryStrategy',
      value: 'CONST_FOUR_SECOND'
    },
    {
      class: 'Int',
      name: 'maxRetryDelayMS',
      documentation: 'Unit in Millisecond',
      value: 20000
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
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
      documentation: 'only reforward unsuccessful entires when system comes up',
      value: false
    },
    //TODO: todo feature.
    {
      class: 'Boolean',
      name: 'storeAfterFirstFail',
      documentation: 'The SF presist entry only after first time fail',
      value: false
    },
    {
      class: 'Object',
      name: 'delegateObject',
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
      javaType: 'Journal',
      javaCode: `
        return new foam.dao.WriteOnlyF3FileJournal.Builder(getX())
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
        long index = entryIndex_.	incrementAndGet();
        long fileIndex = index / ((long) getFileCapability());
        entry.setIndex(index);
        String filename = getFileName() + "." + fileIndex;
        Journal journal = journalMap_.computeIfAbsent(filename, k -> createWriteJournal(k));
        
        return (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);
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
      name: 'successForward',
      args: 'SFEntry e',
      documentation: 'handle entry when retry success',
      javaCode: `
        if ( getReplayFailEntry() == true ) {
          e.setStatus(SFStatus.COMPLETED);
          long index = e.getIndex();
          long fileIndex = index / ((long) getFileCapability());
          String filename = getFileName() + "." + fileIndex;
          Journal journal = journalMap_.computeIfAbsent(filename, k -> createWriteJournal(k));
          journal.put(getX(), "", (DAO) getNullDao(), e);
        }
      `
    },
    {
      name: 'failForward',
      args: 'SFEntry e',
      documentation: 'handle entry when retry fail',
      javaCode: `
        /* Check retry attempt, then Update ScheduledTime and enqueue. */
        if ( getMaxRetryAttempts() > -1 && 
              e.getRetryAttempt() >= getMaxRetryAttempts() )  {
          logger_.warning("retryAttempt >= maxRetryAttempts", e.getRetryAttempt(), getMaxRetryAttempts(), e.toString());

          if ( getReplayFailEntry() == true ) {
            e.setStatus(SFStatus.CANCELLED);
            long index = e.getIndex();
            long fileIndex = index / ((long) getFileCapability());
            String filename = getFileName() + "." + fileIndex;
            Journal journal = journalMap_.computeIfAbsent(filename, k -> createWriteJournal(k));
            journal.put(getX(), "", (DAO) getNullDao(), e);
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
      name: 'init',
      args: 'Context x',
      documentation: 'when system start, SFManager will call this service to initial re-forward',
      javaCode: `
        logger_ = new PrefixLogger(new Object[] {
                    this.getClass().getSimpleName(),
                    this.getFileName()
                  }, (Logger) x.get("logger"));
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

          Journal journal = new F3FileJournal.Builder(x)
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
      `
    },
    {
      name: 'updateNextScheduledTime',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setCurStep(getRetryStrategy().next(e.getCurStep()));
        if ( e.getCurStep() > getMaxRetryDelayMS() ) {
          e.setCurStep(getMaxRetryDelayMS());
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
            final protected Map<String, Journal> journalMap_ = new ConcurrentHashMap<String, Journal>();

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
          `
        }));
      }
    }
  ]
})