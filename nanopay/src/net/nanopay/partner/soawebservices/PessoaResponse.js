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
  package: 'net.nanopay.partner.soawebservices',
  name: 'PessoaResponse',

  properties: [
    {
      class: 'String',
      name: 'Documento'
    },
    {
      class: 'String',
      name: 'Nome'
    },
    {
      class: 'String',
      name: 'RazaoSocial'
    },
    {
      class: 'String',
      name: 'Mensagem'
    },
    {
      class: 'String',
      name: 'AnoObito'
    },
    {
      class: 'String',
      name: 'SituacaoRFB'
    },
    {
      class: 'String',
      name: 'MensagemObito'
    },
    {
      class: 'Boolean',
      name: 'Status'
    },
    {
      class: 'String',
      name: 'responseString'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.partner.soawebservices.Transacao',
      name: 'Transacao'
    }
  ]
});
