/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.java',
  name: 'JDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  documentation: `Implements a Journal DAO - a file based DAO.
In this current implementation setDelegate must be called last.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.CompositeJournal',
    'foam.dao.DAO',
    'foam.dao.F3FileJournal',
    'foam.dao.Journal',
    'foam.dao.MDAO',
    'foam.dao.NullJournal',
    'foam.dao.ReadOnlyF3FileJournal',
    'foam.dao.WriteOnlyF3FileJournal',
    'foam.nanos.boot.NSpec',
    'foam.nanos.fs.ResourceStorage',
    'foam.nanos.ndiff.NDiffJournal'
  ],

  javaCode: `
    // TODO: These convenience constructors should be removed and done using the facade pattern.
    public JDAO(X x, foam.core.ClassInfo classInfo, String filename) {
      this(x, new MDAO(classInfo), filename, false);
    }

    public JDAO(X x, DAO delegate, String filename) {
      this(x, delegate, filename, false);
    }

    public JDAO(X x, DAO delegate, String filename, Boolean cluster) {
      setX(x);
      setOf(delegate.getOf());
      setFilename(filename);
      setCluster(cluster);
      setDelegate(delegate);
    }
  `,

  properties: [
    {
      name: 'filename',
      class: 'String'
    },
    {
      name: 'cluster',
      class: 'Boolean',
      value: false
    },
    {
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      name: 'journal'
    },
    {
      documentation: 'Perform replay synchronously. Manual workaround for deadlock with AsyncAssemblyLine',
      class: 'Boolean',
      name: 'syncReplay',
      value: true
    },
    {
      documentation: `Force caller to wait on nspec initailzation. The first call to 'get' for an nspec (x.get(servicename)) will have the calling thread wait on reply of service. This is the default behaviour and should be used for all essential services.  Also this should be used if the model is using SeqNo or NUID for id generation.`,
      class: 'Boolean',
      name: 'waitReplay',
      value: true
    },
    {
      name: 'delegate',
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return new MDAO(getOf());',
      javaPostSet: `
            var delegate = val;
            // Runtime Journal
            if ( getCluster() ) {
              setJournal(new NullJournal.Builder(getX()).build());
            } else {
              if ( "ro".equals(System.getProperty("FS")) ) {
                setJournal(new ReadOnlyF3FileJournal.Builder(getX())
                  .setFilename(getFilename())
                  .setCreateFile(true)
                  .setDao(delegate)
                  .build());
              } else {
                setJournal(new F3FileJournal.Builder(getX())
                  .setDao(delegate)
                  .setFilename(getFilename())
                  .setCreateFile(false)
                  .setSyncReplay(getSyncReplay())
                  .build());
              }
            }

            /* Create a composite journal of repo journal and runtime journal
              and load them all.*/
            X resourceStorageX = getX();
            if ( System.getProperty("resource.journals.dir") != null ) {
              resourceStorageX = getX().put(foam.nanos.fs.Storage.class,
                  new ResourceStorage(System.getProperty("resource.journals.dir")));
            }

            // Repo Journal
            F3FileJournal journal0 = new ReadOnlyF3FileJournal.Builder(resourceStorageX)
              .setFilename(getFilename() + ".0")
              .build();

            // if NSpec present in X then go through NDiff
            // (set up in EasyDAO's decorator chain)
            NSpec nspec = (NSpec)getX().get(NSpec.NSPEC_CTX_KEY);

            String nSpecName = getFilename();
            Journal[] journals = null;

            if ( nspec != null ) {
              nSpecName = nspec.getName();
              journals = new Journal[] {
                // replays the repo journal
                new NDiffJournal.Builder(resourceStorageX)
                .setDelegate(journal0)
                .setNSpecName(nSpecName)
                .setRuntimeOrigin(false) 
                .build(),

                // replays the runtime journal
                new NDiffJournal.Builder(getX())
                .setDelegate(getJournal())
                .setNSpecName(nSpecName)
                .setRuntimeOrigin(true) 
                .build()
              };
            } else {
              journals = new Journal[] {
                    journal0,
                    getJournal()
              };
            }
            final Journal jnl = new CompositeJournal.Builder(resourceStorageX)
              .setDelegates(journals)
              .build();
 
            if ( getWaitReplay() ) {
              jnl.replay(resourceStorageX, delegate);
            } else {
              final X y = resourceStorageX;
              final String name = nSpecName;
              Agency agency = (Agency) getX().get("threadPool");
              agency.submit(getX(), new ContextAgent() {
                public void execute(X x) {
                  jnl.replay(y, delegate);
                }
              }, this.getClass().getSimpleName()+"-replay");
            }
    `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        return getJournal().put(x, "", getDelegate(), obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return getJournal().remove(x, "", getDelegate(), obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        super.select_(x, new foam.dao.RemoveSink(x, this), skip, limit, order, predicate);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      Object result = getJournal().cmd(x, obj);
      if ( result != null ) return result;
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
