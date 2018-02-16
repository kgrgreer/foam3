/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.fx',
  name: 'ExchangeRateInterface',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'getRate',
      javaReturns: 'net.nanopay.fx.model.ExchangeRateQuote',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'from',
          javaType: 'String'
        },
        {
          name: 'to',
          javaType: 'String'
        },
        {
          name: 'amountI',
          javaType: 'long'
        }
      ]
    },
    // void bookRate(quoteId)
    {
      name: 'fetchRates',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: []
    }
  ]
});
