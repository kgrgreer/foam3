foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: ``,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',
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

      Balance balance = (Balance) destinationAccount.findBalance(x);
      destinationAccount.validateAmount(x, balance, amount);
      Long bal = balance.getBalance();
      Long debt = amount > bal ? amount - bal : 0L;

      List transfers = new ArrayList();

      if ( debt > 0 ) {
        transfers.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-debt).build());
        transfers.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(debt).build());

        transfers.add(new Transfer.Builder(x).setAccount(debtAccount.getId()).setAmount(-debt).build());
      }
      return (Transfer[]) transfers.toArray(new Transfer[0]);
      `
    }
  ]
});
