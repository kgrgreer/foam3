/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ExchangeRate',

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
    }
  ]
});
