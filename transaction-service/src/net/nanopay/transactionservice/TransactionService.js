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
      javaReturns: 'net.nanopay.transactionservice.model.Transaction',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'Long'
        },
        {
          name: 'payeeId',
          javaType: 'Long'
        },
        {
          name: 'amount',
          javaType: 'Long'
        }
      ]
    },
    {
      name: 'transferValueByEmail',
      javaReturns: 'void',
      returns: 'Promise',
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
          javaType: 'Long'
        }
      ]
    },
    {
      name: 'requestValueById',
      javaReturns: 'void',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'Long'
        },
        {
          name: 'payeeId',
          javaType: 'Long'
        },
        {
          name: 'amount',
          javaType: 'Long'
        }
      ]
    },
    {
      name: 'requestValueByEmail',
      javaReturns: 'void',
      returns: 'Promise',
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
          javaType: 'Long'
        }
      ]
    }
  ]
});
