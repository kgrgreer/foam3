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
  name: 'CPFResponseData',

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
      name: 'cpf'
    },
    {
      class: 'String',
      name: 'nome',
    },
    {
      class: 'String',
      name: 'dataNascimento',
      shortName: 'data_nascimento'
    },
    {
      class: 'String',
      name: 'comprovante'
    },
    {
      class: 'String',
      name: 'situacaoCadastral',
      shortName: 'situacao_cadastral'
    },
    {
      class: 'String',
      name: 'dataInscricao',
      shortName: 'data_inscricao'
    },
    {
      class: 'String',
      name: 'podigitoVerificadorrte',
      shortName: 'podigito_verificadorrte'
    },
    {
      class: 'String',
      name: 'version'
    }
  ]
});
