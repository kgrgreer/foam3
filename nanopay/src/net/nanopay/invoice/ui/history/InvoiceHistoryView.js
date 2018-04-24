foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invoice actions',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.history.HistoryRecord',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceHistoryItemView'
  ],

  imports: [
    'invoiceHistoryDAO'
  ],

  css: `
    ^ {
      margin-top: 20px;
    }
  `,

  properties: [
    'id',
    {
      name: 'data',
      expression: function (id) {
        return this.invoiceHistoryDAO
          .where(this.EQ(this.HistoryRecord.OBJECT_ID, this.id))
          .orderBy(this.HistoryRecord.TIMESTAMP);
      }
    },
    {
      name: 'invoiceReceivedHistoryItem',
      factory: function(){
        return this.InvoiceReceivedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          title: 'Invoice History',
          data: this.data,
          historyItemView: this.InvoiceHistoryItemView.create()
        });
    }
  ]
});
