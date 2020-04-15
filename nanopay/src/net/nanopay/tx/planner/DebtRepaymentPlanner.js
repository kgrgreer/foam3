foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DebtRepaymentPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.DebtTransaction',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      //predicate 
      // if ( ! ( quote.getDestinationAccount() instanceof DebtAccount ) )
      //   return super.put_(x, quote);

      
      Transaction txn = new DebtTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);

      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      Account creditorAccount = ((DebtAccount) destinationAccount).findCreditorAccount(x);

      Long balance = (Long) destinationAccount.findBalance(x);
      Balance bal = new Balance ();
      bal.setBalance(balance);
      bal.setAccount(destinationAccount.getId());

      Long amount = txn.getAmount();
      amount = amount > -balance ? -balance : amount;
      destinationAccount.validateAmount(x, bal, amount);
      txn.setAmount(amount);

      quote.addTransfer(sourceAccount.getId(), -txn.getAmount());
      quote.addTransfer(destinationAccount.getId(), txn.getAmount());
      quote.addTransfer(creditorAccount.getId(), txn.getAmount());

      return txn;
    `
    }
  ]
});
