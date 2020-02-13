/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: ``,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'plannerLogic',
      javaCode: `
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof DigitalAccount
           && destinationAccount instanceof INBankAccount
           && destinationAccount.getDenomination().equalsIgnoreCase(sourceAccount.getDenomination()) ) {
          KotakPaymentTransaction kotakPaymentTransaction = new KotakPaymentTransaction.Builder(x).build();
          kotakPaymentTransaction.copyFrom(requestTxn);
          kotakPaymentTransaction.setIsQuoted(true);
          return kotakPaymentTransaction;
      }
      return null;`
    },
  ]
});
