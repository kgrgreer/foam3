/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts',
    'net.nanopay.liquidity.ui.dashboard.AggregatedLiquidityChartView'
  ],

  imports: [
    'accountDAO',
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO'
  ],

  css: `
    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
    }
  `,

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
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start().add(this.cls_.name).addClass(this.myClass('header')).end()
          .start(this.DashboardAccounts, { data: this.accounts }).addClass().end()
          .start(this.AggregatedLiquidityChartView).addClass().end();
    }
  ]
});
