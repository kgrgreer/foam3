foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'DashboardCurrencyExposure',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder',
    'org.chartjs.PieDAOChartView'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start(this.CardBorder)
            .start(this.PieDAOChartView, 
              {
                data: this.data,
                keyExpr: net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure.DENOMINATION,
                valueExpr: net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposure.TOTAL,
                height: 300,
                width: 300
              }
            ).end()
          .end();
    }
  ]
});
