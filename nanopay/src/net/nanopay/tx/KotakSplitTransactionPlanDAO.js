foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakSplitTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',
  
  documentation: `Split CA bank to IN bank transactions`,
  
  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionQuote'
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      Transaction txn;
      if ( request.getType().equals("Transaction") ) {
        txn = new SummaryTransaction.Builder(x).build();
        txn.copyFrom(request);
      } else {
        txn = (Transaction) request.fclone();
      }
      txn.setStatus(TransactionStatus.PENDING);
      txn.setInitialStatus(TransactionStatus.COMPLETED);
      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);
      
      if ( sourceAccount instanceof CABankAccount && destinationAccount instanceof INBankAccount ) {
        DigitalAccount destinationDigitalaccount = DigitalAccount.findDefault(x, destinationAccount.findOwner(x), sourceAccount.getDenomination());
        // split 1: CA bank -> CA digital
        TransactionQuote q1 = new TransactionQuote.Builder(x).build();
        q1.copyFrom(quote);
        Transaction t1 = new Transaction.Builder(x).build();
        t1.copyFrom(request);
        t1.setDestinationAccount(destinationDigitalaccount.getId());
        t1.setDestinationCurrency(t1.getSourceCurrency());
        q1.setRequestTransaction(t1);
        TransactionQuote c1 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q1);
        Transaction cashinPlan = c1.getPlan();
        if ( cashinPlan != null ) {
          txn.addNext(cashinPlan);
        } else {
          return super.put_(x, quote);
        }
        // split 2: CA digital -> IN bank
        TransactionQuote q2 = new TransactionQuote.Builder(x).build();
        q2.copyFrom(quote);
        Transaction t2 = new Transaction.Builder(x).build();
        t2.copyFrom(request);
        t2.setSourceAccount(destinationDigitalaccount.getId());
        q2.setRequestTransaction(t2);
        TransactionQuote c2 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q2);
        Transaction kotakPlan = c2.getPlan();
        if ( kotakPlan != null ) {
          txn.addNext(kotakPlan);
          Transaction[] nextPlans = kotakPlan.getNext();
          while( nextPlans != null && nextPlans.length > 0 ) {
            Transaction nextPlan = nextPlans[0];
            txn.addLineItems(nextPlan.getLineItems(), nextPlan.getReverseLineItems());
            nextPlans = nextPlan.getNext();
          }
        } else {
          return super.put_(x, quote);
        }
        txn.setStatus(TransactionStatus.COMPLETED);
        txn.setIsQuoted(true);
        ((SummaryTransaction) txn).collectLineItems();
        quote.addPlan(txn);
      }
        
      return super.put_(x, quote);
      `
    },
  ]
});
