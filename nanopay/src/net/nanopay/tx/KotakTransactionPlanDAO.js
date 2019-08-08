/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof DigitalAccount
          && destinationAccount instanceof INBankAccount ) {
        if ( destinationAccount.getDenomination().equalsIgnoreCase(sourceAccount.getDenomination()) ) {
          KotakCOTransaction kotakCOTransaction = new KotakCOTransaction.Builder(x).build();
          kotakCOTransaction.copyFrom(request);
          kotakCOTransaction.setIsQuoted(true);
          quote.addPlan(kotakCOTransaction);
        }
      }
      return super.put_(x, quote);`
    },
  ]
});
