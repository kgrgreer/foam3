/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'KotakTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for INR Digital to INR bank account`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.tx.KotakPaymentTransaction',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        KotakPaymentTransaction kotakPaymentTransaction = new KotakPaymentTransaction.Builder(x).build();
        kotakPaymentTransaction.copyFrom(requestTxn);
        return kotakPaymentTransaction;
      `
    },
  ]
});
