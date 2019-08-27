foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard',
  name: 'Dashboard',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.layout.Card',
    'foam.u2.layout.Grid',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.comics.v2.DAOBrowserView',
    'net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts',
    'net.nanopay.liquidity.ui.dashboard.cicoShadow.DashboardCicoShadow',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposureDAO',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.DashboardCurrencyExposure',
    'net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity',
    'net.nanopay.liquidity.ui.dashboard.recentTransactions.DashboardRecentTransactions',
  ],

  imports: [
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO'
  ],

  css: `
    ^header-container {
      padding: 32px 32px 0px 32px;
    }

    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
    }

    ^last-updated {
      margin-left: 24px;
    }

    ^dashboard-container {
      grid-column-gap: 16px;
      grid-row-gap: 32px;
      padding: 32px;
    }

    ^ .foam-u2-ActionView-refresh span {
      vertical-align: middle;
    }
  `,

  properties: [
    {
      class: 'DateTime',
      name: 'lastUpdated',
      factory: function() {
        return new Date();
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'currencyExposureDAO',
      expression: function(lastUpdated) {
        return this.CurrencyExposureDAO.create();
      },
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
  ],

  messages: [
    {
      name: 'UPDATED',
      message: 'Last updated at',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start(this.Cols).addClass(this.myClass('header-container'))
            .start(this.Cols).style({'align-items': 'baseline'})
              .start().add(this.cls_.name).addClass(this.myClass('header')).end()
              .start()
                .add(this.lastUpdated$.map(v => `${this.UPDATED}: ${v.toLocaleString()}`))
                .addClass(this.myClass('last-updated'))
              .end()
            .end()
            .startContext({data: this})
              .tag(this.REFRESH, { icon: 'images/refresh-icon.svg' })
            .endContext()
          .end()
          .tag(this.lastUpdated$.map(_ => {
            return this.Grid.create()
              .addClass(this.myClass('dashboard-container'))
              .start(this.Card, { columns: 7 }).addClass(this.myClass('accounts'))
                .tag(this.DashboardAccounts, { 
                  currency: this.currencyExposureDAO$proxy
                })
              .end()
              .start(this.Card, { columns: 5 }).addClass(this.myClass('liquidity'))
                .tag(this.DashboardLiquidity)
              .end()
              .start(this.Card, { columns: 3 }).addClass(this.myClass('currency-exposure'))
                .tag(this.DashboardCurrencyExposure, { data: this.currencyExposureDAO$proxy })
              .end()
              .start(this.Card, { columns: 9 })
                .tag(this.DashboardCicoShadow)
              .end()
              .start(this.Card, { columns: 12 }).addClass(this.myClass('recent-transactions'))
                .tag(this.DashboardRecentTransactions, { data: this.recentTransactionsDAO })
              .end()
          }))
    }
  ],
  actions: [
    {
      name: 'refresh',
      code: function() {
        this.lastUpdated = undefined;
      }
    },
  ]
});
