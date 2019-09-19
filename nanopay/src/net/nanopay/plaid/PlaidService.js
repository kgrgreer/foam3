foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
    {
      name: 'startIntegration',
      type: 'net.nanopay.plaid.PlaidResponseItem',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'publicToken',
          type: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'exchangeForAccessToken',
      type: 'String',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'publicToken',
          type: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'fetchAccountsDetail',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          type: 'String'
        }
      ]
    },
    {
      name: 'importSelectedAccountToSystem',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          type: 'String'
        },
        {
          name: 'selectedAccount',
          type: 'Map'
        },
        {
          name: 'responseItem',
          type: 'net.nanopay.plaid.PlaidResponseItem'
        }
      ]
    },
    {
      name: "getCredentialForClient",
      type: "net.nanopay.plaid.config.PlaidCredential",
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        },
      ]
    },
    {
      name: 'saveAccount',
      type: 'net.nanopay.plaid.PlaidResponseItem',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'plaidResponseItem',
          type: 'net.nanopay.plaid.PlaidResponseItem'
        }
      ]
    },
  ]
});
