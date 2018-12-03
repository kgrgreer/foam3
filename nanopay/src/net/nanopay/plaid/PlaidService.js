foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
    {
      name: 'startIntegration',
      documentation: '',
      javaReturns: 'net.nanopay.plaid.model.PlaidError',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'publicToken',
          javaType: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'exchangeForAccessToken',
      documentation: '',
      javaReturns: 'String',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'publicToken',
          javaType: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'fetchAccountsDetail',
      documentation: '',
      javaReturns: 'Boolean',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          javaType: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'importSelectedAccountToSystem',
      documentation: '',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          javaType: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          javaType: 'String'
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
          javaType: 'Long'
        },
      ]
    }
  ]
});
