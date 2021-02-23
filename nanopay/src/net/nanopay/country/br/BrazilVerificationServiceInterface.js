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
  package: 'net.nanopay.country.br',
  name: 'BrazilVerificationServiceInterface',

  methods: [
    {
      name: 'validateCnpj',
      type: 'Boolean',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cnpj'
        },
      ]
    },
    {
      name: 'validateUserCpf',
      type: 'Boolean',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cpf'
        },
        {
          type: 'long',
          name: 'userId'
        }
      ]
    },
    {
      name: 'validateCpf',
      type: 'Boolean',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cpf'
        },
        {
          type: 'Date',
          name: 'birthDate'
        }
      ]
    },
    {
      name: 'getCPFName',
      type: 'String',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cpf'
        },
        {
          type: 'long',
          name: 'userId'
        }
      ]
    },
    {
      name: 'getCPFNameWithBirthDate',
      type: 'String',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cpf'
        },
        {
          type: 'Date',
          name: 'birthDate'
        }
      ]
    },
    {
      name: 'getCNPJName',
      type: 'String',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'String',
          name: 'cnpj'
        }
      ]
    }
  ]
});
