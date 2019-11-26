foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsRowToTx',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'foam.dao.MDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.util.SafetyUtil',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.dao.ArraySink',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.fx.ExchangeRate',
    'foam.util.concurrent.AsyncAssemblyLine'
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
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        DAO transactionQuoteDAO = (DAO) x.get("localTransactionQuotePlanDAO");

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
        // -----
                System.out.println("Getting Counts and timings.. ");
        // ----- Get counts, and timings, prepare array to itterate over.
        long ci = 0;
        long am = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();

        new AsyncAssemblyLine transactionProcessor = new AsyncAssemblyLine();

        Object [] rows = ( (ArraySink) gsTxCsvRowDAO
           .select(new ArraySink())).getArray().toArray();

        System.out.println("Lines read: "+am);

        long startTime = System.currentTimeMillis();

        Long begining = cleanTimeStamp(r.getTimeStamp());

        Long offset = startTime - begining-14400000;
        // -- begin Job creation and execution
        for ( GsTxCsvRow row1 : rows ) {

          Transaction t = null;
          GsTxAssembly job = new GsTxAssembly();
          job.setRow1(row1);

          /*long count = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
          if ( count == 0 )
            break; */
          //---- handle external jobs
          if ( SafetyUtil.equals(row1.getIsInternal(),"0") ) {
            t = parseExternal(x,row1);
            job.setIsInternal(true);
            transactionProcessor.enqueue(job);
            continue;
          }

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
    },


  ]
});
