foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.ui.history.InvoiceStatusHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
  ],

  documentation: 'View displaying history for each history object.',
  
  properties: [
    {
      name: 'invoiceStatusHistoryItemView',
      factory: function(){
        return this.InvoiceStatusHistoryItemView.create();
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
    function outputRecord(parentView, record) {
      var updates = record.updates;
      if ( updates.length === 0 ) {
        this.invoiceReceivedHistoryItem.outputRecord(parentView, record);
      } else if ( updates.some(update => update.name === 'status' || update.name === 'paymentDate') ) {
        this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
      }
    }
  ]
});
