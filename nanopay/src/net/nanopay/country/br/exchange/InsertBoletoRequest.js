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
  package: 'net.nanopay.country.br.exchange',
  name: 'InsertBoletoRequest',

  properties: [
    {
      class: 'String',
      name: 'AGENCY',
      shortName: 'AGENCIA',
      documentation: 'Agency Code'
    },
    {
      class: 'String',
      name: 'TPMESA',
      shortName: 'TPMESA',
      documentation: 'Cost Center 1'
    },
    {
      class: 'String',
      name: 'TPMESA2',
      shortName: 'TPMESA2',
      documentation: 'Cost Center 2'
    },
    {
      class: 'String',
      name: 'PORTFOLIO',
      shortName: 'PORTFOLIO',
      documentation: 'Portfolio'
    },
    {
      class: 'String',
      name: 'DATAOP',
      shortName: 'DATAOP',
      documentation: 'DD/MM/AAAA'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.country.br.exchange.OperationType',
      name: 'TIPO',
      value: '03'
    },
    {
      class: 'String',
      name: 'CNPJPCPFCLIENTE',
      shortName: 'CNPJPCPFCLIENTE',
      documentation: 'Customer CPF / CNPJ / Passport Code'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.partner.treviso.api.BoletoStatus',
      name: 'STATUS',
      value: 'R'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.country.br.exchange.SegmentType',
      name: 'SEGMENT'
    },
    {
      class: 'String',
      name: 'GIRO',
      shortName: 'GIRO',
      value: 'N'
    },
    {
      class: 'String',
      name: 'OPLINHA',
      shortName: 'OPLINHA',
      value: 'N'
    },
    {
      class: 'String',
      name: 'LEILAO',
      shortName: 'LEILAO',
      value: 'N'
    },
    {
      class: 'String',
      name: 'PLATBMF',
      shortName: 'PLATBMF',
      value: 'N'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.country.br.exchange.RSISB',
      name: 'RSISB',
      value: 'B'
    },
    {
      class: 'String',
      name: 'CURRENCY',
      shortName: 'MOEDA'
    },
  ]
});
