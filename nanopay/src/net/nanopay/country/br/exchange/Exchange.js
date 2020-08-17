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
  package: 'net.nanopay.country.br.exchange',
  name: 'Exchange',

  documentation: 'Interface to the Brazil Exchange',

  methods: [
    {
      name: 'insertBoleto',
      documentation: 'Insert Boleto',
      async: true,
      type: 'net.nanopay.country.br.exchange.InsertBoletoResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.InsertBoleto',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchBoleto',
      documentation: 'Search Boleto',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchBoletoResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchBoleto',
          name: 'request',
        }
      ]
    },
    {
      name: 'insertTitular',
      documentation: 'Insert Titular',
      async: true,
      type: 'net.nanopay.country.br.exchange.InsertTitularResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.InsertTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'updateTitular',
      documentation: 'Update Titular',
      async: true,
      type: 'net.nanopay.country.br.exchange.UpdateTitularResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.UpdateTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchTitular',
      documentation: 'Search Titular',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchTitularResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchNatureza',
      documentation: 'Search Natureza',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchNaturezaResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchNatureza',
          name: 'request',
        }
      ]
    },
  ]
});
