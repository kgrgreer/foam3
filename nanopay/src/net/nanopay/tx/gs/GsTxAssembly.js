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
  name: 'GsTxAssembly',
  extends: 'foam.util.concurrent.AbstractAssembly',

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'net.nanopay.account.Account',
    'net.nanopay.account.BrokerAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.exchangeable.Security',
    'net.nanopay.fx.ExchangeRate',
    'net.nanopay.fx.ExchangeRateService',
    'net.nanopay.fx.SecurityPrice',
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.tx.gs.ProgressBarData',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  constants: [
    {
      name: 'BROKER_ID',
      type: 'String',
      value: '20'
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
      class: 'Object',
      name: 'myBalances'
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
            addAllTransfers(getTransaction());
            getOutputDAO().put(getTransaction());
            if ( getPbd() != null )
              ((DAO) getX().get("ProgressBarDAO")).put(getPbd());
            getTrackingJob().incrementTxnCounter(getTxnCount());
          }
          catch( Exception e ){
            try {
              String fail ="";
              if (! SafetyUtil.isEmpty(getTrackingJob().getFailedRows()))
                fail+= ", ";
              fail += getRow1().getTransactionId();
              if (getRow2() != null)
                fail += (" and " + getRow2().getTransactionId());
              getTrackingJob().addToFailed(fail);
            }
            catch(Exception innerE) {
              getTrackingJob().setFailed(true);
            getTrackingJob().setFailText("File Upload Failure, \\nDuring transaction save. " + innerE.getMessage());
          }
          }
        }
      `
    },
    {
      name: 'addAllTransfers',
      args: [{ name: 'transaction', type: 'net.nanopay.tx.model.Transaction' }],
      javaCode: `
      HashMap hm = (HashMap<Long,Long>) getMyBalances();
      if( ! (transaction instanceof SummaryTransaction || transaction instanceof FXSummaryTransaction ) ) {
        for ( Transfer tr : transaction.getTransfers() ) {
          long add4 = 0;
          if (hm.get(tr.getAccount()) != null ) add4 = (Long) hm.get(tr.getAccount());
          hm.put(tr.getAccount(),add4+tr.getAmount());
        }
      }
      if ( transaction.getNext() != null )
        for ( Transaction tx : transaction.getNext() )
          addAllTransfers(tx);
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
          populateSecurityPriceDAO(x, sourceRow);
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
        t = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionPlannerDAO")).put(quote)).getPlan();
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
            populateSecurityPriceDAO(x, row1);
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
        t = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionPlannerDAO")).put(quote)).getPlan();
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
      type: 'String',
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
          .setOwner(1348) // admin@nanopay.net
          .setName(name)
          .setLifecycleState(LifecycleState.ACTIVE)
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
        HashMap hm = (HashMap) getMyBalances();
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
          txn2 = walk_(txn2,txn.getCreated().getTime());
          verifyBalance(x,txn2);
        }

        DAO accountDAO = ((DAO) x.get("localAccountDAO"));
        DAO currencyDAO = ((DAO) x.get("currencyDAO"));
        DAO transactionDAO = ((DAO) x.get("localTransactionDAO"));

        Account source = txn.findSourceAccount(x);

        // Process securities transaction by ensuring that the broker account has the securities to draw from
        if ( currencyDAO.find(txn.getSourceCurrency()) == null ) {

          // For a security CI transaction on the broker account, we dont need topups
          if ( txn.findSourceAccount(x) instanceof BrokerAccount )
            return true;

          // Calculate the number of remaining securities and top up the source account
          long addd = 0;
          if ( hm.get(source.getId()) != null ) addd = (Long) hm.get(source.getId());
          long remainder = addd - txn.getAmount(); // is this the correct account ?
          if ( remainder < 0 ) {
            Transaction secCI = new Transaction();
            secCI.setAmount(Math.abs(remainder));
            secCI.setDestinationAmount(secCI.getAmount()); // no trading allowed during top ups.
            secCI.setDestinationAccount(source.getId());
            secCI.setSourceAccount(BROKER_ID);
            secCI.setSourceCurrency(txn.getSourceCurrency());
            secCI.setDestinationCurrency(txn.getSourceCurrency()); // no trading allowed during top ups.
            TransactionQuote quote = new TransactionQuote();
            quote.setRequestTransaction(secCI);
            secCI = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionPlannerDAO")).put(quote)).getPlan();
            secCI = walk_(secCI,txn.getCreated().getTime());
            transactionDAO.put(secCI); // top up the sending security account
            for ( Transfer tr : secCI.getTransfers() ){
              long add1 = 0;
              if (hm.get(tr.getAccount()) != null ) add1 = (long) hm.get(tr.getAccount());
              hm.put(tr.getAccount(),add1+tr.getAmount());
            }
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
            .setOwner(1348)  // admin@nanopay.net
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setLifecycleState(LifecycleState.ACTIVE)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() + " Bank Account")
            .setAccountNumber("000000")
            .setCountry("US")
            .build();
          Subject subject = new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build();
          X systemX = x.put("subject", subject);
          b = (BankAccount) accountDAO.put_(systemX,b).fclone();
          logger.info("Created account for cash-in transaction: " + b.getName());
        }

        // Create a top up transaction if necessary
        long add2 = 0;
        if (hm.get(source.getId()) != null) add2 = (long) hm.get(source.getId());
        Long topUp = add2 - txn.getAmount();
        if ( topUp < 0 ) {
          Transaction ci = new Transaction.Builder(x)
            .setDestinationAccount(source.getId())
            .setSourceAccount(b.getId())
            .setDestinationCurrency(source.getDenomination())
            .setSourceCurrency(b.getDenomination())
            .setDestinationAmount(Math.abs(topUp))
            .setLastStatusChange(txn.getLastStatusChange())
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


          if (ci.getStatus() != net.nanopay.tx.model.TransactionStatus.COMPLETED){
            ci.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
          }

          TransactionQuote quote = new TransactionQuote();
          quote.setRequestTransaction(ci);
          ci = (Transaction) ((TransactionQuote)((DAO) x.get("localTransactionPlannerDAO")).put(quote)).getPlan();
          ci = walk_(ci,txn.getCreated().getTime());
          Transaction tx = (Transaction) transactionDAO.put(ci);
          for ( Transfer tr : tx.getTransfers() ){
            long add3 = 0;
            if (hm.get(tr.getAccount()) != null ) add3 = (long) hm.get(tr.getAccount());
            hm.put(tr.getAccount(),add3+tr.getAmount());
          }
          getTrackingJob().incrementTopUpCounter(1);
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
          });
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
        });
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
          .setPrice(Math.abs(((long)(Math.pow(10,6)*(row.getMarketValueLocal()/row.getSecQty())))* Math.pow(10,-6)))
          .build();
        if (row.getMarketValueLocal() !=  row.getMarketValue() ) {
          SecurityPrice priceUSD = new SecurityPrice.Builder(x)
            .setSecurity(row.getProductId())
            .setCurrency("USD")
            .setPrice(Math.abs(((long)(Math.pow(10,6)*(row.getMarketValue()/row.getSecQty())))* Math.pow(10,-6)))
            .build();
          addExchangeRate(x, row.getMarketValueCCy(), "USD", row.getMarketValueLocal(), row.getMarketValue());
          priceDAO.put(priceUSD);
        }
        priceDAO.put(price);
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
          .setRate(Math.abs(((long)(Math.pow(10,6)*(amnt2/amnt1)))* Math.pow(10,-6)))
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
        TrustAccount sourceTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,"Trust Account "+txn.getSourceCurrency()));
        if( sourceTrust == null ) {
          logger.info("trustee not found for " + txn.getSourceCurrency() + " ... Generating...");
          sourceTrust = new TrustAccount.Builder(x)
            .setOwner(101) // nanopay.trust@nanopay.net
            .setDenomination(txn.getSourceCurrency())
            .setLifecycleState(LifecycleState.ACTIVE)
            .setName("Trust Account "+txn.getSourceCurrency())
            .build();
          BankAccount sourceBank = new BankAccount.Builder(x)
            .setOwner(1348) // admin@nanopay.net
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setLifecycleState(LifecycleState.ACTIVE)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() +" Bank Account")
            .setAccountNumber("000000")
            .setCountry("US")
            .build();
          Subject subject = new Subject.Builder(x).setUser(new User.Builder(x).setId(1).build()).build();
          X systemX = x.put("subject", subject);
          accountDAO.inX(systemX).put(sourceTrust);
          accountDAO.inX(systemX).put(sourceBank);
        }

        // Check for currency conversion
        if (SafetyUtil.equals(txn.getSourceCurrency(), txn.getDestinationCurrency()))
            return;

        // Create the destination trustee account
        TrustAccount destinationTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,"Trust Account "+txn.getDestinationCurrency()));
        if( destinationTrust == null ) {
          logger.info("trustee not found for " + txn.getDestinationCurrency() + " ... Generating...");
          destinationTrust = new TrustAccount.Builder(x)
            .setOwner(101) // nanopay.trust@nanopay.net
            .setDenomination(txn.getDestinationCurrency())
            .setLifecycleState(LifecycleState.ACTIVE)
            .setName(" Trust Account "+ txn.getDestinationCurrency())
            .build();
          BankAccount destBank = new BankAccount.Builder(x)
            .setOwner(1348) // admin@nanopay.net
            .setAccountNumber("000000")
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setLifecycleState(LifecycleState.ACTIVE)
            .setDenomination(txn.getDestinationCurrency())
            .setName(txn.getDestinationCurrency() +" Bank Account")
            .setCountry("US")
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
