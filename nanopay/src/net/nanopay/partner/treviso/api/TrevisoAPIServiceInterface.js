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
  name: 'TrevisoAPIServiceInterface',

  documentation: 'Interface to the Treviso Web service',

  methods: [
    {
      name: 'authenticate',
      documentation: 'Login and get token',
      async: true,
      type: 'net.nanopay.partner.treviso.api.LoginResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.treviso.api.LoginRequest'
        }
      ]
    },
    {
      name: 'saveEntity',
      documentation: 'Customer maintenance service',
      async: true,
      type: 'net.nanopay.partner.treviso.api.FepWebResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.treviso.api.SaveEntityRequest'
        }
      ]
    },
    {
      name: 'searchCustomer',
      documentation: 'Search Customer',
      async: true,
      type: 'net.nanopay.partner.treviso.api.SearchCustomerResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.treviso.api.SearchCustomerRequest'
        }
      ]
    },
    {
      name: 'getDocumentTypes',
      documentation: 'Get document types',
      async: true,
      type: 'net.nanopay.partner.treviso.api.GetDocumentTypeResponse',
      args: [
        {
          name: 'request',
          type: 'net.nanopay.partner.treviso.api.GetDocumentTypeRequest'
        }
      ]
    },
    {
      name: 'getLatestPTaxRates',
      type: 'net.nanopay.partner.treviso.api.PTaxDollarRateResponse',
      documentation: 'Get latest PTax rates from Brazil central bank open api: https://olinda.bcb.gov.br/olinda/service/PTAX/version/v1/odata',
      async: true
    },
  ]
});
