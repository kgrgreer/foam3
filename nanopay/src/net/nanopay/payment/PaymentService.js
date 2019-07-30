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
          type: 'Long',
          name: 'user',
          documentation: 'User to be added as Payee'
        },
        {
          type: 'Long',
          name: 'bankAccount',
          documentation: 'Payee Bank Account'
        },
        {
          type: 'Long',
          name: 'sourceUser',
          documentation: 'User that is adding a Payee'
        }
      ]
    },
    {
      name: 'updatePayee',
      args: [
        {
          type: 'Long',
          name: 'user',
          documentation: 'User to be added as Payee'
        },
        {
          type: 'Long',
          name: 'bankAccount',
          documentation: 'Payee Bank Account'
        },
        {
          type: 'Long',
          name: 'sourceUser',
          documentation: 'User that is adding a Payee'
        }
      ]
    },
    {
      name: 'deletePayee',
      args: [
        {
          type: 'Long',
          name: 'payeeUserId',
          documentation: 'User to be deleted'
        },
        {
          type: 'Long',
          name: 'payerUserId'
        }
      ]
    },
    {
      name: 'submitPayment',
      type: 'net.nanopay.tx.model.Transaction',
      async: true,
      javaThrows: ['java.lang.Exception'],
      args: [
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ]
    },
    {
      name: 'updatePaymentStatus',
      type: 'net.nanopay.tx.model.Transaction',
      async: true,
      javaThrows: ['java.lang.Exception'],
      args: [
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ]
    }
  ]
});
