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

foam.INTERFACE({
  package: 'net.nanopay.fx',
  name: 'FXService',
  methods:  [
    {
      name: 'getFXRate',
      type: 'net.nanopay.fx.FXQuote',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'sourceCurrency',
          type: 'String'
        },
        {
          name: 'targetCurrency',
          type: 'String'
        },
        {
          name: 'sourceAmount',
          type: 'Long'
        },
        {
          name: 'destinationAmount',
          type: 'Long'
        },
        {
          type: 'String',
          name: 'fxDirection',
        },
        {
          name: 'valueDate',
          type: 'String'// TODO: investigate why java.util.dat can't be used here
        },
        {
          type: 'Long',
          name: 'user'
        },
        {
          type: 'String',
          name: 'fxProvider'
        }
      ]
    },
    {
      name: 'getFXSpotRate',
      type: 'Double',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'sourceCurrency',
          type: 'String'
        },
        {
          name: 'targetCurrency',
          type: 'String'
        },
        {
          type: 'Long',
          name: 'user'
        }
      ]
    },
    {
      name: 'acceptFXRate',
      type: 'Boolean',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'quoteId',
          type: 'String'
        },
        {
          type: 'Long',
          name: 'user'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ProxyFXService',
  implements: [
    'net.nanopay.fx.FXService'
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'net.nanopay.fx.FXService',
      name: 'delegate'
    }
  ]
});
