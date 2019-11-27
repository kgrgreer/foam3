foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsRowToTx',

  javaImports: [
    'net.nanopay.tx.gs.GsTxCsvRow',
    'foam.dao.MDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.util.SafetyUtil',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.dao.ArraySink',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.util.List',
  ],

  methods: [
    {
      documentation: 'Process a file blob and make some transactions',
      name: 'process',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'blob', type: 'foam.blob.Blob'}
      ],
      javaCode: `
        System.out.println("Reading File.. ");
      // ---- parse file into GsTxCsvRow Objects..

        java.io.ByteArrayOutputStream os = new java.io.ByteArrayOutputStream((int)blob.getSize());
        blob.read(os, 0, blob.getSize());
        foam.lib.parse.StringPStream ps = new foam.lib.parse.StringPStream(os.toString());
        System.out.println("blob read");
        foam.lib.parse.ParserContextImpl px = new foam.lib.parse.ParserContextImpl();
        px.set("X", x);

        DAO gsTxCsvRowDAO = new foam.dao.SequenceNumberDAO.Builder(x)
        .setDelegate(new foam.dao.MDAO(GsTxCsvRow.getOwnClassInfo()))
        .build();
        ((MDAO) ((foam.dao.ProxyDAO)gsTxCsvRowDAO).getDelegate()).addIndex(new foam.core.PropertyInfo[] {
            net.nanopay.tx.gs.GsTxCsvRow.CASH_USD
        });

        CSVParser csvParser = new CSVParser(
          net.nanopay.tx.gs.GsTxCsvRow.getOwnClassInfo(),
          new foam.dao.DAOSink.Builder(x)
            .setDao(gsTxCsvRowDAO)
            .build());
        csvParser.parse(ps, px);

        long am = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();

        AsyncAssemblyLine transactionProcessor = new AsyncAssemblyLine(x);

        List <GsTxCsvRow> rows = ( (ArraySink) gsTxCsvRowDAO
           .select(new ArraySink())).getArray();

        System.out.println("Lines read: "+am);

        // -- begin Job creation and execution
        for ( GsTxCsvRow row1 : rows ) {

          GsTxAssembly job = new GsTxAssembly.Builder(x)
            .setOutputDAO( (DAO) x.get("localTransactionDAO") )
            .setRow1(row1)
            .build();

          /*long count = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
          if ( count == 0 )
            break; */
          //---- handle external jobs
          if ( SafetyUtil.equals(row1.getIsInternal(),"0") ) {
            transactionProcessor.enqueue(job);
            continue;
          }
          job.setIsInternal(true);

          //-- Cash txns.
          if ( isCash(row1) ) {
            if ( row1.getCashUSD() < 0 ) continue;

          Object [] arr = ( (ArraySink) gsTxCsvRowDAO
            .where(MLang.EQ(net.nanopay.tx.gs.GsTxCsvRow.CASH_USD, -row1.getCashUSD()))
            .limit(1)
            .select(new ArraySink())).getArray().toArray();
          if ( arr.length == 0 ) {
            System.out.println("error unmatched internal Cash transaction, no tx made for "+row1.getTransactionId());
            continue;
          }
          job.setRow2( (GsTxCsvRow) arr[0] );
          job.setSettleType("Cash");

          }
          else {
            if ( row1.getMarketValue() < 0 ) continue;
            Object [] arr = ( (ArraySink) gsTxCsvRowDAO
              .where(MLang.EQ(net.nanopay.tx.gs.GsTxCsvRow.CASH_USD, -row1.getCashUSD()))
              .limit(1)
              .select(new ArraySink())).getArray().toArray();
            if ( arr.length == 0 ) {
              System.out.println("error unmatched internal Securities transaction, no tx made for "+row1.getTransactionId());
              continue;
            }
            job.setRow2( (GsTxCsvRow) arr[0] );
            job.setSettleType(row1.getSettleType());
          }

          transactionProcessor.enqueue(job);
        }
      `
    },
    {
      name: 'isCash',
      args: [
      { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'}
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(),"Cash") )
          return true;
        return false;
      `
    }
  ]
});
