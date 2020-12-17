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
foam.CLASS({
  package: 'net.nanopay.partner.treviso.api',
  name: 'SearchCustomerRequest',

  properties: [
    {
      class: 'Long',
      name: 'extCode',
      shortName: 'extCode',
      documentation: 'External customer code'
    },
    {
      class: 'String',
      name: 'socialName',
      shortName: 'socialName',
      documentation: 'Clients social name'
    },
    {
      class: 'String',
      name: 'personType',
      shortName: 'personType',
      value: 'J',
      documentation: 'Type of person of the company and / or institution. P = Individual. J = Legal Entity'
    },
    {
      class: 'String',
      name: 'cnpjCpf',
      shortName: 'cnpj_cpf',
      documentation: 'Customer CPF or CNPJ'
    },
    {
      class: 'String',
      name: 'creatnDt1',
      shortName: 'creatn_dt1',
      documentation: 'range of dates to which you want to look for a customer'
    },
    {
      class: 'String',
      name: 'creatnDt2',
      shortName: 'creatn_dt2',
      documentation: 'range of dates to which you want to look for a customer'
    },
    {
      class: 'String',
      name: 'lastUpdtDt1',
      shortName: 'last_updt_dt1',
      documentation: 'range of dates to which you want to search for a customer'
    },
    {
      class: 'String',
      name: 'lastUpdtDt2',
      shortName: 'last_updt_dt2',
      documentation: 'range of dates to which you want to search for a customer'
    },
    {
      class: 'String',
      name: 'setFirstResult',
    }
  ]
});
