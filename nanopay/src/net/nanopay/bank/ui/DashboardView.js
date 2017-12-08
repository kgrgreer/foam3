foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'DashboardView',
  extends: 'foam.u2.View',

  documentation: 'View displaying high-level Bank Liquidity Values',

  css: `
    ^ {
      width: 992px;
      margin: auto;
    }
  `,

  methods: [
    function initE(){
      this.SUPER()

      this
      .addClass(this.myClass())
      .tag({ class: 'net.nanopay.ui.BalanceView' })
      .tag({ class: 'net.nanopay.bank.ui.BalanceAlertView'});
    }
  ]
});