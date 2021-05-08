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
        },
        {
          type: 'String',
          name: 'spid'
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
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    },
    {
      name: 'getBoletoStatus',
      documentation: 'Get Boleto Status',
      async: true,
      type: 'net.nanopay.country.br.exchange.BoletoStatusResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.GetBoletoStatus',
          name: 'request',
        },
        {
          type: 'String',
          name: 'spid'
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
        },
        {
          type: 'String',
          name: 'spid'
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
        },
        {
          type: 'String',
          name: 'spid'
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
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    },
    {
      name: 'searchTitularCapFin',
      documentation: 'Search Titular',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchTitularCapFinResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchTitularCapFin',
          name: 'request',
        },
        {
          type: 'String',
          name: 'spid'
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
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    },
    {
      name: 'searchMoeda',
      documentation: 'Search Moeda',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchMoedaResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchMoeda',
          name: 'request',
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    },
    {
      name: 'searchPais',
      documentation: 'Search Pais',
      async: true,
      type: 'net.nanopay.country.br.exchange.SearchPaisResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.SearchPais',
          name: 'request',
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    },
    {
      name: 'cotacaoTaxaCambio',
      documentation: 'Get CotacaoTaxaCambio',
      async: true,
      type: 'net.nanopay.country.br.exchange.CotacaoTaxaCambioResponse',
      args: [
        {
          type: 'net.nanopay.country.br.exchange.GetCotacaoTaxaCambio',
          name: 'request',
        },
        {
          type: 'String',
          name: 'spid'
        }
      ]
    }
  ]
});
