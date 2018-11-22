foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
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
      javaReturns: 'String',
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
      javaReturns: 'String',
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
    }
  ]
});
