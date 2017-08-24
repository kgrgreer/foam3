/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.transactionservice',
  name: 'TransactionService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'transferValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'String'
        },
        {
          name: 'payeeId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'transferValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerEmail',
          javaType: 'String'
        },
        {
          name: 'payeeEmail',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'requestValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'String'
        },
        {
          name: 'payeeId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'requestValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerEmail',
          javaType: 'String'
        },
        {
          name: 'payeeEmail',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'getTransactionsById',
      javaReturns: 'foam.dao.DAO',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'userId',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'getTransactionsByEmail',
      javaReturns: 'foam.dao.DAO',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'userEmail',
          javaType: 'String'
        }
      ]
    }
  ]
});
