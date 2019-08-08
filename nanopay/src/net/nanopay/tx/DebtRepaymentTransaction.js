foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtRepaymentTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: 'transaction that is used to repay debt on a debtAccount',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
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

      Long amount = getAmount();
      Account sourceAccount = findSourceAccount(x);
      Account destinationAccount = findDestinationAccount(x);
      Account creditorAccount = ((DebtAccount) destinationAccount).findCreditorAccount(x);

      Long balance = (Long) destinationAccount.findBalance(x);
      Balance bal = new Balance ();
      bal.setBalance(balance);
      bal.setAccount(destinationAccount.getId());

      amount = amount > -balance ? -balance : amount;
      destinationAccount.validateAmount(x, bal, amount);
      this.setAmount(amount);
      List transfers = new ArrayList();
      if (amount > 0) {
        transfers.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-amount).build());
        transfers.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(amount).build());
        transfers.add(new Transfer.Builder(x).setAccount(creditorAccount.getId()).setAmount(amount).build());
      }
      return (Transfer[]) transfers.toArray(new Transfer[0]);
      `
    }
  ]
});
