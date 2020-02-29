foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TransactionLimitView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business transaction limit information.
  `,

  imports: [
    'user'
  ],

  css: `
    ^ {
      padding: 24px;
    }
    ^ .info-container {
      width: 25%;
      display: inline-grid;
      height: 40px;
      margin-top: 30px;
    }
    ^ .table-content {
      height: 21px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Transaction limits' },
    { name: 'LIMIT_LABEL', message: 'Limit amount' },
    { name: 'TRANSACTION_LIMIT', message: '$100,000.00' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass()).addClass('card')
        .start().addClass('sub-heading').add(this.TITLE).end()
        // TODO: Edit Business
        .start().addClass('info-container')
          .start().addClass('table-content').add(this.LIMIT_LABEL).end()
          .start().addClass('table-content').addClass('subdued-text').add(this.TRANSACTION_LIMIT).end()
        .end();
    }
  ]
});
