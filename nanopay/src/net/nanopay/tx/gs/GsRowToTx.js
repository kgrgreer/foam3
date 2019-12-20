foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsRowToTx',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'foam.util.concurrent.SyncAssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.tx.gs.ProgressBarData'
  ],

  methods: [
    {
      documentation: 'Process a file blob and make some transactions',
      name: 'process',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'blob', type: 'foam.blob.Blob' },
        { name: 'progId', type: 'String' }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        logger.info(" ** Reading file ... " + blob.getSize());
        
        // ---- parse file into GsTxCsvRow Objects ...
        ProgressBarData pbd = new ProgressBarData ();
        pbd.setId(progId);
        pbd.setName(progId);
        pbd.setStatus("Reading CSV...");
        DAO progressBarDAO = (DAO) x.get("ProgressBarDAO");
        progressBarDAO.put(pbd);

        java.io.ByteArrayOutputStream os = new java.io.ByteArrayOutputStream((int)blob.getSize());
        blob.read(os, 0, blob.getSize());
        foam.lib.parse.StringPStream ps = new foam.lib.parse.StringPStream(os.toString());
        logger.info(" ** Blob read into stream: " + blob.getSize());

        foam.lib.parse.ParserContextImpl px = new foam.lib.parse.ParserContextImpl();
        px.set("X", x);

        // Create DAO to store rows from file
        DAO gsTxCsvRowDAO = new foam.dao.SequenceNumberDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(GsTxCsvRow.getOwnClassInfo()))
          .build();
        // Add index to MDAO
        ((MDAO) ((foam.dao.ProxyDAO)gsTxCsvRowDAO).getDelegate())
          .addIndex(new foam.core.PropertyInfo[] {
              net.nanopay.tx.gs.GsTxCsvRow.CASH_USD,
              net.nanopay.tx.gs.GsTxCsvRow.SEC_QTY
          });

        CSVParser csvParser = new CSVParser(
          net.nanopay.tx.gs.GsTxCsvRow.getOwnClassInfo(),
          new foam.dao.DAOSink.Builder(x)
            .setDao(gsTxCsvRowDAO)
            .build());
        csvParser.parse(ps, px);
        long am = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
        logger.info(" ** Read and parsed " + am + " rows ...");

        pbd.setMaxValue(am);
        pbd.setStatus("Parsing Transaction: 0 of " + am);
        progressBarDAO.put(pbd);

        SyncAssemblyLine transactionProcessor = new SyncAssemblyLine();

        List <GsTxCsvRow> rows = ( (ArraySink) gsTxCsvRowDAO
           .select(new ArraySink())).getArray();

        // -- begin Job creation and execution
        logger.info(" ** Processing: " + rows.size() + " rows ...");
        int i = 0;
        int modulus = 21;
        for ( GsTxCsvRow row1 : rows ) {
          // logger.info(" ** On iteration: " + i + " of: " + am);
          i++;
          GsTxAssembly job = new GsTxAssembly.Builder(x)
            .setOutputDAO( (DAO) x.get("localTransactionDAO") )
            .setRow1(row1)
            .build();
          if ( i % modulus == 0 || i == rows.size() ) {
            pbd = (ProgressBarData) pbd.fclone();
            pbd.setValue(i);
            pbd.setStatus("Parsing Transaction: " + pbd.getValue() + " of " + rows.size());
            job.setPbd(pbd);
            //progressBarDAO.put(pbd);

            //logger.info(" ** " + pbd.getStatus());
          }
          
          /*
          long count = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
          if ( count == 0 )
            break; 
            */
          
          //---- handle external jobs
          if ( SafetyUtil.equals(row1.getIsInternal(), "0") ) {
            transactionProcessor.enqueue(job);
            continue;
          }
          job.setIsInternal(true);

          //-- Cash txns.
          if ( isCash(row1) ) {
            // Make sure the amount is positive
            if ( row1.getCashUSD() < 0 ) continue;

            // Find the matching cash transaction from the original row
            Object [] arr = ( (ArraySink) gsTxCsvRowDAO
              .where(MLang.EQ(net.nanopay.tx.gs.GsTxCsvRow.CASH_USD, -row1.getCashUSD()))
              .limit(1)
              .select(new ArraySink())).getArray().toArray();
            if ( arr.length == 0 ) {
              logger.error("Unmatched internal cash transaction, no transaction made for " + row1.getTransactionId() + " - row: " + i);
              continue;
            }
            job.setRow2( (GsTxCsvRow) arr[0] );
          }
          else {
            // Make sure the quantity is positive
            if ( row1.getSecQty() < 0 ) continue;

            // Find the matching securities transaction from the original row
            Object [] arr = ( (ArraySink) gsTxCsvRowDAO
              .where(MLang.EQ(net.nanopay.tx.gs.GsTxCsvRow.SEC_QTY, -row1.getSecQty()))
              .limit(1)
              .select(new ArraySink())).getArray().toArray();
            if ( arr.length == 0 ) {
              logger.error("Unmatched internal securities transaction, no transaction made for " + row1.getTransactionId() + " - row: " + i);
              continue;
            }
            job.setRow2( (GsTxCsvRow) arr[0] );
          }

          transactionProcessor.enqueue(job);
        }

        pbd.setValue(am);
        pbd.setStatus("💰🤑💸 Congratualtions File Has  Been Ingested 💸🤑💰");
        progressBarDAO.put(pbd);
        logger.info(" ** " + pbd.getStatus());
      `
    },
    {
      name: 'isCash',
      args: [
      { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(), "Cash") )
          return true;
        return false;
      `
    }
  ]
});
