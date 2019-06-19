foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'DashboardCurrencyExposure',
  extends: 'foam.u2.View',

  requires: [
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder'
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
            .start(this.DAOBrowserView, { data: this.data }).end()
          .end();
    }
  ]
});
