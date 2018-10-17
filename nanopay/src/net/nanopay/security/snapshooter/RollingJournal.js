foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJournal',
  extends: 'foam.dao.ProxyJournal',

  documentation: `This class implements the rolling of the journals. All records
    are constantly being written to a journal file. When the journal becomes
    sufficiently impure or a certain time has passed, whichever comes first,
    then the journal is rolled over. Rolling over involves: creating a new
    journal file; creating a file for storing an image file which is dump of all
    of the DAOs at that point in time.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.AbstractSink',
    'foam.dao.FileJournal',
    'foam.nanos.boot.NSpec',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',

    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.FileReader',
    'java.io.FileWriter',
    'java.io.File',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.stream.Collectors',
    'java.util.regex.Pattern',
    'java.util.regex.Matcher'
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

          protected volatile boolean daoLock_ = false;
        `);
      }
    }
  ],

  constants: [
    {
      name: 'IMPURITY_THRESHOLD',
      documentation: 'A journal is rolled over after this threshold is reached.',
      type: 'Double',
      value: 0.85
    },
    {
      name: 'MIN_RECORDS',
      documentation: `The impurity threshold is used only after these many
        records exist in the journal.`,
      type: 'int',
      value: 10
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
        update (1), remove (1), all divided by the total number of records.`
    },
    {
      class: 'Long',
      name: 'totalRecords',
      documentation: 'Total number of records in the journal.'
    },
    {
      class: 'Object',
      name: 'incrementLock',
      javaType: 'java.util.concurrent.locks.ReentrantLock',
      javaFactory: 'return new java.util.concurrent.locks.ReentrantLock();'
    },
    {
      class: 'Object',
      name: 'writeLock',
      javaType: 'java.util.concurrent.locks.ReentrantLock',
      javaFactory: 'return new java.util.concurrent.locks.ReentrantLock();'
    },
    {
      class: 'Long',
      name: 'journalNumber'
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
        Pattern p = Pattern.compile("journal\\\\.\\\\d");
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
      documentation: `Scan the journals directory and retrieve the next journal`,
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
    }
  ],

  classes: [
    {
      name: 'NameDAOPair',
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
        if ( getTotalRecords() == 0 )
          return false;
        else {
          System.out.println("Dhiren debug: " + (double) getImpurityLevel() / (double) getTotalRecords());
          return (double) getImpurityLevel() / (double) getTotalRecords() > IMPURITY_THRESHOLD && getTotalRecords() > MIN_RECORDS ? true : false;
        }
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
        getIncrementLock().lock();

        if ( impure )
          setImpurityLevel(getImpurityLevel() + 1);

        setTotalRecords(getTotalRecords() + 1);
        getIncrementLock().unlock();
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
      javaType: 'java.io.File',
      javaReturns: 'java.io.File',
      javaCode: `
        try {
          getLogger().log("Creating journal: " + name);
          File file = getX().get(Storage.class).get(name);

          File dir = file.getAbsoluteFile().getParentFile();
          if ( ! dir.exists() ) {
            getLogger().log("Create dir: " + dir.getAbsolutePath());
            dir.mkdirs();
          }

          file.getAbsoluteFile().createNewFile();
          getLogger().info("New journal created: " + name);

          return file;
        } catch ( Throwable t ) {
          getLogger().error("Failed to read from journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'setJournalReader',
      javaCode: `
        try {
          ((FileJournal) getDelegate()).setReader(new BufferedReader(new FileReader(((FileJournal) getDelegate()).getFile())));
        } catch ( Throwable t ) {
          getLogger().error("Failed to read from journal", t);
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'setJournalWriter',
      javaCode: `
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(((FileJournal) getDelegate()).getFile(), true), 16 * 1024);
          writer.newLine();
          ((FileJournal) getDelegate()).setWriter(writer);
        } catch ( Throwable t ) {
          getLogger().error("Failed to create writer", t);
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
          name: 'data'
        }
      ],
      javaCode: `
        BufferedWriter writer = getWriter();
        writer.write(data);
        writer.newLine();
        writer.flush();
      `
    },
    {
      name: 'DAOImageDump',
      args: [
        {
          name: 'x',
          javaType: 'X'
        },
        {
          name: 'name',
          javaType: 'String'
        },
        {
          name: 'dao',
          javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        Thread imageWriter = new Thread() {
          public void run() {
            dao.select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                try {
                  String service = (String) x.get("service");
                  String record = ((FileJournal) getDelegate()).getOutputter().stringify((FObject) obj);

                  write_(sb.get()
                    .append(name)
                    .append(".p(")
                    .append(record)
                    .append(")")
                    .toString());
                } catch ( Throwable t ) {
                  getLogger().error("RollingJournal :: Failed to write entry to image journal", t);
                  throw new RuntimeException(t);
                }
              }
            });
          }
        };

        imageWriter.start();
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
        /\* lock all DAO journal writing */\
        daoLock_ = true;
        System.out.println("Dhiren debug: it's rolling baby!!");
        /\* roll over journal name */\
        setJournalNumber(getJournalNumber() + 1);
        FileJournal delegate = (FileJournal) getDelegate();
        delegate.setFilename("journal." + getJournalNumber());
        delegate.setFile(createJournal(delegate.getFilename()));
        setJournalReader();
        setJournalWriter();

        /\* create image journal */\
        String imageName = getJournalHome() + "/image." + getJournalNumber();
        File image = createJournal(imageName);
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(imageName, true), 16 * 1024);
          writer.newLine();
          setWriter(writer);
        } catch ( Throwable t ) {
          getLogger().error("Failed to create writer", t);
          throw new RuntimeException(t);
        }

        /\* write daos to image file */\
        DAO nSpecDAO = (DAO) x.get("nSpecDAO");
        ArraySink sink = (ArraySink) nSpecDAO.select(null);
        List<NSpec> nSpecs = (List<NSpec>) sink.getArray();
        List<NameDAOPair> pairs = new ArrayList<NameDAOPair>();

        for ( NSpec nspec : nSpecs ){
          String daoName = nspec.getName();
          Object obj = x.get(daoName);

          if ( obj instanceof DAO ){
            pairs.add(new NameDAOPair.Builder(x).setName(daoName).setDao(obj).build());
          }
        }

        for ( NameDAOPair dao : pairs ) {
          DAOImageDump(x, dao.getName(), (DAO) dao.getDao());
        }

        /\* reset counters */\
        setImpurityLevel(0);
        setTotalRecords(0);
        System.out.println("Dhiren debug: counters reset " + getImpurityLevel() + " totalrecords " + getTotalRecords());
        /\* release lock on DAO journal writing */\
        daoLock_ = false;
      `
    },
    {
      name: 'put',
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
        System.out.println("Dhiren debug: put " + getTotalRecords() + " impurity " + getImpurityLevel());
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
      System.out.println("Dhiren debug: put_ " + getTotalRecords() + " impurity " + getImpurityLevel());
        while ( daoLock_ ) {
          try {
            Thread.sleep(10);
          } catch ( InterruptedException e ){
            getLogger().error("RollingJournal :: put_ wait interrupted. " + e);
          }
        }

        getDelegate().put_(x, old, nu);
        incrementRecord(true);

        if ( isJournalImpure() )
          rollJournal(x);
      `
    },
    {
      name: 'remove',
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
      javaThrows: [
        'InterruptedException'
      ],
      javaCode: `
        System.out.println("Dhiren debug: rolling journal remove " + getTotalRecords() + " impurity " + getImpurityLevel());
        while ( daoLock_ ) {
          Thread.sleep(10);
        }

        getDelegate().put_(x, old, nu);
        incrementRecord(true);

        if ( isJournalImpure() )
          rollJournal(x);
      `
    }
  ]
});
