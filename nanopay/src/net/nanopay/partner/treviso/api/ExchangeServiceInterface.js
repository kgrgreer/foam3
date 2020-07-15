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
  package: 'net.nanopay.partner.treviso.api',
  name: 'ExchangeServiceInterface',

  documentation: 'Interface to the Brazil Exchange',

  methods: [
    {
      name: 'insertBoleto',
      documentation: 'Insert Boleto',
      async: true,
      type: 'net.nanopay.partner.treviso.api.InsertBoletoResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.InsertBoleto',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchBoleto',
      documentation: 'Search Boleto',
      async: true,
      type: 'net.nanopay.partner.treviso.api.SearchBoletoResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.SearchBoleto',
          name: 'request',
        }
      ]
    },
    {
      name: 'insertTitular',
      documentation: 'Insert Titular',
      async: true,
      type: 'net.nanopay.partner.treviso.api.InsertTitularResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.InsertTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'updateTitular',
      documentation: 'Update Titular',
      async: true,
      type: 'net.nanopay.partner.treviso.api.UpdateTitularResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.UpdateTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchTitular',
      documentation: 'Search Titular',
      async: true,
      type: 'net.nanopay.partner.treviso.api.SearchTitularResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.SearchTitular',
          name: 'request',
        }
      ]
    },
    {
      name: 'searchNatureza',
      documentation: 'Search Natureza',
      async: true,
      type: 'net.nanopay.partner.treviso.api.SearchNaturezaResponse',
      args: [
        {
          type: 'net.nanopay.partner.treviso.api.SearchNatureza',
          name: 'request',
        }
      ]
    },
  ]
});
