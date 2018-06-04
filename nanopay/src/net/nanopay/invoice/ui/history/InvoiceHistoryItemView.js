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
    'net.nanopay.invoice.ui.history.InvoiceCreatedHistoryItemView',
  ],

  documentation: 'View displaying history for each history object.',
  
  properties: [
    {
      name: 'invoiceStatusHistoryItemView',
      factory: function() {
        return this.InvoiceStatusHistoryItemView.create();
      }
    },
    {
      name: 'invoiceReceivedHistoryItem',
      factory: function() {
        return this.InvoiceReceivedHistoryItemView.create();
      }
    },
    {
      name: 'invoiceCreatedHistoryItem',
      factory: function() {
        return this.InvoiceCreatedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function outputRecord(parentView, record) {
      if ( record.updates.length === 0 ) {
        var user = ctrl.user;
        var currentUser = `${user.firstName}, ${user.lastName}(${user.id})`;
        if ( currentUser === record.user ) {
          this.invoiceCreatedHistoryItem.outputRecord(parentView, record);
        } else {
          this.invoiceReceivedHistoryItem.outputRecord(parentView, record);
        }
      } else if ( record.updates.some(update => update.name === 'status' || update.name === 'paymentDate') ) {
        this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
      }
    }
  ]
});
