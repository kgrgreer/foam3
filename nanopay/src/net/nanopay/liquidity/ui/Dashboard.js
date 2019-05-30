foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'Dashboard',

  imports: [
    'accountDAO',
    'transactionDAO'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'accounts',
      documentation: `
        DAO for all accounts in the ecosystem.
      `,
      expression: function(accountDAO) {
        return accountDAO;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'liquidityCandlestickDAO',
      documentation: `
        DAO for liquidity candlesticks
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'cicoCandlestickDAO',
      documentation: `
        DAO for CICO candlesticks to and from shadow accounts
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'recentTransactionsDAO',
      documentation: `
        DAO for recent transactions in entire ecosystem
      `,
      expression: function(transactionDAO) {
        return transactionDAO;
      }
    }
  ]
});
