foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'Dashboard',

  requires: [
    'net.nanopay.liquidity.ui.CurrencyExposureDAO',
  ],

  imports: [
    'accountDAO',
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO'
  ],

  exports: [
    'baseDenomination',
    'conversionService'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'accounts',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
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
      class: 'String',
      name: 'baseDenomination',
      value: 'USD'
    },
    {
      name: 'conversionService',
      hidden: true,
      value: {
        getRate: function(from, to) {
          return Promise.resolve(1);
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'currencyExposureDAO',
      factory: function() {
        return this.CurrencyExposureDAO.create();
      },
      view: function(_, x) {
        return {
          class: 'org.chartjs.PieDAOChartView',
          keyExpr: net.nanopay.liquidity.ui.CurrencyExposure.DENOMINATION,
          valueExpr: net.nanopay.liquidity.ui.CurrencyExposure.TOTAL,
          height: 300,
          width: 300
        };
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
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      documentation: `
        DAO for recent transactions in entire ecosystem
      `,
      expression: function(transactionDAO) {
        return transactionDAO;
      }
    }
  ]
});
