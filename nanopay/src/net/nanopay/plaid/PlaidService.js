foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
    {
      name: 'startIntegration',
      returns: 'net.nanopay.plaid.model.PlaidError',
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
      returns: 'String',
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
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        },
      ]
    }
  ]
});
