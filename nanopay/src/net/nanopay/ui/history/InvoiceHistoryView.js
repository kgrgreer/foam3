foam.CLASS({
  package: 'net.nanopay.ui.history',
  name: 'InvoiceHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invoices',

  imports: [
    'invoiceHistoryDAO'
  ],

  css: `
    ^ {
      width: 970px;
      margin: auto;
    }
  `,

  properties: [
    'selection',
    {
      name: 'data',
      factory: function () {
        return this.invoiceHistoryDAO;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          data: this.invoiceHistoryDAO,
          historyItemView: net.nanopay.ui.history.InvoiceHistoryItemView.create()
        });
    }
  ]
});
