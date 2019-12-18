/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtablePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Plans debt transactions for Debtable Accounts',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.account.OverdraftAccount',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'java.util.ArrayList',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: ` TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
      Transaction plan = quote.getPlan();

      if (plan instanceof VerificationTransaction) return quote;

      Account sourceAccount = quote.getSourceAccount();

      if ( ! ( sourceAccount instanceof Debtable ) ) return quote;
        DebtAccount debtAccount = ((Debtable) sourceAccount).findDebtAccount(x);
        if ( debtAccount != null &&
             debtAccount.getLimit() > 0 ) {
          Account creditorAccount = debtAccount.findCreditorAccount(x);
          Transaction d = new DebtTransaction.Builder(x).build();
          d.copyFrom(plan);
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

          d.setTransfers(createTransfers(x, d));

          d.setIsQuoted(true);
          d.addNext(plan);
          quote.setPlan(d);
        }
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
      // If Detable/Overdraft account does not have sufficient balance
      // then incur debt.

      Long debt = txn.getAmount();
      List transfers = new ArrayList();

      if ( debt > 0 ) {
        transfers.add(new Transfer.Builder(x).setAccount(txn.getSourceAccount()).setAmount(-debt).build());
        transfers.add(new Transfer.Builder(x).setAccount(txn.getDestinationAccount()).setAmount(debt).build());

        DebtAccount debtAccount = ((Debtable) txn.findDestinationAccount(x)).findDebtAccount(x);

        transfers.add(new Transfer.Builder(x).setAccount(debtAccount.getId()).setAmount(-debt).build());
      }
      return (Transfer[]) transfers.toArray(new Transfer[0]);
      `
    }
  ]
});
