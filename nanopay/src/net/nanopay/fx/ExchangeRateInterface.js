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
      name: 'getRateFromSource',
      javaReturns: 'net.nanopay.fx.model.ExchangeRateQuote',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'sourceCurrency',
          javaType: 'String'
        },
        {
          name: 'targetCurrency',
          javaType: 'String'
        },
        {
          name: 'sourceAmount',
          javaType: 'double'
        },
        {
          name: 'valueDate',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'getRateFromTarget',
      javaReturns: 'net.nanopay.fx.model.ExchangeRateQuote',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'sourceCurrency',
          javaType: 'String'
        },
        {
          name: 'targetCurrency',
          javaType: 'String'
        },
        {
          name: 'targetAmount',
          javaType: 'double'
        },
        {
          name: 'valueDate',
          javaType: 'String'//'java.util.Date'
        }
      ]
    },
    {
      name: 'fetchRates',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: []
    },
    {
      name: 'acceptRate',
      javaReturns: 'net.nanopay.fx.interac.model.AcceptRateApiModel',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'endToEndId',
          javaType: 'String'
        },
        {
          name: 'dealRefNum',
          javaType: 'String'
        }
      ]
    }
  ]
});
