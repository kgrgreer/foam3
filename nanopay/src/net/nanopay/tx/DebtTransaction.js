foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: ``,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Debtable',
    'net.nanopay.tx.model.Transaction',
    'java.util.List',
    'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      // If Detable/Overdraft account does not have sufficient balance
      // then incur debt.

      Long amount = getTotal();
      Account sourceAccount = findSourceAccount(x);
      Account destinationAccount = findDestinationAccount(x);
      DebtAccount debtAccount = ((Debtable) destinationAccount).findDebtAccount(x);

      Long balance = getDestinationAccount().findBalance(x);
      destinationAccount.validateAmount(x, balance, amount);

      Long debt = amount > balance ? amount - balance : 0L;
      if ( debt > 0 ) {
        transfers.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-debt).build());
        transfers.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(debt).build());

        transfers.add(new Transfer.Builder(x).setAccount(debtAccount.setAmount(-debt).build());
      }
      return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
