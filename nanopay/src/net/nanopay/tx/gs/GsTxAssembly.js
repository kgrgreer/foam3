foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsTxAssembly',
  extends: 'foam.util.concurrent.AbstractAssembly',

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.BrokerAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.exchangeable.Security',
    'net.nanopay.fx.ExchangeRate',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.gs.ProgressBarData',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.fx.SecurityPrice',
    'net.nanopay.fx.ExchangeRateService',
    'foam.core.Currency'
  ],

  constants: [
    {
      name: 'BROKER_ID',
      type: 'Long',
      value: 20
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.GsTxCsvRow',
      name: 'row1',
      documentation: 'The first row',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.GsTxCsvRow',
      name: 'row2',
      documentation: 'The second row',
    },
    {
      class: 'Boolean',
      name: 'isInternal',
      value: false,
    },
    {
      class: 'Long',
      name: 'txnCount',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.GSReportAssembly',
      name: 'trackingJob'
    },
    {
      class: 'Boolean',
      name: 'concurrentPuts',
      value: false,
      documentation: `
        If true, records will not be added to the DAO in sequential order.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.ProgressBarData',
      name: 'pbd',
      documentation: 'bar to put to bar DAO'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      documentation: `
        Intermediate property used internally. Do not set this.
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'outputDAO'
    }
  ],

  methods: [
    {
      name: 'startJob',
      javaCode: `
      `
    },
    {
      name: 'executeJob',
      javaCode: `
      if ( ! getTrackingJob().getFailed() ) {
        try {
          Transaction t = getIsInternal() ?
            parseInternal(getX(),getRow1(),getRow2()) :
            parseExternal(getX(),getRow1());

          setTransaction(t);
        }
        catch( Exception e ){
          Logger logger = (Logger) getX().get("logger");
          logger.error(e);
          getTrackingJob().setFailed(true);
          if ( getRow1() != null && getRow1().getTransactionId() != null ) {
             getTrackingJob().setFailText("File Upload Failure, \\nDuring transaction parsing. \\nOn row "+ getRow1().getTransactionId());
          }
          else {
            getTrackingJob().setFailText("File Upload Failure, \\nDuring transaction parsing.");
          }
        }
      }
      `
    },
    {
      name: 'endJob',
      javaCode: `
        if (! getTrackingJob().getFailed() ){
          try {
            verifyBalance(getX(),getTransaction());
            getOutputDAO().put(getTransaction());
            if ( getPbd() != null )
              ((DAO) getX().get("ProgressBarDAO")).put(getPbd());
            getTrackingJob().incrementTxnCounter(getTxnCount());
          }
          catch( Exception e ){
            Logger logger = (Logger) getX().get("logger");
            logger.error(e);
            getTrackingJob().setFailed(true);
            getTrackingJob().setFailText("File Upload Failure, \\nDuring transaction save.");
          }
        }
      `
    },
    {
      documentation: 'Makes a transaction out of two GS rows.',
      name: 'parseInternal',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
        { name: 'row2', type: 'net.nanopay.tx.gs.GsTxCsvRow' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        Transaction t = new Transaction();
        // find the send/receiver.
        GsTxCsvRow sourceRow = row2;
        GsTxCsvRow destRow = row1;

        if (isCash(sourceRow)){
          if ( row1.getCashUSD() < row2.getCashUSD() ) {
            sourceRow = row1;
            destRow = row2;
          }
        }
        else {
          if ( row1.getSecQty() < row2.getSecQty() ) {
            sourceRow = row1;
            destRow = row2;
          }
        }

        if (isCash(sourceRow) ) {
          t.setSourceAccount(findAcc(x,sourceRow,isCash(sourceRow)));
          t.setDestinationAccount(findAcc(x,destRow,isCash(destRow)));
          t.setSourceCurrency(sourceRow.getCurrency());
          t.setDestinationCurrency(destRow.getCurrency());
          t.setAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
          t.setDestinationAmount(toLong(x,destRow.getCurrency(),destRow.getCashQty()));
          if ( !( t.getSourceCurrency().equals(t.getDestinationCurrency())) )
            addExchangeRate(x,t.getSourceCurrency(),t.getDestinationCurrency(),sourceRow.getCashQty(),destRow.getCashQty());
        }
        else { // securities
          verifySecurity(x, sourceRow.getProductId());
            if( isDVP(sourceRow) ) {
              DVPTransaction tx = new DVPTransaction();
              tx.setSourcePaymentAccount(findAcc(x,destRow,true));
              tx.setDestinationPaymentAccount(findAcc(x,sourceRow,true));
              tx.setPaymentAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
              tx.setDestinationPaymentAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
              t = tx;
            }
          populateSecurityPriceDAO(x, destRow);
          t.setSourceAccount(findAcc(x,sourceRow,isCash(sourceRow)));
          t.setDestinationAccount(findAcc(x,destRow,isCash(destRow)));
          t.setSourceCurrency(sourceRow.getProductId());
          t.setDestinationCurrency(destRow.getProductId());
          t.setAmount(toLong(x,sourceRow.getProductId(),sourceRow.getSecQty()));
          t.setDestinationAmount(toLong(x,destRow.getProductId(),destRow.getSecQty()));
        }
        t = assembleIFLs(t,sourceRow,destRow);
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction(t);
        t = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionQuotePlanDAO")).put(quote)).getPlan();
        t = walk_(t,cleanTimeStamp(row1.getTimeStamp()));
        return t;
      `
    },
    {
      name: 'walk_',
      documentation: 'recursively walk chain and add time stamps',
      args: [
        { name: 'tx', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'stamp', type: 'Long' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      tx = addStatusHistory(tx,stamp);
      setTxnCount(getTxnCount()+1);
      tx.setReferenceNumber("IngestedTransaction");
      Transaction [] ts = tx.getNext();
      if (ts != null)
        for (int i = 0; i < ts.length;i++ )
          ts[i] = walk_(ts[i],stamp);
      return tx;
      `
    },
    {
      documentation: 'Makes a transaction out of an external GS row.',
      name: 'parseExternal',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        Transaction t = new Transaction();
        // if {
          //sending
          if(isCash(row1) && ( row1.getCashUSD() < 0 )) {
            t.setSourceAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
            t.setSourceCurrency(row1.getCurrency());
            t.setDestinationCurrency("USD");
            t.setAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
            t.setDestinationAmount(toLong(x,"USD", row1.getCashUSD()));
            if ( ! ( t.getSourceCurrency().equals(t.getDestinationCurrency())) )
              addExchangeRate(x, t.getSourceCurrency(), t.getDestinationCurrency(), row1.getCashQty(), row1.getCashUSD());
          }
          if (! isCash(row1) && ( row1.getSecQty() < 0 )){ //sending some securities
            verifySecurity(x,row1.getProductId());
            if( isDVP(row1) ) {
              DVPTransaction tx = new DVPTransaction();
              tx.setPaymentAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
              tx.setDestinationPaymentAmount(toLong(x,"USD",row1.getCashUSD()));
              tx.setDestinationPaymentAccount(findAcc(x,row1,true)); // get the cash version of this account
              tx.setSourcePaymentAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
              t = tx;
              // add cash peice
              }
            populateSecurityPriceDAO(x, row1);
            t.setSourceAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationAccount(BROKER_ID);
            t.setSourceCurrency(row1.getProductId());
            t.setDestinationCurrency(row1.getProductId());
            t.setAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
            t.setDestinationAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
          }
        //}
        //else {
          //receiving
          if(isCash(row1) && ( row1.getCashUSD() > 0 )) {
            t.setSourceAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
            t.setDestinationAccount(findAcc(x,row1,isCash(row1)));
            t.setSourceCurrency("USD");
            t.setDestinationCurrency(row1.getCurrency());
            t.setAmount(toLong(x,"USD",row1.getCashUSD()));
            t.setDestinationAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
            if ( !( t.getSourceCurrency().equals(t.getDestinationCurrency())) )
              addExchangeRate(x, t.getSourceCurrency(), t.getDestinationCurrency(), row1.getCashUSD(), row1.getCashQty());
          }
          if ( ! isCash(row1) && ( row1.getSecQty() > 0 )) {
          verifySecurity(x,row1.getProductId());
            if( isDVP(row1) ) {
              DVPTransaction tx = new DVPTransaction();
              tx.setSourcePaymentAccount(findAcc(x,row1,true)); //se me
              tx.setDestinationPaymentAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId()); //yep
              tx.setPaymentAmount(toLong(x,"USD",row1.getCashUSD()));
              tx.setDestinationPaymentAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
              t = tx;
              // add cash piece
            }

            t.setSourceAccount(BROKER_ID);
            t.setDestinationAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationCurrency(row1.getProductId());
            t.setSourceCurrency(row1.getProductId());
            t.setAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
            t.setDestinationAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
          }

        t = assembleIFLs(t,row1,row1);
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction(t);
        t = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionQuotePlanDAO")).put(quote)).getPlan();
        t = walk_(t,cleanTimeStamp(row1.getTimeStamp()));
        return t;
      `
    },

    {
      name: 'isCash',
      args: [
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(),"Cash") )
          return true;
        return false;
      `
    },
    {
      name: 'isDVP',
      args: [
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(),"DVP") )
          return true;
        return false;
      `
    },
    {
      name: 'findAcc',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
        { name: 'cash', type: 'Boolean' }
      ],
      type: 'long',
      javaCode: `
      String name = cash ? 
        row.getCompany() + " CASH (" + row.getCurrency() + ")" :
        row.getCompany() + " (SECURITIES)";

      DAO accountDAO = ((DAO) x.get("localAccountDAO"));
      Account account = (Account) (accountDAO.find(MLang.EQ(Account.NAME, name)));
      if (account == null) {
        Logger logger = (Logger) x.get("logger");
        logger.info("Missing account: "+name+". Creating ...");

        DigitalAccount da = new DigitalAccount.Builder(x)
          .setDenomination(row.getCurrency())  
          .setOwner(8005) // liquiddev@nanopay.net
          .setName(name)
          .build();
        return ((Account) accountDAO.put(da)).getId();
      }
      return account.getId();
    `
    },

    {
      name: 'verifyBalance',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'Boolean',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        // Verify DVP Transactions recursively
        if ( txn instanceof DVPTransaction ) {
          Transaction txn2 = new Transaction();
          txn2.setDestinationAccount(((DVPTransaction) txn).getDestinationPaymentAccount());
          txn2.setSourceAccount(((DVPTransaction) txn).getSourcePaymentAccount());
          txn2.setAmount(((DVPTransaction) txn).getPaymentAmount());
          txn2.setDestinationAmount(((DVPTransaction) txn).getDestinationPaymentAmount());
          txn2.setDestinationCurrency(txn2.findDestinationAccount(x).getDenomination());
          txn2.setSourceCurrency(txn2.findSourceAccount(x).getDenomination());
          txn2.setReferenceNumber("TopUp");
          verifyBalance(x,txn2);
        }  

        DAO accountDAO = ((DAO) x.get("accountDAO"));
        DAO currencyDAO = ((DAO) x.get("currencyDAO"));
        DAO transactionDAO = ((DAO) x.get("transactionDAO"));        

        Account source = txn.findSourceAccount(x);

        // Process securities transaction by ensuring that the broker account has the securities to draw from
        if ( currencyDAO.find(txn.getSourceCurrency()) == null ) {

          // For a security CI transaction on the broker account, we dont need topups
          if ( txn.findSourceAccount(x) instanceof BrokerAccount ) 
            return true; 

          // Calculate the number of remaining securities and top up the source account
          long remainder = (long) source.findBalance(x) - txn.getAmount(); // is this the correct account ?
          if ( remainder < 0 ) {
            Transaction secCI = new Transaction();
            secCI.setAmount(Math.abs(remainder));
            secCI.setDestinationAmount(secCI.getAmount()); // no trading allowed during top ups.
            secCI.setDestinationAccount(source.getId());
            secCI.setSourceAccount(BROKER_ID);
            secCI.setSourceCurrency(txn.getSourceCurrency());
            secCI.setDestinationCurrency(txn.getSourceCurrency()); // no trading allowed during top ups.
            secCI.setReferenceNumber("TopUp");
            transactionDAO.put(secCI); // top up the sending security account
            getTrackingJob().incrementTopUpCounter(1);
          }
          return true;
        }
        //*** CASH ***
        // Find the account where the top up will come from for the given source account
        Account b = null;
        if ( ! (source instanceof net.nanopay.account.ShadowAccount) ) {
            b = (Account) accountDAO.find(MLang.EQ(Account.NAME, source.getName().substring(0,4) + " Shadow Account"));
        }
        else {
          b = (BankAccount) accountDAO.find(MLang.EQ(Account.NAME, source.getDenomination() + " Bank Account"));
        }

        // Check if account for topping up needs to be created
        if ( b == null ) {
          b = new BankAccount.Builder(x)
            .setOwner(8005)  // liquiddev@nanopay.net
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() + " Bank Account")
            .setAccountNumber("000000")
            .build();
          b = (BankAccount) accountDAO.put_(x,b).fclone();
          logger.info("Created account for cash-in transaction: " + b.getName());
        }

        // Create a top up transaction if necessary
        Long topUp = (long) source.findBalance(x) - txn.getAmount();
        if ( topUp < 0 ) {
          Transaction ci = new Transaction.Builder(x)
            .setDestinationAccount(source.getId())
            .setSourceAccount(b.getId())
            .setDestinationCurrency(source.getDenomination())
            .setSourceCurrency(b.getDenomination())
            .setDestinationAmount(Math.abs(topUp))
            .setLastStatusChange(txn.getLastStatusChange())
            .setReferenceNumber("TopUp")
            .build();

          if ( SafetyUtil.equals(ci.getSourceCurrency(), ci.getDestinationCurrency())) {
            ci.setAmount(ci.getDestinationAmount());
          } else {
            ci.setAmount(((ExchangeRateService)x.get("exchangeRateService")).exchange(ci.getDestinationCurrency(), ci.getSourceCurrency(), ci.getDestinationAmount()));
          }

          // Ensure the bank account has a sufficient balance too
          if (! (b instanceof BankAccount) ){
            verifyBalance(x, ci);
          }

          // Ensure trustee exists
          checkTrusty(x,ci);

          // Complete the cash in transaction
          Transaction tx = (Transaction) transactionDAO.put(ci);
          if (tx.getStatus() != net.nanopay.tx.model.TransactionStatus.COMPLETED){
            tx = (Transaction) tx.fclone();
            tx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
            transactionDAO.put(tx);
            getTrackingJob().incrementTopUpCounter(1);
          }
          return false;
        }
        return true;
      `
    },
    {
      name: 'assembleIFLs',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
        { name: 'row2', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        if (! SafetyUtil.equals(row1.getCompany(),row2.getCompany())) {
          txn.addLineItems(new InfoLineItem[] {
            createInfoLineItem("Sending Company",row1.getCompany()),
            createInfoLineItem("Receiving Company",row2.getCompany()),
          }, null);
        }

        txn.addLineItems(new InfoLineItem[] {
          createInfoLineItem("Memo",row1.getDescriptionTag()),
          createInfoLineItem("Ref#",row1.getTransactionId()),
          createInfoLineItem("Product Type",row1.getProductType()),
          createInfoLineItem("Settlement Type",row1.getSettleType()),
          createInfoLineItem("Liquidity Bucket",row1.getLiquidityBucket()),
          createInfoLineItem("Liquidity Hierarchy 2",row1.getProto_Liquidity_Hierarchy2()),
          createInfoLineItem("Liquidity Hierarchy 3",row1.getProto_Liquidity_Hierarchy3()),
          createInfoLineItem("Liquidity Hierarchy 4",row1.getProto_Liquidity_Hierarchy4()),
        }, null);
        return txn;
      `
    },
    {
      name: 'populateSecurityPriceDAO',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'}
      ],
      javaCode: `
        DAO priceDAO = (DAO) x.get("securityPriceDAO");
        SecurityPrice price = new SecurityPrice.Builder(x)
          .setSecurity(row.getProductId())
          .setCurrency(row.getMarketValueCCy())
          .setPrice(Math.abs(row.getMarketValueLocal()/row.getSecQty()))
          .build();
        SecurityPrice priceUSD = new SecurityPrice.Builder(x)
          .setSecurity(row.getProductId())
          .setCurrency("USD")
          .setPrice(Math.abs(row.getMarketValue()/row.getSecQty()))
          .build();
        addExchangeRate(x, row.getMarketValueCCy(), "USD", row.getMarketValueLocal(), row.getMarketValue());
        priceDAO.put(price);
        priceDAO.put(priceUSD);
      `
    },
    {
      name: 'addExchangeRate',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'curr1', type: 'String'},
        { name: 'curr2', type: 'String'},
        { name: 'amnt1', type: 'Double'},
        { name: 'amnt2', type: 'Double'}
      ],
      javaCode: `
        DAO exchangeRateDAO = (DAO) x.get("exchangeRateDAO");
        ExchangeRate er = new ExchangeRate.Builder(x)
          .setFromCurrency(curr1)
          .setToCurrency(curr2)
          .setRate(Math.abs(amnt2/amnt1))
          .build();
        exchangeRateDAO.put(er);
      `
    },
    {
      name: 'checkTrusty',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        // Recursively check DVP transction
        if( txn instanceof DVPTransaction ){
          Transaction txn2 = new Transaction ();
          txn2.setSourceCurrency(((DVPTransaction) txn ).findSourcePaymentAccount(getX()).getDenomination());
          txn2.setDestinationCurrency(((DVPTransaction) txn ).findDestinationPaymentAccount(getX()).getDenomination());
          checkTrusty(x,txn2);
          return;
        }

        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        
        // Skip trustee for securities
        if( currencyDAO.find(txn.getSourceCurrency()) == null ) 
          return;
        
        // Create the source trustee account
        TrustAccount sourceTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getSourceCurrency() +" Trust Account"));
        if( sourceTrust == null ) {
          logger.info("trustee not found for " + txn.getSourceCurrency() + " ... Generating...");
          sourceTrust = new TrustAccount.Builder(x)
            .setOwner(101) // nanopay.trust@nanopay.net
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() +" Trust Account")
            .build();
          BankAccount sourceBank = new BankAccount.Builder(x)
            .setOwner(8005) // liquiddev@nanopay.net
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() +" Bank Account")
            .setAccountNumber("000000")
            .build();
          accountDAO.put(sourceTrust);
          accountDAO.put(sourceBank);
        }

        // Check for currency conversion
        if (SafetyUtil.equals(txn.getSourceCurrency(), txn.getDestinationCurrency()))
            return;
        
        // Create the destination trustee account
        TrustAccount destinationTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getDestinationCurrency() +" Trust Account"));
        if( destinationTrust == null ) {
          logger.info("trustee not found for " + txn.getDestinationCurrency() + " ... Generating...");
          destinationTrust = new TrustAccount.Builder(x)
            .setOwner(101) // nanopay.trust@nanopay.net
            .setDenomination(txn.getDestinationCurrency())
            .setName(txn.getDestinationCurrency() +" Trust Account")
            .build();
          BankAccount destBank = new BankAccount.Builder(x)
            .setOwner(8005) // liquiddev@nanopay.net
            .setAccountNumber("000000")
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setDenomination(txn.getDestinationCurrency())
            .setName(txn.getDestinationCurrency() +" Bank Account")
            .build();
          accountDAO.put(destinationTrust);
          accountDAO.put(destBank);
        }
      `

    },
    {
      name: 'verifySecurity',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'security', type: 'String' },
      ],
      javaCode: `
        DAO securitiesDAO = (DAO) x.get("securitiesDAO");
        
        // Check if security exists
        if (securitiesDAO.find(security) != null ) 
          return;
        
        // Otherwise create the security
        Security newSec = new Security.Builder(x)
          .setName("Security: "+ security) // concurrency issue maybe
          .setId(security)
          .build();
        securitiesDAO.put(newSec);
      `
    },

    {
      name: 'createInfoLineItem',
      args: [
        { name: 'title', type: 'String' },
        { name: 'data', type: 'String' }
      ],
      type: 'net.nanopay.tx.InfoLineItem',
      javaCode: `
        if (SafetyUtil.isEmpty(data)) 
          return null;
        
        InfoLineItem ifl = new InfoLineItem();
        ifl.setName(title);
        ifl.setNote(data);
        ifl.setGroup("Transaction Data");
        return ifl;
      `
    },
    {
      name: 'cleanTimeStamp',
      args: [
        { name: 'ts', type: 'String' },
      ],
      type: 'Long',
      javaCode: `
        try {
          java.text.DateFormat dateFormat = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
          dateFormat.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
          String t = ts.replace(":","");
          String t1 = t.replace(".","");
          String t2 = t1.replace(" ","");
          Long time = Long.parseLong(t2);
          time = time/1000;
          String time2 = time+"";
          return dateFormat.parse(time2).getTime();
        } catch (Exception e) {
          Logger logger = (Logger) getX().get("logger");
          logger.error("Can't parse" + ts);
        }
        return 0;
      `
    },
    {
      name: 'toLong',
      args: [
        { name: 'x', type: 'foam.core.X' },
        { name: 'curr', type: 'String' },
        { name: 'amount', type: 'Double' }
      ],
      type: 'Long',
      javaCode: `
        foam.core.Currency cur = (foam.core.Currency) ((DAO) x.get("currencyDAO")).find(curr);
        if ( cur != null ) {
          long precision = cur.getPrecision();
          return (long) Math.floor(Math.abs(amount * (Math.pow(10,precision))));
        }
        return (long) Math.floor((Math.abs(amount)));
      `
    },
    {
      name: 'addStatusHistory',
      args: [
        { name: 'tx', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'date', type: 'Long' },
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      tx.setProperty("lastStatusChange",date);
       net.nanopay.tx.HistoricStatus[] h = new net.nanopay.tx.HistoricStatus[1];
          h[0] = new net.nanopay.tx.HistoricStatus();
          h[0].setStatus(tx.getStatus());
          h[0].setTimeStamp(new java.util.Date(date));
        tx.setStatusHistory(h);
        return tx;
      `
    }
  ]
});
