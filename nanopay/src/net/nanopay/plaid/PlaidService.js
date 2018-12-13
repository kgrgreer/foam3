foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
    {
      name: 'startIntegration',
      javaReturns: 'net.nanopay.plaid.model.PlaidError',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'publicToken',
          class: 'FObjectProperty',
          of: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'exchangeForAccessToken',
      javaReturns: 'String',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'publicToken',
          class: 'FObjectProperty',
          of: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'fetchAccountsDetail',
      javaReturns: 'Boolean',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          class: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          class: 'String'
        }
      ]
    },
    {
      name: 'importSelectedAccountToSystem',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          class: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          class: 'String'
        },
        {
          name: 'selectedAccount',
          javaType: 'java.util.Map'
        }
      ]
    },
    {
      name: "getCredentialForClient",
      javaReturns: "net.nanopay.plaid.config.PlaidCredential",
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          class: 'Long'
        },
      ]
    }
  ]
});
