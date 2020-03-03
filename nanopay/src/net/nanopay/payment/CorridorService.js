/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.payment',
  name: 'CorridorService',

  methods: [
    {
      name: 'getCorridor',
      type: 'net.nanopay.fx.Corridor',
      documentation: 'Returns a corridor',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'sourceCountry',
          documentation: 'Source Country'
        },
        {
          type: 'String',
          name: 'targetCountry',
          documentation: 'Target Country'
        }
      ]
    },
    {
      name: 'getProviderCorridor',
      type: 'net.nanopay.payment.PaymentProviderCorridorJunction',
      documentation: 'Returns a corridor supported by a Payment Provider',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'Long',
          name: 'providerId',
          documentation: 'Payment Provider ID'
        },
        {
          type: 'String',
          name: 'sourceCountry',
          documentation: 'Source Country'
        },
        {
          type: 'String',
          name: 'targetCountry',
          documentation: 'Target Country'
        }
      ]
    },
    {
      name: 'isSupportedCurrencyPair',
      type: 'Boolean',
      documentation: 'Returns true if there is any Provider that can handle the currency pair.',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'sourceCountry',
          documentation: 'Source Country'
        },
        {
          type: 'String',
          name: 'targetCountry',
          documentation: 'Target Country'
        },
        {
          type: 'String',
          name: 'sourceCurrency',
          documentation: 'Source Currency'
        },
        {
          type: 'String',
          name: 'targetCurrency',
          documentation: 'Target Currency'
        }
      ]
    },
    {
      name: 'canProcessCurrencyPair',
      type: 'Boolean',
      documentation: 'Returns true if a provider can process corridor and currrency pair',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'Long',
          name: 'providerId',
          documentation: 'Payment Provider ID'
        },
        {
          type: 'String',
          name: 'sourceCountry',
          documentation: 'Source Country'
        },
        {
          type: 'String',
          name: 'targetCountry',
          documentation: 'Target Country'
        },
        {
          type: 'String',
          name: 'sourceCurrency',
          documentation: 'Source Currency'
        },
        {
          type: 'String',
          name: 'targetCurrency',
          documentation: 'Target Currency'
        }
      ]
    },
  ]
});
