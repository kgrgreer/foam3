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
  package: 'net.nanopay.partner.sintegra',
  name: 'Sintegra',

  documentation: 'Interface to the Sintegra API service',

  methods: [
    {
      name: 'getCNPJData',
      type: 'net.nanopay.partner.sintegra.CNPJResponseData',
      documentation: 'Get CNPJ Data from https://www.sintegraws.com.br/api/documentacao-api-receita-federal.php',
      async: true,
      args: [
        {
          name: 'cnpj',
          type: 'String'
        },
        {
          name: 'token',
          type: 'String'
        }
      ]
    },
    {
      name: 'getCPFData',
      type: 'net.nanopay.partner.sintegra.CPFResponseData',
      documentation: 'Get CPF Data from https://www.sintegraws.com.br/api/documentacao-api-receita-federal.php',
      async: true,
      args: [
        {
          name: 'cpf',
          type: 'String'
        },
        {
          name: 'dateOfBirth',
          type: 'String'
        },
        {
          name: 'token',
          type: 'String'
        }
      ]
    },
  ]
});
