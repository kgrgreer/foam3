/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.exchangerate.model',
  name: 'ExchangeRateQuote',

  properties: [
    {
      class: 'Long',
      name: 'exchangeRateId'
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
      class: 'Long',
      name: 'fromAmount'
    },
    {
      class: 'Long',
      name: 'toAmount'
    },
    {
      class: 'Long',
      name: 'rate'
    },
    {
      class: 'Long',
      name: 'feesAmount'
    },
    {
      class: 'Long',
      name: 'feesPercentage'
    },
    {
      class: 'DateTime',
      name: 'expirationDate'
    }
  ]
});
