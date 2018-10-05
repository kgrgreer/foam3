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
    'foam.dao.DAO'
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
    }
  ],

  properties: [
    {
      name: 'impurityLevel',
      class: 'Long',
      documentation: `A journal's impurity is calculated as: new record (0),
        update (1), remove (1), all divided by the total number of records.`
    },
    {
      name: 'totalRecords',
      class: 'Long',
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
      class: 'Object',
      name: 'daoLock',
      javaType: 'volatile boolean',
      value: false
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
        return new PrefixLogger(new Object[] { "[JDAO]", getFilename() }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'isJournalImpure',
      synchronized: true,
      javaReturns: 'boolean',
      javaCode: `
        return (double) getImpurityLevel() / (double) getTotalRecords() < IMPURITY_THRESHOLD ? true : false;
      `
    },
    {
      name: 'incrementRecord',
      javaArgs: [
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
      javaArgs: [
        {
          class: 'String',
          name: 'name'
        }
      ],
      javaType: 'java.io.File',
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
      javaArgs: [
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        Thread imageWriter = new Thread () {
          public void run() {
            dao.select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                String record = o.stringify((FObject) obj);

                write_(sb.get()
                  .append(daoName)
                  .append(".p(")
                  .append(record)
                  .append(")")
                  .toString());
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
      javaCode: `
        \\ lock all DAO journal writing
        setDaoLock(true);

        \\ roll over journal name
        setJournalNumber(getJournalNumber() + 1);
        getDelegate().setFilename("journal." + getJournalNumber());
        getDelegate().setFile(createJournal(getDelegate().getFilename()));

        \\ create image journal
        String imageName = "image." + getJournalNumber() + 1;
        createJournal(imageName);
        try {
          BufferedWriter writer = new BufferedWriter(new FileWriter(imageName, true), 16 * 1024);
          writer.newLine();
          setWriter(writer);
        } catch ( Throwable t ) {
          getLogger().error("Failed to create writer", t);
          throw new RuntimeException(t);
        }

        \\ write daos to image file
        DAO nspec = (DAO) x.get("nspecDAO");
        ArraySink sink = (ArraySink) nspecDAO.select(null);
        List<NSpec> nSpecs = (List<NSpec>) sink.getArray();
        List<DAO> daos = nSpecs.parallelStream()
          .map(nSpec -> x.get(nSpec.getName()))
          .filter(o -> o instanceof DAO)
          .map(o -> (DAO) o)
          .collect(Collectors.toList());

        for ( foam.dao.DAO dao : daos ) {
          newDAOImageDump(dao);
        }

        \\ release lock on DAO journal writing
        setDaoLock(false);
      `
    },
    {
      name: 'put',
      javaCode: `
        while ( ! getDaoLock() ) {
          Thread.sleep(10);
        }

        getDelegate().put(x, obj);
        incrementRecord(false);

        if ( isJournalImpure() )
          rollJournal();
      `
    },
    {
      name: 'put_',
      javaCode: `
        while ( ! getDaoLock() ) {
          Thread.sleep(10);
        }

        getDelegate().put_(x, old, nu);
        incrementRecord(true);

        if ( isJournalImpure() )
          rollJournal();
      `
    },
    {
      name: 'remove',
      javaCode: `
        while ( ! getDaoLock() ) {
          Thread.sleep(10);
        }

        getDelegate().put_(x, old, nu);
        incrementRecord(true);

        if ( isJournalImpure() )
          rollJournal();
      `
    }
  ]
});
