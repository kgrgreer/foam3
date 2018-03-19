/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ExchangeRate',

  javaImports: [
      'java.util.Date'
    ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'fromCurrency'
    },
    {
      class: 'String',
      name: 'toCurrency'
    },
    {
      class: 'Double',
      name: 'rate'
    },
    {
      class: 'DateTime',
      name: 'expirationDate'
    },

    /*Interac*/
    {
      class: 'DateTime',
      name: 'valueDate'
    },
    {
      class: 'String',
      name: 'fxStatus',
      value: 'Quoted'
    },
    {
      class: 'String',
      name: 'dealReferenceNumber',
      javaFactory: 'return java.util.UUID.randomUUID().toString().replace("-", "");'
    },
    {
      class: 'Long',
      name: 'totalFees'
    },
    {
      class: 'String',
      name: 'totalFeesCurrency'
    },
    {
      class: 'DateTime',
      name: 'processDate'
    },
    {
      class: 'Long',
      name: 'amount',
      value: 0
    },
    {
      class: 'String',
      name: 'code',
      value: '200'
    }
  ]
});
