foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote parentQuote = (TransactionQuote) obj;
        Transaction parentTxn = parentQuote.getRequestTransaction();
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO planDAO = (DAO) x.get("localTransactionQuotePlanDAO");
    
        // Todo: check compliance
        // Todo: check empty array
    
        // Check whether it is bulkTransaction
        if ( parentTxn instanceof BulkTransaction) {
          long sum = 0;
          Transaction[] childTransactions= ((BulkTransaction) parentTxn).getChildTransactionsArray();
          CompositeTransaction ct = new CompositeTransaction();
          ct.setPayerId(parentTxn.getPayerId());
          ct.setPayeeId(parentTxn.getPayerId());
    
          for (int i = 0 ; i< childTransactions.length ; i++) {
            // Sum amount of child transactions
            sum = sum + childTransactions[i].getAmount();
    
            Transaction childTransaction =  childTransactions[i];
            TransactionQuote childQuote = new TransactionQuote();

            // Set the source of each child transaction to its parent destination digital account
            childTransaction.setSourceAccount(parentTxn.getDestinationAccount());
            childTransaction.setPayerId(parentTxn.getPayerId());
            childTransaction.setSourceCurrency(parentTxn.getSourceCurrency());
            childTransaction.setDestinationCurrency(parentTxn.getSourceCurrency());
        
            // Quote each child transaction
            childQuote.setRequestTransaction(childTransactions[i]);
    
            // Put all the child transaction quotes to TransactionQuotePlanDAO
            TransactionQuote result = (TransactionQuote) planDAO.put(childQuote);

            // Add the child transaction plans as the next of the compositeTransaction
            ct.addNext(result.getPlan());
          }
    
          // Set the total amount on parent
          parentTxn.setAmount(sum);

          // If destinationCurrency is not default CAD
          parentTxn.setDestinationCurrency(parentTxn.getSourceCurrency());
          
          // Quote parent transaction
          parentQuote.setPlan(parentTxn);
    
          User payer = (User) userDAO.find_(x, parentTxn.getPayerId());
          DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, parentTxn.getSourceCurrency());
    
          // If digital does not have sufficient funds, then set the source account to their default bank account.
          // When this is quoted, it will create a Cash-In.
          if ( sum < payerDigitalAccount.getBalance() ) {
            BankAccount defaultBankAccount = BankAccount.findDefault(x, payer, parentTxn.getSourceCurrency());
            parentTxn.setSourceAccount(defaultBankAccount.getId());
          } else {
            // If the payer digital account does have sufficient balance then
            // set the source and destination as the default digital account.
            // when this is quoted, the planners will do nothing (which is what we want).
            parentTxn.setSourceAccount(payerDigitalAccount.getId());
          }
          parentTxn.setDestinationAccount(payerDigitalAccount.getId());
    
          // Add a compositeTransaction as the next of the parent
          parentQuote.getPlan().addNext(ct);
    
          return parentQuote;
        }
        return super.put_(x, obj);
      `
    }
  ]
});
