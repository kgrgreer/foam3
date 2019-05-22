/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DebtablePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

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
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
      Transaction plan = quote.getPlan();

      if (plan instanceof VerificationTransaction) return quote;

      logger.debug(this.getClass().getSimpleName(), "put", quote);

      Account sourceAccount = plan.findSourceAccount(x);
      Account destinationAccount = plan.findDestinationAccount(x);

      if ( sourceAccount instanceof Debtable ) {
        DebtAccount debtAccount = ((OverdraftAccount) sourceAccount).findDebtAccount(getX());
        Account creditorAccount = debtAccount.findCreditorAccount(getX());

        Transaction d = new DebtTransaction.Builder(x)
          .setSourceAccount(creditorAccount.getId())
          .setDestinationAccount(sourceAccount.getId())
          .setAmount(plan.getAmount())
          .setIsQuoted(true)
          .build();
        d.addNext(plan);
        quote.setPlan(d);
      }
      return quote;
      `
    }
  ]
});
