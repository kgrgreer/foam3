/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsRowToTx',

  javaImports: [
    'foam.dao.MDAO',
    'foam.dao.DAO',
    'java.util.List',
    'foam.mlang.MLang',
    'java.util.HashMap',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'foam.mlang.sink.Count',
    'foam.lib.parse.CSVParser',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.gs.ProgressBarData',
    'foam.util.concurrent.SyncAssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine'
  ],

  methods: [
    {
      documentation: 'Process a file blob and make some transactions',
      name: 'process',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'blob', type: 'foam.blob.Blob' },
        { name: 'progId', type: 'String' },
        { name: 'filename', type: 'String' }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        logger.info(" ** Reading file ... " + blob.getSize());

        // ---- set up x ----

        x = x.put("systemGenerated","fileUpload");

        // ---- parse file into GsTxCsvRow Objects ...
        GSReportAssembly finalJob = new GSReportAssembly(x);
        finalJob.setFilename(filename);
        ProgressBarData pbd = new ProgressBarData();
        pbd.setId(progId);
        pbd.setName(filename);
        finalJob.setStartTime(System.currentTimeMillis());
        pbd.setStatus("Reading CSV...");
        DAO progressBarDAO = (DAO) x.get("ProgressBarDAO");
        finalJob.setProgressBarData(pbd);
        AsyncAssemblyLine transactionProcessor = new AsyncAssemblyLine(x);
        if ( ! filename.contains(".csv") ) {
          logger.info(" ** Non CSV file uploaded... ");
          finalJob.setFailed(true);
          finalJob.setFailText("Unable to Process File.\\nFile is not a csv. ");
        } else {
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
          HashMap balanceMap = new HashMap<Long,Long>();

          // Add index to MDAO
          ((MDAO) ((foam.dao.ProxyDAO)gsTxCsvRowDAO).getDelegate())
            .addIndex(new foam.core.PropertyInfo[] {
                net.nanopay.tx.gs.GsTxCsvRow.CASH_USD
            });
            ((MDAO) ((foam.dao.ProxyDAO)gsTxCsvRowDAO).getDelegate())
            .addIndex(new foam.core.PropertyInfo[] {
              net.nanopay.tx.gs.GsTxCsvRow.SEC_QTY
            });

          /* Preload the balance DAO */
          DAO accountDAO = (DAO) x.get("localAccountDAO");
          java.util.List l = (java.util.List) ( (foam.dao.ArraySink) accountDAO.select( new foam.dao.ArraySink() )).getArray();
          for( Object o : l){
            Account a = (Account) o;
            balanceMap.put(a.getId(), a.findBalance(x));
          }

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


          List <GsTxCsvRow> rows = ( (ArraySink) gsTxCsvRowDAO
             .select(new ArraySink())).getArray();

          // -- begin Job creation and execution
          logger.info(" ** Processing: " + rows.size() + " rows ...");
          int i = 0;
          int modulus = 21;
          for ( GsTxCsvRow row1 : rows ) {
            if ( ! finalJob.getFailed() ) {
              i++;
              GsTxAssembly job = new GsTxAssembly.Builder(x)
                .setOutputDAO( (DAO) x.get("localTransactionDAO") )
                .setTrackingJob(finalJob)
                .setRow1(row1)
                .setMyBalances(balanceMap)
                .build();
              if ( i % modulus == 0 || i == rows.size() ) {
                pbd = (ProgressBarData) pbd.fclone();
                pbd.setValue(i);
                pbd.setStatus("Parsing Transaction: " + pbd.getValue() + " of " + rows.size());
                job.setPbd(pbd);
              }

              //---- handle external jobs
              if ( SafetyUtil.equals(row1.getIsInternal(), "0") ) {
                checkTrustee(x,row1.getCurrency());
                transactionProcessor.enqueue(job);
                continue;
              }
              checkTrustee(x,row1.getCurrency());
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
                  finalJob.addToFailed(row1.getTransactionId()+", ");
                  logger.error("Unmatched internal cash transaction, no transaction made for " + row1.getTransactionId() + " - row: " + i);
                  continue;
                }
                checkTrustee(x,((GsTxCsvRow) arr[0]).getCurrency());
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
                  finalJob.addToFailed(row1.getTransactionId()+", ");
                  logger.error("Unmatched internal securities transaction, no transaction made for " + row1.getTransactionId() + " - row: " + i);
                  continue;
                }
                job.setRow2( (GsTxCsvRow) arr[0] );
              }

              transactionProcessor.enqueue(job);
            }
          }
        }
        transactionProcessor.enqueue(finalJob);
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
    },
    {
      name: 'checkTrustee',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'denomination', type: 'String'}
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO currencyDAO = (DAO) x.get("currencyDAO");

        // Skip trustee for securities
        if( currencyDAO.find(denomination) == null )
          return;

        // Create the source trustee account
        TrustAccount sourceTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,"Trust Account "+denomination));
        if( sourceTrust == null ) {
          logger.info("trustee not found for " + denomination + " ... Generating...");
          sourceTrust = new TrustAccount.Builder(x)
            .setOwner(101) // nanopay.trust@nanopay.net
            .setDenomination(denomination)
            .setLifecycleState(foam.nanos.auth.LifecycleState.ACTIVE)
            .setName("Trust Account "+denomination)
            .build();
          BankAccount sourceBank = new BankAccount.Builder(x)
            .setOwner(8005) // liquiddev@nanopay.net
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setLifecycleState(foam.nanos.auth.LifecycleState.ACTIVE)
            .setDenomination(denomination)
            .setName(denomination +" Bank Account")
            .setAccountNumber("000000")
            .setCountry("US")
            .build();
          accountDAO.put(sourceTrust);
          accountDAO.put(sourceBank);
        }
      `

    },
  ]
});
