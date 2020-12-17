/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
