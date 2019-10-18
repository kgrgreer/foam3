/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtRepaymentPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Transactions with a destination of a DebtAccount are repaying Debt',

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
      name: 'put_',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;
      if ( ! ( quote.getDestinationAccount() instanceof DebtAccount ) )
        return super.put_(x, quote);
      Transaction request = quote.getRequestTransaction();
      Transaction txn = new DebtTransaction.Builder(x).build();
      txn.copyFrom(request);

      Account sourceAccount = txn.findSourceAccount(x);
      Account destinationAccount = txn.findDestinationAccount(x);
      Account creditorAccount = ((DebtAccount) destinationAccount).findCreditorAccount(x);

      Long balance = (Long) destinationAccount.findBalance(x);
      Balance bal = new Balance ();
      bal.setBalance(balance);
      bal.setAccount(destinationAccount.getId());

      Long amount = txn.getAmount();
      amount = amount > -balance ? -balance : amount;
      destinationAccount.validateAmount(x, bal, amount);
      txn.setAmount(amount);

      txn.setTransfers(createTransfers(x, txn));
      txn.setIsQuoted(true);
      quote.setPlan(txn);
      return quote;`
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      Long amount = txn.getAmount();
      List transfers = new ArrayList();
      if (amount > 0) {
        transfers.add(new Transfer.Builder(x).setAccount(txn.getSourceAccount()).setAmount(-amount).build());
        transfers.add(new Transfer.Builder(x).setAccount(txn.getDestinationAccount()).setAmount(amount).build());

        Account destinationAccount = txn.findDestinationAccount(x);
        Account creditorAccount = ((DebtAccount) destinationAccount).findCreditorAccount(x);
        transfers.add(new Transfer.Builder(x).setAccount(creditorAccount.getId()).setAmount(amount).build());
      }
      return (Transfer[]) transfers.toArray(new Transfer[0]);
      `
    }
  ]
});
