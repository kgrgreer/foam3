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
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.payment',
  name: 'CorridorService',

  methods: [
    {
      name: 'getProviderCorridor',
      async: true,
      type: 'net.nanopay.payment.PaymentProviderCorridor',
      documentation: 'Returns a corridor supported by a Payment Provider',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
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
      async: true,
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
      async: true,
      documentation: 'Returns true if a provider can process corridor and currrency pair',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
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
    {
      name: 'getQuoteCorridorPaymentProviders',
      javaType: 'java.util.List',
      documentation: 'Returns List of Corridor Payment Provider Corridors that can handle the corridor and currency pairs.',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'net.nanopay.tx.TransactionQuote',
          name: 'transactionQuote',
        }
      ]
    },
    {
      name: 'getCorridorPaymentProviders',
      javaType: 'java.util.List',
      documentation: 'Returns List of Corridor Payment Provider Junctions that can handle the corridor and currency pairs.',
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
      name: 'getAllWithSrc',
      javaType: 'java.util.List',
      documentation: 'Returns List of Corridor Payment Provider Corridors that have a source currency as sourceCurrency.',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'sourceCurrency',
        }
      ]
    },
    {
      name: 'getAllWithTarget',
      javaType: 'java.util.List',
      documentation: 'Returns List of Corridor Payment Provider Corridors that have a target currency as targetCurrency.',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'targetCurrency',
        }
      ]
    },
    {
      name: 'getAllWithSrcForProvider',
      javaType: 'java.util.List',
      documentation: 'Returns List of Corridor Payment Provider Corridors that have a source currency as sourceCurrency.',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'String',
          name: 'sourceCurrency',
        },
        {
          type: 'String',
          name: 'provider'
        }
      ]
    },
  ]
});
