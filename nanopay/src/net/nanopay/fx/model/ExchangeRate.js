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
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'fromCurrency'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'toCurrency'
    },
    {
      class: 'Double',
      name: 'rate'
    },
    {
      class: 'DateTime',
      name: 'created'
    },
    {
      class: 'DateTime',
      name: 'expirationDate'
    },
    /*Interac*/
    /* REVIEW: can this be replaced by created Date */
    {
      class: 'DateTime',
      name: 'valueDate'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.fx.ExchangeRateStatus',
      name: 'fxStatus',
      value: 'QUOTED' /*'Quoted'*/
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
