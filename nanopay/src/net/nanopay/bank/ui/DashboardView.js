foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'DashboardView',
  extends: 'foam.u2.View',

  imports: [
    'currentBalance'
  ],

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
      .tag({ class: 'net.nanopay.ui.BalanceView', data: this.currentBalance })
      .tag({ class: 'net.nanopay.liquidity.ui.BalanceAlertView' });
    }
  ]
});
