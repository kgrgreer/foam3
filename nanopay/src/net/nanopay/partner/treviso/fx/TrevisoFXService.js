/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

foam.CLASS({
  package: 'net.nanopay.partner.treviso.fx',
  name: 'TrevisoFXService',
  implements: 'net.nanopay.fx.FXService',

  documentation: 'Treviso service for fetching the fx rate from treviso',

  javaImports: [
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.util.SafetyUtil',
    'foam.core.Detachable',
    'net.nanopay.fx.FXQuote'
  ],

  properties: [
    {
      name: 'login',
      class: 'String',
      documentation: 'api log in keys'
    },
    {
      name: 'password',
      class: 'String',
      documentation: 'api password'
    },
    {
      name: 'currencies',
      class: 'StringArray',
      documentation: 'supported currencies'
    }
  ],

  methods: [
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
      ],
      documentation: 'Not supported in the treviso fx service',
      javaCode: `
        // not supported.
        return null;
      `
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
      ],
      documentation: 'Not supported in the treviso fx service',
      javaCode: `
        // not supported.
        return null;
      `
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
      ],
      documentation: 'Returns the BRL -> USD rate from treviso',
      javaCode: `
        if ( ! SafetyUtil.equals("BRL", sourceCurrency) ) {
          throw new RuntimeException("We only support BRL source currency.");
        }
        if ( ! Arrays.asList(getCurrencies()).contains(targetCurrency) ) {
          throw new RuntimeException(targetCurrency+" is not a supported target currency");
        }

        Double rate = 0.5d;

        // api call goes here.



        return rate;
      `
    }
  ]
});
