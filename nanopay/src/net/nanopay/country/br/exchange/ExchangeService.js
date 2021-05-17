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
foam.INTERFACE({
  package: 'net.nanopay.country.br.exchange',
  name: 'ExchangeService',
  methods: [
    {
      name: 'createTransaction',
      type: 'net.nanopay.tx.model.Transaction',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ]
    },
    {
      name: 'updateTransactionStatus',
      type: 'net.nanopay.tx.model.Transaction',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ]
    },
    {
      name: 'createExchangeCustomerDefault',
      async: true,
      type: 'net.nanopay.country.br.exchange.ExchangeCustomer',
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'Long',
          name: 'userId'
        }
      ]
    },
    {
      name: 'createExchangeCustomer',
      async: true,
      type: 'net.nanopay.country.br.exchange.ExchangeCustomer',
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'Long',
          name: 'userId'
        },
        {
          type: 'Long',
          name: 'amount'
        }
      ]
    },
    {
      name: 'getTransactionLimit',
      type: 'Long',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'Long',
          name: 'userId'
        },
      ]
    },
    {
      name: 'updateTransactionLimit',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'Long',
          name: 'userId'
        },
        {
          type: 'Long',
          name: 'amount'
        },
      ]
    },
    {
      name: 'searchNatureCode',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          type: 'Long',
          name: 'userId'
        },
        {
          type: 'String',
          name: 'natureCode'
        },
      ]
    }
  ]
});
