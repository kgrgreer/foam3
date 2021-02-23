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
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ExchangeRate',

  documentation: 'Exchange rate information pertaining to two currencies',

  javaImports: [
      'net.nanopay.fx.FXProvider',
      'java.util.Date'
  ],

  tableColumns: [
    'fromCurrency.name',
    'toCurrency.name',
    'rate',
    'expirationDate'
  ],

  ids: [ 'fromCurrency', 'toCurrency', 'fxProvider' ],

  searchColumns: [
    'expirationDate',
    'fromCurrency',
    'fxProvider',
    'id',
    'rate',
    'toCurrency'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'fromCurrency',
      documentation: 'Originating currency of the payment/request.'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'toCurrency',
      documentation: 'Target currency of the payment/request.'
    },
    {
      class: 'Double',
      name: 'rate',
      documentation: 'Percentage rate/difference between currency values.'
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
    /* Interac*/
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
      value: 'QUOTED' /* 'Quoted'*/
    },
    {
      class: 'String',
      name: 'dealReferenceNumber',
      documentation: 'Reference number associated to exchange rate acceptance.',
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
      class: 'Reference',
      of: 'net.nanopay.fx.FXProvider',
      name: 'fxProvider',
      documentation: 'Exchange Rate Provider',
      targetDAOKey: 'fxProviderDAO',
    },
    {
      class: 'Long',
      name: 'limit',
      documentation: 'FX Provider Limit.'
    },
    {
      class: 'String',
      name: 'code',
      documentation: 'Status code associated to exchange rate approval/acceptance.',
      value: '200'
    }
  ]
});
