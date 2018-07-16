/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ExchangeRate',

  documentation: 'Exchange rate information pertaining to two currency',

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
      name: 'fromCurrency',
      documentation: 'Currency originating the payment/request.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'toCurrency',
      documentation: 'Target currency of the payment/request.'
    },
    {
      class: 'Double',
      name: 'rate',
      documentation: 'Percentage rate/difference between both currency values.'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Date exchange rate was fetched and accepted.'
    },
    {
      class: 'DateTime',
      name: 'expirationDate',
      documentation: 'Date exchange rate expires.'
    },
    /*Interac*/
    /* REVIEW: can this be replaced by created Date */
    {
      class: 'DateTime',
      name: 'valueDate',
      documentation: 'Date exchange rate becomes effective.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.fx.ExchangeRateStatus',
      name: 'fxStatus',
      documentation: 'Status of exchange rate.',
      value: 'QUOTED' /*'Quoted'*/
    },
    {
      class: 'String',
      name: 'dealReferenceNumber',
      documentation: 'Reference number associated to exchange rate acceptance.',
      javaFactory: 'return java.util.UUID.randomUUID().toString().replace("-", "");'
    },
    {
      class: 'Long',
      name: 'totalFees',
      documentation: 'Fees associated to exchange rate.'
    },
    {
      class: 'String',
      name: 'totalFeesCurrency',
      documentation: 'Currency type of fees'
    },
    {
      class: 'DateTime',
      name: 'processDate',
      documentation: 'Date exchange rate was processed.'
    },
    {
      class: 'Long',
      name: 'amount',
      documentation: 'Total for the exchange.',
      value: 0
    },
    {
      class: 'String',
      name: 'code',
      documentation: 'Status code associated to exchange rate approval/acceptance.',
      value: '200'
    }
  ]
});
