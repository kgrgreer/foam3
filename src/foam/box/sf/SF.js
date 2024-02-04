/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
    'foam.mlang.sink.Max',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.util.retry.RetryStrategy',
    'foam.util.retry.RetryForeverStrategy',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.lib.NetworkPropertyPredicate',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.StoragePropertyPredicate',
    'foam.log.LogLevel',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Loggers',
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

  tableColumns: [
    'id',
    'filePrefix',
    'fileName',
    'fileCapacity',
    'inFlightLimit'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'filePrefix',
      value: '../saf/'
    },
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Int',
      name: 'fileCapacity',
      value: 1024
    },
    {
      name: 'retryStrategy',
      class: 'FObjectProperty',
      of: 'foam.util.retry.RetryStrategy',
      javaFactory: `
        return (new RetryForeverStrategy.Builder(null))
          .setRetryDelay(4000)
          .build();
      `
    },
    {
      class: 'Int',
      name: 'timeWindow',
      units: 's',
      documentation: `When app starts, replay entries in timeWindow ago from now(the time that app starts).
                      if -1, no using timeWindow`,
      value: -1
    },
    {
      class: 'Boolean',
      name: 'ready',
      storageTransient: true,
      value: false,
      javaSetter:`
        readyIsSet_ = true;
        ready_ = val;
        isReady_.getAndSet(val);
        return;
      `,
      javaGetter: `
        return isReady_.get();
      `
    },
    {
      class: 'Int',
      name: 'inFlightLimit',
      value: 1024
    },
    {
      class: 'Object',
      name: 'delegateObject',
      visibility: 'HIDDEN',
      transient: true,
    },
    {
      class: 'Object',
      name: 'nullDao',
      transient: true,
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
      documentation: 'helper function to create the SAF journal',
      javaType: 'SFFileJournal',
      javaCode: `
        SFFileJournal journal = new SFFileJournal.Builder(getX())
                                  .setFilename(getFilePrefix() + fileName)
                                  .setCreateFile(false)
                                  .setDao(new foam.dao.NullDAO())
                                  .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[SF]", fileName }, foam.nanos.logger.StdoutLogger.instance()))
                                  .build();
        if ( journal.getFileExist() == false ) {
          journal.createJournalFile();
          journal.setFileOffset(0);
        } else {
          journal.setFileOffset(journal.getFileSize());
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
      javaType: 'FObject',
      documentation: 'write entry to journal and forward',
      javaCode: `
        if ( ! getReady() ) throw new RuntimeException("SAF: " + getId() + " is not ready or did not initial properly");

        SFEntry entry = null;
        if ( fobject instanceof SFEntry ) {
          entry = (SFEntry) fobject;
        } else {
          entry = new SFEntry(getX());
          entry.setObject(fobject);
        }
        entry.setCreated(new Date());

        synchronized ( writeLock_ ) {
          long index = entryIndex_.incrementAndGet();
          entry.setIndex(index);
          SFFileJournal journal = getJournal(toFileName(entry));
          entry = (SFEntry) journal.put(getX(), "", (DAO) getNullDao(), entry);

          synchronized ( onHoldListLock_ ) {
            if ( onHoldList_.isEmpty() ) {
              onHoldList_.add(entry);
              FObject o = (FObject) getRetryStrategy();
              entry.setRetryStrategy((RetryStrategy) o.fclone());
              cleanEntryInfos();
              forward(entry);
            } else {
              onHoldList_.add(entry);
            }
          }
        }
        return fobject.fclone();
      `
    },
    {
      name: 'successForward',
      args: 'SFEntry e',
      documentation: 'handle entry when retry success',
      javaCode: `
        updateJournalOffsetAndForwardNext(e);
      `
    },
    {
      name: 'updateJournalOffsetAndForwardNext',
      args: 'SFEntry e',
      javaCode: `
        updateJournalOffset(e);

        synchronized ( onHoldListLock_ ) {
          onHoldList_.remove(0);
          if ( ! onHoldList_.isEmpty() ) {
            SFEntry s = (SFEntry) onHoldList_.get(0);
            FObject o = (FObject) getRetryStrategy();
            s.setRetryStrategy((RetryStrategy) o.fclone());
            cleanEntryInfos();
            forward(s);
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
        if ( ! getRetryStrategy().canRetry(getX()) )  {
          logger_.warning("Retry end: ", e.toString());
          updateJournalOffsetAndForwardNext(e);
        } else {
          updateNextScheduledTime(e);
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
        else {
          Loggers.logger(getX(), this).error("DelegateObject type not supported", delegate.getClass().getName());
          throw new RuntimeException("DelegateObject type not supported");
        }
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
        java.io.File folder = fileSystemStorage.get(getFilePrefix());
        if ( ! folder.exists() ) folder.mkdir();
        List<String> filenames = new ArrayList<>(fileSystemStorage.getAvailableFiles(getFilePrefix(), getFileName()+".*"));

        if ( filenames.size() == 0 ) {
          isReady_.getAndSet(true);
          return;
        }

        List<String> availableFilenames = null;
        //Sort file from high index to low.
        filenames.sort((f1, f2) -> {
          int l1 = getFileSuffix(f1);
          int l2 = getFileSuffix(f2);
          return l1 > l2 ? -1 : 1;
        });

        Date timeWindow = null;
        maxFileIndex_ = getFileSuffix(filenames.get(0));

        if ( getTimeWindow() == -1 ) {
          Collections.reverse(filenames);
          availableFilenames = filenames;
        } else {
          availableFilenames = new ArrayList<>();
          Calendar rightNow = Calendar.getInstance();
          rightNow.add(Calendar.SECOND, -getTimeWindow());
          timeWindow = rightNow.getTime();

          for ( String filename : filenames ) {
            BasicFileAttributes attr = fileSystemStorage.getFileAttributes(getFilePrefix() + getSimpleFilename(filename));
            Date fileLastModifiedDate = new Date(attr.lastModifiedTime().toMillis());
            //TODO: mark journal as finished if unneed.
            if ( fileLastModifiedDate.before(timeWindow) ) break;
            availableFilenames.add(0, filename);
          }

        }

        synchronized ( onHoldListLock_ ) {

          for ( String filename : availableFilenames ) {

            SFFileJournal journal = new SFFileJournal.Builder(x)
                                    .setFilename(getFilePrefix() + getSimpleFilename(filename))
                                    .setCreateFile(false)
                                    .build();

            journalMap_.put(getSimpleFilename(filename), journal);
            if ( journal.getFileOffset() == journal.getFileSize() ) {
              ((DAO) x.get("eventRecordDAO")).put(new EventRecord(getX(), this, "SAF file complete", getId(), null, "file: " + getSimpleFilename(filename), LogLevel.INFO, null));
              continue;
            }
            if ( journal.getFileOffset() > journal.getFileSize() ) {
              ((DAO) x.get("eventRecordDAO")).put(new EventRecord(getX(), this, "SAF file error", getId(), null, "Atime of file: " + getSimpleFilename(filename) + " is greater than its filesize", LogLevel.ERROR, null));
              journal.setFileOffset(journal.getFileSize());
              continue;
            }

            List<SFEntry> list = new LinkedList<SFEntry>();
            DAO tempDAO = new TempDAO(x, list);


            // Record atime, because read will change the atime.
            long offset = journal.getFileOffset();

            journal.replayFrom(x, tempDAO, offset);

            // Set back the offset.
            journal.setFileOffset(offset);

            for ( int i = 0 ; i < list.size() ; i++ ) {
              SFEntry e = list.get(i);
              onHoldList_.add(e);
            }

            logger_.log("Successfully read " + list.size() + " entries from file: " + journal.getFilename() + " in SF: " + getId());
          }

          if ( getTimeWindow() > -1 ) {
            for ( int i = onHoldList_.size() ; i > 0 ; i-- ) {
              SFEntry e = onHoldList_.remove(0);
              if ( e.getCreated().before(timeWindow) ) {
                updateJournalOffset(e);
              } else {
                onHoldList_.add(0, e);
                break;
              }
            }
          }

          entryIndex_.set(maxFileIndex_ * getFileCapacity());

          if ( ! onHoldList_.isEmpty() ) {
            SFEntry s = (SFEntry) onHoldList_.get(0);
            FObject o = (FObject) getRetryStrategy();
            s.setRetryStrategy((RetryStrategy) o.fclone());
            cleanEntryInfos();
            forward(s);
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
        entryCurStep_ = e.getRetryStrategy().getRetryDelay(getX());
        e.setScheduledTime(System.currentTimeMillis()+entryCurStep_);
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
        return journalMap_.get(toFileName(entry));
      `
    },
    {
      name: 'getFileSuffix',
      documentation: 'help method to get suffix from file name',
      javaType: 'int',
      args: 'String filename',
      javaCode: `
        return Integer.parseInt(filename.split("\\\\.")[filename.split("\\\\.").length-1]);
      `
    },
    {
      name: 'getSimpleFilename',
      args: 'String filename',
      javaType: 'String',
      javaCode: `
        return filename.split("/")[filename.split("/").length-1];
      `
    },
    {
      name: 'cleanEntryInfos',
      javaCode: `
        entryCurStep_ = 0;
      `
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            protected Logger logger_ = null;
            protected volatile long entryCurStep_ = 0;

            final protected AtomicLong entryIndex_ = new AtomicLong(0);
            final protected Map<String, SFFileJournal> journalMap_ = new ConcurrentHashMap<String, SFFileJournal>();
            final protected Object writeLock_ = new Object();
            final protected Object onHoldListLock_ = new Object();
            final protected AtomicBoolean isReady_ = new AtomicBoolean(false);
            final protected List<SFEntry> onHoldList_ = new LinkedList<SFEntry>();
            protected volatile int maxFileIndex_ = 0;

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
});
