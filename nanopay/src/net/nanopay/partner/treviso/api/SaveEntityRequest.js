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
  name: 'SaveEntityRequest',

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
      name: 'fntsyNm',
      shortName: 'fntsy_nm',
      value: 'FEPWEB',
      documentation: 'Customer name'
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
      name: 'ie',
      shortName: 'ie',
      documentation: 'State registration of the company and / or institution'
    },
    {
      class: 'String',
      name: 'im',
      shortName: 'im',
      documentation: 'Municipal registration of the company and / or institution'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.Segment',
      name: 'segment',
      shortName: 'segment',
      documentation: 'Type of customer / participant'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.ResponsibleArea',
      name: 'responsibleArea',
      shortName: 'responsibleArea',
      documentation: 'Responsible area associated with the client'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.EconomicGroup',
      name: 'economicGroup',
      shortName: 'economicGroup',
      documentation: 'Economic group associated with the customer'
    },
    {
      class: 'String',
      name: 'xpirtnDt',
      shortName: 'xpirtn_dt',
      documentation: 'Customer expiration date'
    },
    {
      class: 'String',
      name: 'brthDt',
      shortName: 'brth_dt',
      documentation: 'Customer birthday'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.treviso.api.BusinessUnit',
      name: 'businessUnit',
      shortName: 'businessUnit',
      documentation: 'Business unit associated with the customer'
    },
    {
      class: 'String',
      name: 'status',
      value: 'A',
      documentation: 'A = Active, I = Inactive, B = Blocked'
    },
    {
      class: 'Int',
      name: 'flagDgtlSign',
      shortName: 'flag_dgtl_sign',
      documentation: 'Digital signature membership flag'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.partner.treviso.api.Document',
      name: 'documents',
      shortName: 'documents',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.partner.treviso.api.Address',
      name: 'addresses',
      shortName: 'addresses',
    }
  ]
});
