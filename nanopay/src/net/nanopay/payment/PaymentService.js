/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.payment',
  name: 'PaymentService',

  methods: [
    {
      name: 'addPayee',
      args: [
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user',
          documentation: 'User to be added as Payee'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.bank.BankAccount',
          name: 'bankAccount',
          documentation: 'Payee Bank Account'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'sourceUser',
          documentation: 'User that is adding a Payee'
        }
      ]
    },
    {
      name: 'updatePayee',
      args: [
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user',
          documentation: 'User to be added as Payee'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.bank.BankAccount',
          name: 'bankAccount',
          documentation: 'Payee Bank Account'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'sourceUser',
          documentation: 'User that is adding a Payee'
        }
      ]
    },
    {
      name: 'deletePayee',
      args: [
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'payeeUserId',
          documentation: 'User to be deleted'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'payerUserId'
        }
      ]
    },
    {
      name: 'submitPayment',
      javaReturns: 'net.nanopay.tx.model.Transaction',
      returns: 'Promise',
      javaThrows: ['java.lang.Exception'],
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ]
    }
  ]
});
