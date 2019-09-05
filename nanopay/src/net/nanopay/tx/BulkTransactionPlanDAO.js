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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote parentQuote = (TransactionQuote) obj;
        Transaction parentTxn = parentQuote.getRequestTransaction();
        DAO userDAO = (DAO) x.get("localUserDAO");
        DAO planDAO = (DAO) x.get("localTransactionQuotePlanDAO");
    
        // Check whether it is bulkTransaction
        if ( parentTxn instanceof BulkTransaction) {

          User payer = (User) userDAO.find_(x, parentTxn.getPayerId());

          // Check if the payer passed the compliance or not
          if ( ComplianceStatus.PASSED != payer.getCompliance() ) {
            throw new RuntimeException("The payer did not pass the compliance check.");
          }
          
          // Check if the child transaction array is empty or not
          if ( parentTxn.getNext().length < 1 ) {
            throw new RuntimeException("The child transactions of a bulk transasction cannot be empty");
          }

          long sum = 0;
          Transaction[] childTransactions= parentTxn.getNext();
            CompositeTransaction ct = new CompositeTransaction();
            ct.setPayerId(parentTxn.getPayerId());
            ct.setPayeeId(parentTxn.getPayerId());
      
            for (int i = 0; i < childTransactions.length; i++) {
              // Sum amount of child transactions
              sum = sum + childTransactions[i].getAmount();
      
              Transaction childTransaction =  childTransactions[i];
              TransactionQuote childQuote = new TransactionQuote();
  
              // Set the source of each child transaction to its parent destination digital account
              childTransaction.setSourceAccount(parentTxn.getDestinationAccount());
              childTransaction.setPayerId(parentTxn.getPayerId());
          
              // Quote each child transaction
              childQuote.setRequestTransaction(childTransactions[i]);
      
              // Put all the child transaction quotes to TransactionQuotePlanDAO
              TransactionQuote result = (TransactionQuote) planDAO.put(childQuote);
  
              // Add the child transaction plans as the next of the compositeTransaction
              ct.addNext(result.getPlan());
            }
      
            // Set the total amount on parent
            parentTxn.setAmount(sum);
  
            // Quote parent transaction
            parentQuote.setPlan(parentTxn);
      
            DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, parentTxn.getSourceCurrency());
      
            // If digital does not have sufficient funds, then set the source account to their default bank account.
            // When this is quoted, it will create a Cash-In.
            if ( sum > payerDigitalAccount.getBalance() ) {
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
            parentQuote.getPlan().clearNext();
            parentQuote.getPlan().addNext(ct);
              
          return parentQuote;
        }
        return super.put_(x, obj);
      `
    }
  ]
});
