foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'KotakSplitTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Split CA bank to IN bank transactions`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.kotak.KotakCredentials',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List'
  ],

  constants: [
    {
      type: 'String',
      name: 'LOCAL_FX_SERVICE_NSPEC_ID',
      value: 'localFXService'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();

      // check for transaction limits
      INBankAccount inDestinationAccount = (INBankAccount) destinationAccount;
      if ( getPurposeText(inDestinationAccount.getPurposeCode()).equals("TRADE_TRANSACTION") ) {
        checkTransactionLimits(requestTxn);
      }

      // get fx rate
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), LOCAL_FX_SERVICE_NSPEC_ID);
      FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(), quote.getRequestTransaction().getAmount(), quote.getRequestTransaction().getDestinationAmount(),"","",sourceAccount.getOwner(),"nanopay");
      
      // calculate source amount 
      Double amount =  Math.ceil(requestTxn.getDestinationAmount()/100.00/fxQuote.getRate()*100);
      requestTxn.setAmount(amount.longValue());

      FXSummaryTransaction txn = new FXSummaryTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);
      txn.setStatus(TransactionStatus.PENDING);
      DigitalAccount destinationDigitalaccount = DigitalAccount.findDefault(x, destinationAccount.findOwner(x), sourceAccount.getDenomination());
      // split 1: CA bank -> CA digital

      Transaction t1 = new Transaction.Builder(x).build();
      t1.copyFrom(requestTxn);
      t1.setDestinationAccount(destinationDigitalaccount.getId());
      t1.setDestinationCurrency(t1.getSourceCurrency());
      Transaction cashinPlan = quoteTxn(x, t1);
      if ( cashinPlan != null ) {
        txn.addNext(cashinPlan);
      } else {
        return null;
      }
      
      // split 2: CA digital -> IN bank
      Transaction t2 = new Transaction.Builder(x).build();
      t2.copyFrom(requestTxn);
      t2.setSourceAccount(destinationDigitalaccount.getId());
      Transaction kotakPlan = quoteTxn(x,t2);
      if ( kotakPlan != null ) {
        txn.addNext(kotakPlan);
        Transaction[] nextPlans = kotakPlan.getNext();
        while( nextPlans != null && nextPlans.length > 0 ) {
          Transaction nextPlan = nextPlans[0];
          txn.addLineItems(nextPlan.getLineItems(), nextPlan.getReverseLineItems());
          nextPlans = nextPlan.getNext();
        }
      } else {
        return null;
      }

      txn.setStatus(TransactionStatus.COMPLETED);
      ((FXSummaryTransaction) txn).setFxRate(fxQuote.getRate());
      KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");
      txn.addLineItems(new TransactionLineItem[] {new InvoicedFeeLineItem.Builder(getX()).setGroup("InvoiceFee").setAmount(credentials.getTransactionFee()).setCurrency(requestTxn.getSourceCurrency()).build()}, null);  
      ((FXSummaryTransaction) txn).collectLineItems();
      return txn;
    `
    },
    {
      name: 'getPurposeText',
      javaType: 'String',
      args: [
        {
          name: 'purposeCode',
          type: 'String',
        }
      ],
      javaCode: `
        switch (purposeCode) {
          case "P0306":
            return "PAYMENTS_FOR_TRAVEL";
    
          case "P1306":
            return "TAX_PAYMENTS_IN_INDIA";
    
          case "P0011":
            return "EMI_PAYMENTS_FOR_REPAYMENT_OF_LOANS";
    
          case "P0103":
            return "ADVANCE_AGAINST_EXPORTS";
    
          default:
            return "TRADE_TRANSACTION";
        }
      `
    },
    {
      name: 'checkTransactionLimits',
      javaType: 'void',
      args: [
        {
          name: 'requestTxn',
          type: 'Transaction',
        }
      ],
      javaCode: `
        KotakCredentials credentials = (KotakCredentials) getX().get("kotakCredentials");

        if ( requestTxn.getDestinationAmount() > credentials.getTradePurposeCodeLimit() ) {
          throw new RuntimeException("Exceed INR Transaction limit");
        }
        
        DAO txnDAO = (DAO) getX().get("localTransactionDAO");
    
        User owner = requestTxn.findSourceAccount(getX()).findOwner(getX());
        DAO accounts = owner.getAccounts(getX());
        ArraySink sink = new ArraySink(getX());
        accounts.where (MLang.AND(
          MLang.INSTANCE_OF(CABankAccount.class),
          MLang.EQ(CABankAccount.STATUS, BankAccountStatus.VERIFIED)
        )).select(sink);
        List<CABankAccount> caBankAccounts = sink.getArray();
    
        long limit = 0;
        Date now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        Date dayAgo = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());
    
        for ( CABankAccount bankAccount : caBankAccounts ) {
          ArraySink txnSink = new ArraySink(getX());
          txnDAO.where(MLang.AND(
            MLang.EQ(Transaction.SOURCE_ACCOUNT, bankAccount.getId()),
            MLang.EQ(Transaction.STATUS, TransactionStatus.COMPLETED),
            MLang.GTE(Transaction.CREATED, dayAgo),
            MLang.LT(Transaction.CREATED, now)
          )).select(txnSink);
    
          List<Transaction> txnList = txnSink.getArray();
          for ( Transaction txn: txnList ) {
            Account account = txn.findDestinationAccount(getX());
            if ( account instanceof INBankAccount && getPurposeText(((INBankAccount) account).getPurposeCode()).equals("TRADE_TRANSACTION") ) {
              limit += txn.getDestinationAmount();
            }
          }
        }
        
        if ( limit + requestTxn.getDestinationAmount() > credentials.getTradePurposeCodeLimit() ) {
          throw new RuntimeException("Exceed INR Transaction limit");
        }
      `
    }
  ]
});
