foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'TransactionFeesTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.view.ScrollTableView'
  ],

  imports: [
    'stack'
  ],

  css: `
    ^ .foam-u2-view-TableView-selected {
      background: rgba(89, 165, 213, 0.3) !important;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .start().addClass(this.myClass())
          .start({
            class: 'foam.u2.view.ScrollTableView',
            columns: [
              'id', 'name', 'transactionName', 'transactionType', 'sourcePaysFees', 'denomination', 'serviceType'
            ],
            data$: this.data$
          }).end()
        .end();
    }
  ]
});
