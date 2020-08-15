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
  package: 'net.nanopay.partner.sintegra',
  name: 'CNPJResponseData',

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'dataSituacao',
      shortName: 'data_situacao'
    },
    {
      class: 'String',
      name: 'complemento',
    },
    {
      class: 'String',
      name: 'nome'
    },
    {
      class: 'String',
      name: 'uf'
    },
    {
      class: 'String',
      name: 'telefone'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'situacao'
    },
    {
      class: 'String',
      name: 'bairro'
    },
    {
      class: 'String',
      name: 'logradouro'
    },
    {
      class: 'String',
      name: 'numero'
    },
    {
      class: 'String',
      name: 'cep',
    },
    {
      class: 'String',
      name: 'municipio'
    },
    {
      class: 'String',
      name: 'abertura'
    },
    {
      class: 'String',
      name: 'naturezaJuridica',
      shortName: 'natureza_juridica'
    },
    {
      class: 'String',
      name: 'cnpj'
    },
    {
      class: 'String',
      name: 'ultimaAtualizacao',
      shortName: 'ultima_atualizacao'
    },
    {
      class: 'String',
      name: 'efr'
    },
    {
      class: 'String',
      name: 'capitalSocial',
      shortName: 'capital_social'
    },
    {
      class: 'String',
      name: 'porte'
    },
    {
      class: 'String',
      name: 'version'
    },
  ]
});
