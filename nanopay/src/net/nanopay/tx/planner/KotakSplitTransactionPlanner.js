foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'KotakSplitTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Split CA bank to IN bank transactions`,

  javaImports: [
    'foam.core.Unit',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.kotak.KotakCredentials',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.bmo.cico.BmoCITransaction',
    'net.nanopay.tx.KotakCOTransaction',
    'net.nanopay.tx.rbc.RbcCITransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'org.apache.commons.lang.ArrayUtils'
  ],

  constants: [
    {
      type: 'String',
      name: 'LOCAL_FX_SERVICE_NSPEC_ID',
      value: 'localFXService'
    },
    {
      name: 'ALTERNA_INSTITUTION_NUMBER',
      type: 'String',
      value: '842'
    },
    {
      name: 'BMO_INSTITUTION_NUMBER',
      type: 'String',
      value: '001'
    },
    {
      name: 'RBC_INSTITUTION_NUMBER',
      type: 'String',
      value: '003'
    },
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
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
        checkTransactionLimits(x, requestTxn);
      }

      // get fx rate
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), LOCAL_FX_SERVICE_NSPEC_ID);
      FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(), quote.getRequestTransaction().getAmount(), quote.getRequestTransaction().getDestinationAmount(),"","",sourceAccount.getOwner(),"nanopay");
      requestTxn = (Transaction) requestTxn.fclone();
  
      // calculate source amount 
      Unit denomination = sourceAccount.findDenomination(x);
      Double currencyPrecision = Math.pow(10, denomination.getPrecision());
      Double amount =  Math.ceil(requestTxn.getDestinationAmount()/currencyPrecision/fxQuote.getRate()*currencyPrecision);
      requestTxn.setAmount(amount.longValue());

      FXSummaryTransaction txn = new FXSummaryTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);
      txn.addNext(createCompliance(requestTxn));
      DigitalAccount destinationDigitalaccount = DigitalAccount.findDefault(x, destinationAccount.findOwner(x), sourceAccount.getDenomination());
      // split 1: CA bank -> CA digital

      Transaction t1 = (Transaction) requestTxn.fclone();
      t1.setDestinationAccount(destinationDigitalaccount.getId());
      t1.setDestinationCurrency(t1.getSourceCurrency());
      t1.setDestinationAmount(t1.getAmount());
      Transaction cashinPlan = quoteTxn(x, t1);
      if ( cashinPlan != null ) {
        txn.addNext(cashinPlan);
      } else {
        return null;
      }
      
      // split 2: CA digital -> IN bank
      Transaction t2 = (Transaction) requestTxn.fclone();
      t2.setSourceAccount(destinationDigitalaccount.getId());
      Transaction kotakPlan = quoteTxn(x,t2);
      if ( kotakPlan != null ) {


        // add transfer to update CI trust account
        TrustAccount trustAccount = null;
        if ( cashinPlan instanceof BmoCITransaction ) {
          trustAccount = TrustAccount.find(x, quote.getSourceAccount(), BMO_INSTITUTION_NUMBER);
        } else if ( cashinPlan instanceof RbcCITransaction ) {
          trustAccount = TrustAccount.find(x, quote.getSourceAccount(), RBC_INSTITUTION_NUMBER);
        } else {
          trustAccount = TrustAccount.find(x, quote.getSourceAccount(), ALTERNA_INSTITUTION_NUMBER);
        }
        Transfer t = new Transfer();
        t.setAccount(trustAccount.getId());
        t.setAmount(requestTxn.getAmount());
        Transfer[] transfers = new Transfer[1];
        transfers[0] = t;
        KotakCOTransaction kotakCO = (KotakCOTransaction) kotakPlan.getNext()[0];
        kotakCO.setTransfers((Transfer[]) ArrayUtils.addAll(transfers, kotakCO.getTransfers()));

        txn.addNext(kotakPlan);
        Transaction[] nextPlans = kotakPlan.getNext();
        while( nextPlans != null && nextPlans.length > 0 ) {
          Transaction nextPlan = nextPlans[0];
          txn.addLineItems( nextPlan.getLineItems() );
          nextPlans = nextPlan.getNext();
        }
      } else {
        return null;
      }

      txn.setStatus(TransactionStatus.COMPLETED);
      ((FXSummaryTransaction) txn).setFxRate(fxQuote.getRate());
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
          name: 'x',
          type: 'Context'
        },
        {
          name: 'requestTxn',
          type: 'Transaction',
        }
      ],
      javaCode: `
        KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

        if ( requestTxn.getDestinationAmount() > credentials.getTradePurposeCodeLimit() ) {
          throw new RuntimeException("Exceed INR Transaction limit");
        }
        
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
    
        User owner = requestTxn.findSourceAccount(x).findOwner(x);
        DAO accounts = owner.getAccounts(x);
        ArraySink sink = new ArraySink(x);
        accounts.where (MLang.AND(
          MLang.INSTANCE_OF(CABankAccount.class),
          MLang.EQ(CABankAccount.STATUS, BankAccountStatus.VERIFIED)
        )).select(sink);
        List<CABankAccount> caBankAccounts = sink.getArray();
    
        long limit = 0;
        Date now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        Date dayAgo = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());
    
        for ( CABankAccount bankAccount : caBankAccounts ) {
          ArraySink txnSink = new ArraySink(x);
          txnDAO.where(MLang.AND(
            MLang.EQ(Transaction.SOURCE_ACCOUNT, bankAccount.getId()),
            MLang.EQ(Transaction.STATUS, TransactionStatus.COMPLETED),
            MLang.GTE(Transaction.CREATED, dayAgo),
            MLang.LT(Transaction.CREATED, now)
          )).select(txnSink);
    
          List<Transaction> txnList = txnSink.getArray();
          for ( Transaction txn: txnList ) {
            Account account = txn.findDestinationAccount(x);
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
