foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'Dashboard',

  imports: [
    'accountDAO',
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
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
      name: 'accountBalanceCandlestickDAO',
      documentation: `
        DAO for all account balance over time in the ecosystem.
      `,
      expression: function(accountBalancesOverTime) {
        return accountBalancesOverTime;
      },
      view: {
        class: 'org.chartjs.CandlestickDAOChartView',
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'liquidityCandlestickDAO',
      documentation: `
        DAO for liquidity candlesticks
      `,
      expression: function(liquidityThresholdWeeklyCandlestickDAO) {
        return liquidityThresholdWeeklyCandlestickDAO;
      },
      view: {
        class: 'org.chartjs.CandlestickDAOChartView',
      }
    },
    {
      name: 'cicoCandlestickDAO',
      documentation: `
        TODO: DAO for CICO candlesticks to and from shadow accounts
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
