foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'DashboardCurrencyExposure',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'org.chartjs.PieDAOChartView',
    'foam.u2.layout.Cols'
  ],

  css: `
    ^ {
      padding: 32px 16px;
    }

    ^card-header {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^pie-chart {
      padding: 34px; 
    }
  `,

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    },
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'CURRENCY EXPOSURE',
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start().add(this.CARD_HEADER).addClass(this.myClass('card-header')).end()
          .start(this.Cols).style({ 'align-items': 'center', 'justify-content': 'center' })
            .start(this.PieDAOChartView, 
              {
                data: this.data,
                keyExpr: net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure.DENOMINATION,
                valueExpr: net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure.TOTAL,
                height: 300,
                width: 300
              }
            ).addClass(this.myClass('pie-chart')).end()
          .end();
    }
  ]
});
