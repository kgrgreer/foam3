/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.sf',
  name: 'MedusaSFManager',
  extends: 'foam.box.sf.SFManager',
  
  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ProxyDAO',
    'foam.dao.EasyDAO',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.box.sf.SFManager',
    'foam.box.sf.SF',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.MedusaType',
    'foam.nanos.medusa.Status',
    'foam.util.retry.RetryStrategy',
    'foam.util.retry.RetryForeverStrategy',
    'java.util.PriorityQueue',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
    'foam.box.sf.*',
    'java.nio.file.attribute.*',
    'java.util.*'
  ],
  
  properties: [
    {
      class: 'Int',
      name: 'medusaTimeWindow',
      units: 's',
      value: -1
    },
    {
      name: 'medusaRetryStrategy',
      class: 'FObjectProperty',
      of: 'foam.util.retry.RetryStrategy',
      javaFactory: `
      return (new RetryForeverStrategy.Builder(null))
      .setRetryDelay(1000)
      .build();
      `
    },
    {
      class: 'Int',
      name: 'medusaFileCapacity',
      value: 4096
    },
    {
      class: 'String',
      name: 'folderName',
      value: '../saf/'
    },
    {
      class: 'Int',
      documentation: 'set -1 replay nothing; set 10000 replay everything',
      name: 'replayStrategy',
      units: 'days',
      value: 4
    }
  ],
  
  methods: [
    {
      documentation: 'override start method for medusa',
      name: 'start',
      javaCode: `
      super.start();

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      final X context = getX();
      
      try {
        //Replay entries base on ReplayStrategy.
        FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
        java.io.File folder = fileSystemStorage.get(getFolderName());
        if ( ! folder.exists() ) folder.mkdir();
  
        List<String> files = null;
        for ( ClusterConfig config : support.getSfBroadcastMediators() ) {
          if ( config.getId().equals(myConfig.getId()) ) continue;
          files = new ArrayList<>(fileSystemStorage.getAvailableFiles(getFolderName(), config.getId()+".*"));
          if ( files.size() != 0 ) break;
        }
  
        //Sort file from low index to high.
        files.sort((f1, f2) -> {
          int l1 = getFileSuffix(f1);
          int l2 = getFileSuffix(f2);
          return l1 > l2 ? 1 : -1;
        });
  
        if ( getReplayStrategy() <= 0 ) {
          files = new ArrayList<>(0);
        } else if ( getReplayStrategy() < 10000 ) {
          Calendar rightNow = Calendar.getInstance();
          rightNow.add(Calendar.SECOND, -(getReplayStrategy() * 86400));
          Date timeWindow = rightNow.getTime();  
          List<String> temp = new ArrayList<>(files.size());
          for ( String filename : files ) {
            BasicFileAttributes attr = fileSystemStorage.getFileAttributes(getFolderName() + filename);
            Date fileLastModifiedDate = new Date(attr.lastModifiedTime().toMillis());
            if ( fileLastModifiedDate.after(timeWindow) ) temp.add(filename);
          }
          files = temp;
        }
  
        for ( String filename : files ) System.out.println("%%%AAA: " + filename);
  
        for ( String filename : files ) {
          SFFileJournal journal = new SFFileJournal.Builder(getX())
            .setFilename(getFolderName() + filename)
            .setCreateFile(false)
            .build();
  
          long offset = journal.getFileOffset();
          
          journal.replayFrom(context, new ProxyDAO() {
            @Override
            public FObject put_(X x, FObject obj) {
              SFEntry entry = (SFEntry) obj;
  
              DAO dao = ((DAO) context.get(entry.getNSpecName()));
              if ( ! (dao instanceof EasyDAO) || ((EasyDAO) dao).getSAF() != true ) return null;

              DAO mdao = (DAO) dao.cmd_(context, foam.dao.DAO.LAST_CMD);
              if ( DOP.PUT == entry.getDop() ) {
                FObject nu = entry.getObject();
                nu = mdao.put_(context, nu);
              } else {
                throw new UnsupportedOperationException(entry.getDop().toString());
              }
              return entry;
            }
          }, 0);
          
          journal.setFileOffset(offset);
        }
      } catch ( Throwable t ) {
        getLogger().error(t);
      }

      //Setup SF between mediators.
      final SFManager manager = this;
      if ( myConfig.getType() == MedusaType.MEDIATOR ) {
        for ( ClusterConfig config : support.getSfBroadcastMediators() ) {
          try {
            getLogger().info("findMediator: " + config.getId());
            if ( config.getId().equals(myConfig.getId()) ) continue;
            
            SF sf = new SFMedusaClientDAO.Builder(context)
            .setId(config.getId())
            .setFileName(config.getId())
            .setTimeWindow(getMedusaTimeWindow())
            .setFileCapacity(getMedusaFileCapacity())
            .setRetryStrategy(getMedusaRetryStrategy())
            .setMyConfig(myConfig)
            .setToConfig(config)
            .setManager(manager)
            .build();
            sf.setX(context);
            sf.initial(context);
            sf.setReady(true);
            getSfs().put(sf.getId(), sf);
            getLogger().info("Initialize successfully: " + sf.getId());
          } catch ( Throwable t ) {
            getLogger().error(config.getId(), t);
          }
        }
      }
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
  ]
});