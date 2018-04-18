foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'InvoiceHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invoice actions',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.dao.history.HistoryRecord',
  ],

  imports: [
    'invoiceHistoryDAO'
  ],

  properties: [
    'id',
    {
      name: 'data',
      expression: function (id) {
        return this.invoiceHistoryDAO
          .where(this.EQ(this.HistoryRecord.OBJECT_ID, this.id))
          .orderBy(this.HistoryRecord.TIMESTAMP);
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
          // data: this.data,
          // historyItemView: this.UserHistoryItemView.create()
        });
    }
  ]
});
