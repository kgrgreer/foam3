foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJournal',
  extends: 'foam.dao.ProxyJournal',

  documentation: `This class implements the rolling of the journals. All records
    are constantly being written to a journal file. When the journal becomes
    sufficiently impure and a certain number of records have been written,
    then the journal is rolled over. Rolling over involves: creating a new
    journal file; creating a file for storing an image file which is dump of all
    of the DAOs at that point in time. Replaying the imageinvolves putting all
    of the records directly to the services' delegate DAO.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.FileJournal',
    'foam.dao.MDAO',
    'foam.dao.MapDAO',
    'foam.dao.ProxyDAO',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'foam.lib.json.OutputterMode',
    'foam.nanos.boot.NSpec',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil',

    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.io.File',
    'java.util.ArrayList',
    'java.util.concurrent.atomic.AtomicBoolean',
    'java.util.concurrent.ConcurrentLinkedQueue',
    'java.util.concurrent.CountDownLatch',
    'java.util.concurrent.locks.ReentrantLock',
    'java.util.List',
    'java.util.regex.Matcher',
    'java.util.regex.Pattern',
    'java.util.stream.Collectors',
    'java.util.Queue'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
            @Override
            protected StringBuilder initialValue() {
              return new StringBuilder();
            }

            @Override
            public StringBuilder get() {
              StringBuilder b = super.get();
              b.setLength(0);
              return b;
            }
          };

          protected static Pattern COMMENT = Pattern.compile("(/\\\\*([^*]|[\\\\r\\\\n]|(\\\\*+([^*/]|[\\\\r\\\\n])))*\\\\*+/)|(//.*)");

          // Boolean to lock writing to the DAOs
          protected volatile boolean daoLock_ = false;

          // Boolean to check if the image file is being replayed
          protected volatile boolean journalReplayed_ = false;

          // Queue to store all of the DAO records to be written to the image file
          protected Queue<String> imageWriterQueue_ = new ConcurrentLinkedQueue<String>();

          // Lock to increment the record counts.
          protected ReentrantLock incrementLock_ = new java.util.concurrent.locks.ReentrantLock();
        `);
      }
    }
  ],

  constants: [
    {
      name: 'IMPURITY_THRESHOLD',
      documentation: 'A journal is rolled over after this threshold is reached.',
      type: 'double',
      value: 0.85
    },
    {
      name: 'MIN_RECORDS',
      documentation: `The impurity threshold is used only after these many
        records exist in the journal.`,
      type: 'long',
      value: '4300000000L'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'journalHome',
      javaFactory: 'return System.getProperty("JOURNAL_HOME");'
    },
    {
      class: 'Long',
      name: 'impurityLevel',
      documentation: `A journal's impurity is calculated as: new record (0),
        update (1), remove (1), all divided by the total number of records.`,
      value: 0
    },
    {
      class: 'Long',
      name: 'totalRecords',
      documentation: 'Total number of records in the journal.',
      value: 0
    },
    {
      class: 'Long',
      name: 'journalNumber',
      documentation: 'Journal number currently being written to.',
      value: 0
    },
    {
      class: 'Object',
      name: 'writer',
      javaType: 'java.io.BufferedWriter'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new StdoutLogger();
        }
        return new PrefixLogger(new Object[] { "[JDAO]", ((FileJournal) getDelegate()).getFilename() }, logger);
      `
    },
    {
      class: 'Boolean',
      name: 'writeImage',
      documentation: `When set to true, the DAOs are still being dumped into
        imageWriterQueue. When all of the DAOs are read, then it is set to false.`
    }
  ],

  static: [
    {
      name: 'getNextJournalNumber',
      documentation: `Scan the journals directory and retrieve the next journal
        number.`,
      javaReturns: 'long',
      javaCode: `
        File folder = new File(System.getProperty("JOURNAL_HOME"));
        File[] listOfFiles = folder.listFiles();
        Pattern p = Pattern.compile("journal\\\\.\\\\d*");
        long journalNumber = -1;

        for ( int i = 0; i < listOfFiles.length; i++ ) {
          if ( listOfFiles[i].isFile() ) {
            String fileName = listOfFiles[i].getName();
            Matcher m = p.matcher(fileName);

            if ( m.matches() ) {
              long jn = Long.parseLong(fileName.substring(fileName.indexOf(".") + 1));
              if ( jn > journalNumber ) {
                journalNumber = jn;
              }
            }
          }
        }

        return ++journalNumber;
      `
    },
    {
      name: 'getNextJournal',
      documentation: `Scan the journals directory and retrieve the next journal.`,
      javaReturns: 'File',
      javaCode: `
        File file = null;

        try {
          file = new File(System.getProperty("JOURNAL_HOME") + "/journal." + getNextJournalNumber());
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        return file;
      `
    },
    {
      name: 'getImageFileNumber',
      documentation: `Scan the journals directory and retrieve the image journal
        number to be read.`,
      javaReturns: 'long',
      javaCode: `
        File folder = new File(System.getProperty("JOURNAL_HOME"));
        File[] listOfFiles = folder.listFiles();
        Pattern p = Pattern.compile("image\\\\.\\\\d*");
        long journalNumber = -1;

        for ( int i = 0; i < listOfFiles.length; i++ ) {
          if ( listOfFiles[i].isFile() ) {
            String fileName = listOfFiles[i].getName();
            Matcher m = p.matcher(fileName);

            if ( m.matches() ) {
              long jn = Long.parseLong(fileName.substring(fileName.indexOf(".") + 1));
              if ( jn > journalNumber ) {
                journalNumber = jn;
              }
            }
          }
        }

        return journalNumber;
      `
    }
  ],

  classes: [
    {
      name: 'NameDAOPair',
      documentation: 'Class to store service name mapped to its DAO.',
      properties: [
        {
          class: 'Object',
          name: 'dao',
          of: 'foam.dao.DAO'
        },
        {
          class: 'String',
          name: 'name'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'isJournalImpure',
      synchronized: true,
      javaReturns: 'boolean',
      javaCode: `
        return getTotalRecords() != 0 && (double) getImpurityLevel() / (double) getTotalRecords() > IMPURITY_THRESHOLD && getTotalRecords() >= MIN_RECORDS;
      `
    },
    {
      name: 'incrementRecord',
      args: [
        {
          name: 'impure',
          class: 'Boolean'
        }
      ],
      javaCode: `
        incrementLock_.lock();

        if ( impure )
          setImpurityLevel(getImpurityLevel() + 1);

        setTotalRecords(getTotalRecords() + 1);
        incrementLock_.unlock();
      `
    },
    {
      name: 'createJournal',
      args: [
        {
          class: 'String',
          name: 'name'
        }
      ],
      javaReturns: 'java.io.File',
      javaCode: `
        try {
          getLogger().log("RollingJournal :: Creating journal: " + name);
          File file = getX().get(Storage.class).get(name);

          File dir = file.getAbsoluteFile().getParentFile();
          if ( ! dir.exists() ) {
            getLogger().log("RollingJournal :: Create dir: " + dir.getAbsolutePath());
            dir.mkdirs();
          }

          if ( ! file.getAbsoluteFile().createNewFile() ) {
            getLogger().error("RollingJournal :: Journal " + name + " already exists.");
            throw new java.nio.file.FileAlreadyExistsException(name);
          }

          getLogger().info("RollingJournal :: New journal created: " + name);
          return file;
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to create new journal. ", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'renameJournal',
      args: [
        {
          javaType: 'java.io.File',
          name: 'fileFrom'
        },
        {
          javaType: 'String',
          name: 'fileToName'
        }
      ],
      javaCode: `
        File fileTo = getX().get(Storage.class).get(fileToName);
        try {
          if ( fileFrom.renameTo(fileTo) ) {
            getLogger().info("RollingJournal :: Journal renamed " + fileFrom.getName() + " -->> " + fileTo.getName());
          }
          else {
            getLogger().error("RollingJournal :: Could not rename journal " + fileFrom.getName() + " to " + fileTo.getName());
            throw new IllegalArgumentException(fileToName);
          }
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to rename journal " + fileFrom.getName() + " to " + fileTo.getName(), t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'setJournalReader',
      documentation: `Reset the delegate\'s reader. This usually occurs once the
        journals have rolled and a new file is set.`,
      javaCode: `
        try {
          ((FileJournal) getDelegate()).setReader(new BufferedReader(new FileReader(((FileJournal) getDelegate()).getFile())));
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to read from journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'setJournalWriter',
      documentation: `Reset the delegate\'s writer. This usually occurs once the
              journals have rolled and a new file is set.`,
      javaCode: `
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(((FileJournal) getDelegate()).getFile(), true), 16 * 1024);
          writer.newLine();
          ((FileJournal) getDelegate()).setWriter(writer);
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to create writer", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'write_',
      synchronized: true,
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          class: 'String',
          name: 'record'
        }
      ],
      javaCode: `
        BufferedWriter writer = getWriter();
        writer.write(record);
        writer.newLine();
        writer.flush();
      `
    },
    {
      name: 'imageWriter',
      documentation: `Image writing consumer; consumes from the imageWriterQueue
        and writes the records to the image file until the queue is empty and
        all of the DAOs have been read (dumped) into the Queue.`,
      javaCode: `
        Thread writer = new Thread() {
          @Override
          public void run() {
            long lines_ = 0;
            while ( ! imageWriterQueue_.isEmpty() || getWriteImage() ) {
              try {
                String record = imageWriterQueue_.poll();
                if ( record != null ){
                  write_(record);
                  ++lines_;
                }
              } catch (Throwable t) {
                getLogger().error("RollingJournal :: Failed to write entry to image journal", t);
                throw new RuntimeException(t);
              }
            }

            getLogger().info("RollingJournal :: Wrote " + lines_ + " entries to the image.");
          }
        };

        writer.start();
      `
    },
    {
      name: 'DAOImageDump',
      documentation: `Image writing producer; dumps the dao, pre-pending the DAO
        name, onto the imageWriterQueue`,
      args: [
        {
          name: 'serviceName',
          javaType: 'String'
        },
        {
          name: 'dao',
          javaType: 'foam.dao.DAO'
        },
        {
          name: 'latch',
          javaType: 'CountDownLatch'
        }
      ],
      javaCode: `
        Thread daoDump = new Thread() {
          @Override
          public void run() {
            try {
              dao.select(new AbstractSink() {
                @Override
                public void put(Object obj, Detachable sub) {
                  Outputter outputter = new Outputter(OutputterMode.STORAGE);
                  String record = outputter.stringify((FObject) obj);

                  imageWriterQueue_.offer(sb.get()
                    .append(serviceName)
                    .append(".p(")
                    .append(record)
                    .append(")")
                    .toString());
                }
              });
            } catch ( Throwable t ) {
             getLogger().error("RollingJournal :: Couldn't run select on the DAO : " + serviceName);
            } finally {
              /\* Signal that all records in the DAO were appended to the concurrent queue. */\
              latch.countDown();
            }
          }
        };

        daoDump.start();
      `
    },
    {
      name: 'rollJournal',
      synchronized: true,
      args: [
        {
          name: 'x',
          javaType: 'X'
        }
      ],
      javaCode: `
        /\* Lock all DAO journal writing operations.*/\
        daoLock_ = true;

        /\* Roll over journal name. */\
        setJournalNumber(getJournalNumber() + 1);
        FileJournal delegate = (FileJournal) getDelegate();
        delegate.setFilename("journal." + getJournalNumber());
        delegate.setFile(createJournal(delegate.getFilename()));
        setJournalReader();
        setJournalWriter();

        /\* Create image journal. */\
        String imageName = "image.dump";
        File imageDumpFile = createJournal(imageName);
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(imageDumpFile), 16 * 1024);
          setWriter(writer);
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to create writer", t);
          throw new RuntimeException(t);
        }

        /\* Write daos to image file. */\
        DAO nSpecDAO = (DAO) x.get("nSpecDAO");
        ArraySink sink = (ArraySink) nSpecDAO.select(null);
        List<NSpec> nSpecs = (List<NSpec>) sink.getArray();
        List<NameDAOPair> pairs = new ArrayList<NameDAOPair>();
        int totalDAOs = 0;

        for ( NSpec nspec : nSpecs ){
          String daoName = nspec.getName();
          Object obj = x.get(daoName);

          if ( obj instanceof DAO ){
            pairs.add(new NameDAOPair.Builder(x).setName(daoName).setDao(obj).build());
            ++totalDAOs;
          }
        }

        /\**
          * Need a lock to signal to the writer to stop executing once all of
          * the DAOs have been dumped onto the imageWriterQueue
          */\
        final CountDownLatch latch = new CountDownLatch(totalDAOs);
        setWriteImage(true);
        imageWriter(); // Start the image writer

        for ( NameDAOPair dao : pairs ) {
          DAOImageDump(dao.getName(), (DAO) dao.getDao(), latch);
        }

        /\* Reset counters. */\
        setImpurityLevel(0);
        setTotalRecords(0);

        /\* Wait for the DAOs to have pushed all of the records to the concurrent queue. */\
        try {
          latch.await();
        } catch (Throwable t) {
          getLogger().error("RollingJournal :: Thread interrupted ", t);
          throw new RuntimeException(t);
        }

        /\* Release lock on DAO journal writing. */\
        daoLock_ = false;

        renameJournal(imageDumpFile, "image." + getJournalNumber());
        setWriteImage(false);

        getLogger().info("RollingJournal :: Journal rolled over and image file generated.");
      `
    },
    {
      name: 'replayJournal',
      documentation: 'Replaying the journal.',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'journalName',
          class: 'String'
        }
      ],
      javaThrows: [ 'java.io.IOException' ],
      javaCode: `
        // count number of lines successfully read
        long successReading = 0;
        JSONParser parser = ((FileJournal) getDelegate()).getParser();

        try (BufferedReader reader = new BufferedReader(new FileReader(new File(System.getProperty("JOURNAL_HOME") + journalName)))) {
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( SafetyUtil.isEmpty(line) ) continue;
            if ( COMMENT.matcher(line).matches() ) continue;

            try {
              String[] split = line.split("\\\\.", 2);
              if ( split.length != 2 ) {
                continue;
              }

              String service = split[0];
              line = split[1];

              int length = line.trim().length();
              line = line.trim().substring(2, length - 1);

              DAO serviceDAO = (DAO) x.get(service);
              FObject obj = parser.parseString(line);

              if ( obj == null ) {
                getLogger().error("RollingJournal :: Parsing error", ((FileJournal) getDelegate()).getParsingErrorMessage(line), "on line:", line);
                continue;
              } else {
                DAO delegatedDAO = serviceDAO;

                // drill down the MapDAO/MDAO and put directly into it to avoid hitting the decorators
                while ( delegatedDAO instanceof ProxyDAO ) {
                  delegatedDAO = ((ProxyDAO) delegatedDAO).getDelegate();
                }

                delegatedDAO.put(obj);
              }

              successReading++;
            } catch ( Throwable t ) {
              getLogger().error("RollingJournal :: Error replaying journal line: ", line, t);
            }
          }
        } catch ( Throwable t ) {
          getLogger().error("RollingJournal :: Failed to read from journal. ", t);
          throw t;
        }

        getLogger().log("RollingJournal :: Successfully read " + successReading + " entries from journal: " + journalName);
      `
    },
    {
      name: 'put',
      documentation: 'Overriding regular put to a journal.',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          of: 'FObject',
          name: 'obj'
        }
      ],
      javaCode: `
        /\* Busy wait when the journals are being rolled. */\
        while ( daoLock_ ) {
          try {
            Thread.sleep(10);
          } catch ( InterruptedException e ){
            getLogger().error("RollingJournal :: put wait interrupted. " + e);
          }
        }

        getDelegate().put(x, obj);
        incrementRecord(false);

        if ( isJournalImpure() )
          rollJournal(x);
      `
    },
    {
      name: 'put_',
      documentation: 'Overriding put with an update to a journal.',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          of: 'FObject',
          name: 'old'
        },
        {
          of: 'FObject',
          name: 'nu'
        }
      ],
      javaCode: `
        /\* Busy wait when the journals are being rolled. */\
        while ( daoLock_ ) {
          try {
            Thread.sleep(10);
          } catch ( InterruptedException e ){
            getLogger().error("RollingJournal :: put_ wait interrupted. " + e);
          }
        }

        getDelegate().put_(x, old, nu);

        if ( old != null) { // if this is an update- it's dirty put
          if ( ! SafetyUtil.isEmpty(((FileJournal) getDelegate()).getOutputter().stringifyDelta(old, nu)) )
            incrementRecord(true);
        } else { // else it is a new put- it's clean
          incrementRecord(false);
        }

        if ( isJournalImpure() )
          rollJournal(x);
      `
    },
    {
      name: 'remove',
      documentation: 'Overriding remove from the journal.',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          of: 'FObject',
          name: 'obj'
        }
      ],
      javaCode: `
        /\* Busy wait when the journals are being rolled. */\
        while ( daoLock_ ) {
          try {
            Thread.sleep(10);
          } catch ( InterruptedException e ){
            getLogger().error("RollingJournal :: put_ wait interrupted. " + e);
          }
        }

        getDelegate().remove(x, obj);
        incrementRecord(true); // Removes are always dirty

        if ( isJournalImpure() )
          rollJournal(x);
      `
    },
    {
      name: 'replay',
      documentation: `Replays the image journal.`,
      synchronized: true,
      javaCode: `
        if ( ! journalReplayed_ ) {
          journalReplayed_ = true;

          long imageNumber = getImageFileNumber();

          if ( imageNumber == -1 ) {
            getLogger().warning("RollingJournal :: No image file found!");
            journalReplayed_ = false;
            return;
          } else {
            getLogger().info("RollingJournal :: Reaplaying image : image." + imageNumber);
          }

          // Replay the image file
          try {
            replayJournal(x, "/image." + imageNumber);
          } catch ( Throwable t ) {
            journalReplayed_ = false;
            new RuntimeException(t);
          }

          long lastJournal = getJournalNumber() - 1;
          if ( lastJournal >= 0) {
            getLogger().info("RollingJournal :: Replaying last journal : journal." + lastJournal);

            // Replay the last journal file as it may not have been rolled yet.
            try {
              replayJournal(x, "/journal." + lastJournal);
            } catch ( Throwable t ) {
              journalReplayed_ = false;
              new RuntimeException(t);
            }

            // Create a new image file for fast boot up next time
            rollJournal(x);
          } else {
            getLogger().warning("RollingJournal :: No journal found to replay!");
          }
        }
      `
    }
  ]
});
