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
      class: 'Double',
      name: 'fromAmount'
    },
    {
      class: 'Double',
      name: 'toAmount'
    },
    {
      class: 'Double',
      name: 'rate'
    },
    {
      class: 'Double',
      name: 'feesAmount'
    },
    {
      class: 'Double',
      name: 'feesPercentage'
    },
    {
      class: 'DateTime',
      name: 'expirationDate'
    }
  ]
});
