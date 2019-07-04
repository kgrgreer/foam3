foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'EmptyTransactionListView',
  extends: 'foam.u2.View',

  documentation: 'View for empty transaction list',

  imports: [
    'showHeader'
  ],

  css: `
    ^ {
      width: 320px;
      height: 100%;
      background-color: #ffffff;
      position: relative;
    }
    ^ .no-transactions-label {
      height: 16px;
      font-size: 16px;
      line-height: 1;
      text-align: center;
      color: #252c3d;
      padding-top: 156px;
    }
  `,

  messages: [
    { name: 'noTransactions', message: 'You don’t have any transactions yet.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .addClass('no-transactions-label')
          .add(this.noTransactions)
        .end()
    }
  ]
});