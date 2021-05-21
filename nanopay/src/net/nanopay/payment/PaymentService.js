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
          type: 'String',
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
          type: 'String',
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
