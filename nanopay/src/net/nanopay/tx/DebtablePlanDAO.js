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
    'net.nanopay.account.OverdraftAccount',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'foam.nanos.logger.Logger',
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
          d.setIsQuoted(true);
          d.addNext(plan);
          quote.setPlan(d);
        }
      return quote;`
    }
  ]
});
