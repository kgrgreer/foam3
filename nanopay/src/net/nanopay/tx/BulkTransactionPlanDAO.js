foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    A decorator in the localTransactionQuotePlanDAO that supports 
     the one to many transactions and the one to one transactions.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote parentQuote = (TransactionQuote) obj;

        // Check whether it is bulkTransaction
        if ( parentQuote.getRequestTransaction() instanceof BulkTransaction) {
          BulkTransaction bulkTxn = (BulkTransaction) parentQuote.getRequestTransaction();

          DAO userDAO = (DAO) x.get("localUserDAO");
          DAO planDAO = (DAO) x.get("localTransactionQuotePlanDAO");
          DAO balanceDAO = (DAO) x.get("localBalanceDAO");

          User payer = (User) userDAO.find_(x, bulkTxn.getPayerId());

          // If only a single child transaction or no children and a non-null
          // payee then quote a single transaction, which is a one to one transaction.
          if ( bulkTxn.getNext().length == 0 ) {
            if ( bulkTxn.getPayeeId() != 0 ) {
              bulkTxn.setSourceAccount(getAccountId(x, payer, bulkTxn.getSourceCurrency(), bulkTxn.getExplicitCI()));
              User payee = (User) userDAO.find_(x, bulkTxn.getPayeeId());
              bulkTxn.setDestinationAccount(getAccountId(x, payee, bulkTxn.getDestinationCurrency(), bulkTxn.getExplicitCO()));
              parentQuote.setRequestTransaction(bulkTxn);
              return (TransactionQuote) getDelegate().put_(x, parentQuote);
            } else {
              throw new RuntimeException("BulkTransaction missing Child transactions or payee.");
            }
          }

          // Set the destination of bulk transaction to payer's default digital account
          DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());
          bulkTxn.setSourceAccount(payerDigitalAccount.getId());
          bulkTxn.setDestinationAccount(payerDigitalAccount.getId());

          long sum = 0;
          Transaction[] childTransactions = bulkTxn.getNext();
          CompositeTransaction ct = new CompositeTransaction();
          // Set the composite transaction as a quoted transaction so that 
          // it won't be quoted in the DigitalTransactionPlanDAO decorator.
          // In order to set the composite transaction as a quoted one, it requires
          // to have both source account and destination account setup.
          ct.setSourceAccount(payerDigitalAccount.getId());
          ct.setDestinationAccount(payerDigitalAccount.getId());
          ct.setIsQuoted(true);

          for (Transaction childTransaction : childTransactions) {
            // Sum amount of child transactions
            sum += childTransaction.getAmount();

            TransactionQuote childQuote = new TransactionQuote();

            // Set the source of each child transaction to its parent destination digital account
            childTransaction.setSourceAccount(bulkTxn.getDestinationAccount());

            // Set the destination of each child transaction to payee's default digital account
            User payee = (User) userDAO.find_(x, childTransaction.getPayeeId());
            childTransaction.setDestinationAccount(getAccountId(x, payee, childTransaction.getDestinationCurrency(), bulkTxn.getExplicitCO()));

            // Quote each child transaction
            childQuote.setRequestTransaction(childTransaction);

            // Put all the child transaction quotes to TransactionQuotePlanDAO
            TransactionQuote result = (TransactionQuote) planDAO.put(childQuote);

            // Add the child transaction plans as the next of the compositeTransaction
            ct.addNext(result.getPlan());
          }

          // TODO: consider FX.
          // Set the total amount on parent
          bulkTxn.setAmount(sum);

          Long payerDigitalBalance = (Long) payerDigitalAccount.findBalance(x);

          if ( sum > payerDigitalBalance ||
               bulkTxn.getExplicitCI() ) {
            // If digital does not have sufficient funds
            BankAccount payerDefaultBankAccount = BankAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());

            // Create a Cash-In transaction
            Transaction cashInTransaction = new Transaction();
            cashInTransaction.setSourceAccount(payerDefaultBankAccount.getId());
            cashInTransaction.setDestinationAccount(payerDigitalAccount.getId());
            cashInTransaction.setAmount(bulkTxn.getAmount());
            TransactionQuote cashInTransactionQuote = new TransactionQuote();
            cashInTransactionQuote.setRequestTransaction(cashInTransaction);
            cashInTransactionQuote = (TransactionQuote) planDAO.put(cashInTransactionQuote);
            cashInTransaction = cashInTransactionQuote.getPlan();

            // Add the compositeTransaction as the next of the cash-in transaction.
            cashInTransaction.addNext(ct);
            // Add the cash-in transaction as the next of the bulk transaction.
            bulkTxn.clearNext();
            bulkTxn.addNext(cashInTransaction);
          } else {
            // If the payer's digital account has sufficient balance, then cash-in is not required.
            // Add the compositeTransaction as the next of the bulk transaction.
            bulkTxn.clearNext();
            bulkTxn.addNext(ct);
          }
          bulkTxn.setIsQuoted(true);

          // Set bulk transaction to the parent quote
          parentQuote.setPlan(bulkTxn);

          return parentQuote;
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'getAccountId',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'currency',
          type: 'String'
        },
        {
          name: 'cico',
          type: 'Boolean'
        }
      ],
      javaType: 'Long',
      javaCode: `
        if ( cico ) {
          Account account = BankAccount.findDefault(x, user, currency);
          if ( account != null ) {
            return account.getId();
          }
          throw new RuntimeException(currency + " BankAccount not found for "+user.getId());
        } else {
          return DigitalAccount.findDefault(x, user, currency).getId();
        }
      `
    }
  ]
});
