foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'DebtablePlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Debtable',
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

      // predicate 
      // if ( ! ( sourceAccount instanceof Debtable ) ) return quote;

      Account sourceAccount = quote.getSourceAccount();

      DebtAccount debtAccount = ((Debtable) sourceAccount).findDebtAccount(x);
      if ( debtAccount != null && debtAccount.getLimit() > 0 ) {
        Account creditorAccount = debtAccount.findCreditorAccount(x);
        Transaction d = new DebtTransaction();
        d.copyFrom(requestTxn);
        d.setSourceAccount(creditorAccount.getId());
        d.setDestinationAccount(sourceAccount.getId());

        Long balance = (Long) sourceAccount.findBalance(x);
        Balance bal = new Balance ();
        bal.setBalance(balance);
        bal.setAccount(sourceAccount.getId());
        sourceAccount.validateAmount(x, bal, d.getAmount());
        Long amount = d.getAmount();
        Long debt = amount > balance ? amount - balance : 0L;
        d.setAmount(debt);

        quote.addTransfer(creditorAccount.getId(), -d.getAmount());
        quote.addTransfer(sourceAccount.getId(), d.getAmount());
        quote.addTransfer(debtAccount.getId(), -d.getAmount());
  
        return d;
      }
      return null;
    `
    }
  ]
});
