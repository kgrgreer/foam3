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
  extends: 'foam.dao.CompositeJournal',

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
      value: 0
    },
    {
      class: 'Int',
      name: 'fileCapability',
      value: 1024
    },
    {
      class: 'Boolean',
      name: 'enable',
      value: true
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
      class: 'FObjectArray',
      of: 'foam.dao.Journal',
      name: 'delegates'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      name: 'storeJournal',
      javaFactory: `
        return new foam.dao.WriteOnlyF3FileJournal.Builder(getX())
                .setFilename(getFileName() + "." + getFileSuffix())
                .setCreateFile(true)
                .setDao(new foam.dao.NullDAO())
                .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[SF]", getFileName() }, new foam.nanos.logger.StdoutLogger()))
                .build();
      `
    },
    {
      class: 'Int',
      name: 'timeWindow',
      documentation: 'In second.',
      value: 240
    },
    {
      class: 'Object',
      name: 'delegateObject',
      transient: true,
    },
    {
      class: 'Object',
      name: 'manager',
      transient: true,
      javaFactory: `
        return (SFManager) getX().get("SFManager");
      `
    },
    {
      class: 'Object',
      name: 'nullDao',
      transient: true,
      javaFactory: `
        return new NullDAO.Builder(getX()).setOf(SFEntry.getOwnClassInfo()).build();
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
      name: 'createWriteJournal',
      args: 'String fileName',
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
      javaCode: `
        SFEntry entry = new SFEntry.Builder(getX())
                              .setObject(fobject)
                              .build();
        
        entry.setCreated(new Date());
        long index = entryIndex_.	incrementAndGet();
        long fileIndex = index / ((long) getFileCapability());
        long entryIndex = index % ((long) getFileCapability());
        entry.setIndex(entryIndex);
        String filename = getFileName() + fileIndex;
        Journal journal = journalMap_.putIfAbsent(filename, createWriteJournal(filename));
        
        return (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);
      `
    },
    {
      name: 'forward',
      args: 'SFEntry e',
      javaCode: `
        /* Assign initial time and enqueue. */
        e.setScheduledTime(System.currentTimeMillis());
        ((SFManager) getManager()).enqueue(e);
      `
    },
    {
      name: 'successForward',
      args: 'SFEntry e',
      javaCode: `
        /* Update journal for success - depends on strategy. */
      `
    },
    {
      name: 'failForward',
      args: 'SFEntry e',
      javaCode: `
        /* Check retry attempt, then Update ScheduledTime and enqueue. */
        if ( getMaxRetryAttempts() > -1 && 
              e.getRetryAttempt() >= getMaxRetryAttempts() )  {
          getLogger().warning("retryAttempt >= maxRetryAttempts", e.getRetryAttempt(), getMaxRetryAttempts(), e.toString());

          //TODO: update journal when exceed max retry? - on stratepgy

        } else {
          updateNextScheduledTime(e);
          updateAttempt(e);
          ((SFManager) getManager()).enqueue(e);
        }
      `
    },
    // {
    //   name: 'submit',
    //   args: 'Context x, SFEntry entry',
    //   abstract: true,
    //   javaCode: `
    //     throw new RuntimeException("Do not implement");
    //     // Object delegate = getDelegateObject();
    //     // if ( delegate instanceof Box ) ((Box) delegate).send((Message) entry.getObject());
    //     // else if ( delegate instanceof DAO ) ((DAO) delegate).put_(x, entry.getObject());
    //     // else if ( delegate instanceof Sink ) ((Sink) delegate).put(entry.getObject(), null);
    //     // else throw new RuntimeException("DelegateObject do not support"); 
    //   `
    // },
    {
      name: 'initForwarder',
      args: 'Context x',
      javaCode: `
        FileSystemStorage fileSystemStorage = (FileSystemStorage) x.get(Storage.class);
        List<String> filenames = new ArrayList<>(fileSystemStorage.getAvailableFiles("", getFileName()+".*"));
        // Do nothing if no file
        if ( filenames.size() == 0 ) return;

        List<String> availableFilenames = new ArrayList<>();
        //Sort file from high index to low.
        filenames.sort((f1, f2) -> {
          int l1 = Integer.parseInt(f1.split("\\\\.")[1]);
          int l2 = Integer.parseInt(f2.split("\\\\.")[1]);
          return l1 > l2 ? -1 : 1;
        });

        Calendar rightNow = Calendar.getInstance();
        rightNow.add(Calendar.SECOND, -getTimeWindow());
        Date timeWindow = rightNow.getTime();

        for ( String filename : filenames ) {
          BasicFileAttributes attr = fileSystemStorage.getFileAttributes(filename);
          Date fileLastModifiedDate = new Date(attr.lastModifiedTime().toMillis());
          if ( fileLastModifiedDate.before(timeWindow) ) break;
          availableFilenames.add(0, filename);
        }

        if ( availableFilenames.size() == 0 ) {
          availableFilenames.add(filenames.get(filenames.size() - 1));
        }

        // Find re forward entry.
        long latestIndex = -1;
        MDAO tempDAO = new MDAO(SFEntry.getOwnClassInfo());
        for ( String filename : availableFilenames ) {

          Journal journal = new F3FileJournal.Builder(x)
                              .setDao(tempDAO)
                              .setFilename(filename)
                              .setCreateFile(false)
                              .build();
          journal.replay(x, tempDAO);
        }
        ArraySink sink = new ArraySink(x);
        tempDAO.where(
          MLang.GTE(SFEntry.CREATED, timeWindow)
        ).select(sink);
        List<SFEntry> sfEntryList = sink.getArray();
        //TODO: enqueue.
        Max max = (Max) tempDAO.select(MLang.MAX(SFEntry.INDEX));
        entryIndex_.set((Long)max.getValue());

        for ( SFEntry entry : sfEntryList ) {
          forward(entry);
        }
      `
    },
    {
      name: 'updateNextScheduledTime',
      args: 'SFEntry e',
      javaType: 'SFEntry',
      javaCode: `
        e.setCurStep(getStepFunction().next(e.getCurStep()));
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
            final protected AtomicLong entryIndex_ = new AtomicLong(0);
            final protected Map<String, Journal> journalMap_ = new ConcurrentHashMap<String, Journal>();

            public abstract void submit(X x, SFEntry entry);

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