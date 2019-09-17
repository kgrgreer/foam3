foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A decorator in the localTransactionQuotePlanDAO that handles one to many transactions`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Balance',
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

        // Check whether it is bulkTransaction
        if ( parentTxn instanceof BulkTransaction) {
          // Check if the child transaction array is empty or not
          if ( parentTxn.getNext().length < 1 ) {
            throw new RuntimeException("The child transactions of a bulk transaction cannot be empty");
          }

          DAO userDAO = (DAO) x.get("localUserDAO");
          DAO planDAO = (DAO) x.get("localTransactionQuotePlanDAO");
          DAO balanceDAO = (DAO) x.get("localBalanceDAO");

          User payer = (User) userDAO.find_(x, parentTxn.getPayerId());

          long sum = 0;
          Transaction[] childTransactions= parentTxn.getNext();
          CompositeTransaction ct = new CompositeTransaction();
          ct.setPayerId(parentTxn.getPayerId());
          ct.setPayeeId(parentTxn.getPayerId());

          // Set the destination of parent transaction to payer's default digital account
          DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, parentTxn.getSourceCurrency());
          parentTxn.setDestinationAccount(payerDigitalAccount.getId());

          for (Transaction childTransaction : childTransactions) {
            // Sum amount of child transactions
            sum += childTransaction.getAmount();

            TransactionQuote childQuote = new TransactionQuote();

            // Set the source of each child transaction to its parent destination digital account
            childTransaction.setSourceAccount(parentTxn.getDestinationAccount());

            // Set the destination of each child transaction to payee's default digital account
            User payee = (User) userDAO.find_(x, childTransaction.getPayeeId());
            DigitalAccount payeeDigitalAccount = DigitalAccount.findDefault(x, payee, childTransaction.getDestinationCurrency());
            childTransaction.setDestinationAccount(payeeDigitalAccount.getId());

            // Quote each child transaction
            childQuote.setRequestTransaction(childTransaction);

            // Put all the child transaction quotes to TransactionQuotePlanDAO
            TransactionQuote result = (TransactionQuote) planDAO.put(childQuote);

            // Add the child transaction plans as the next of the compositeTransaction
            ct.addNext(result.getPlan());
          }

          // Set the total amount on parent
          parentTxn.setAmount(sum);

          Long payerDigitalBalance = (Long) payerDigitalAccount.findBalance(x);

          if ( sum > payerDigitalBalance ) {
            // If digital does not have sufficient funds, then set the source account to their default bank account.
            BankAccount payerDefaultBankAccount = BankAccount.findDefault(x, payer, parentTxn.getSourceCurrency());
            parentTxn.setSourceAccount(payerDefaultBankAccount.getId());

            // Create a Cash-In transaction
            Transaction cashInTransaction = new Transaction();
            cashInTransaction.setSourceAccount(payerDefaultBankAccount.getId());
            cashInTransaction.setDestinationAccount(payerDigitalAccount.getId());
            cashInTransaction.setAmount(parentTxn.getAmount());
            TransactionQuote cashInTransactionQuote = new TransactionQuote();
            cashInTransactionQuote.setRequestTransaction(cashInTransaction);
            cashInTransactionQuote = (TransactionQuote) planDAO.put(cashInTransactionQuote);
            cashInTransaction = cashInTransactionQuote.getPlan();
            
            // Add cash-in transaction as the next fo the parent transaction
            cashInTransaction.addNext(ct);
            parentTxn.clearNext();
            parentTxn.addNext(cashInTransaction);
          } else {
            // If the payer digital account does have sufficient balance then
            // set the source and destination as the default digital account.
            // When this is quoted, the planners will do nothing (which is what we want).
            parentTxn.setSourceAccount(payerDigitalAccount.getId());
            
            // Add a compositeTransaction as the next of the parent transaction
            parentTxn.clearNext();
            parentTxn.addNext(ct);
          }

          // Set parent transaction to the parent quote
          parentQuote.setPlan(parentTxn);

          return parentQuote;
        }
        return super.put_(x, obj);
      `
    }
  ]
});
