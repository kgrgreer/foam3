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
      if(updates.length == 0){
        this.invoiceReceivedHistoryItem.outputRecord(parentView, record);
      }

      for ( var i = 0 ; i < updates.length ; i++ ) {
        var update = updates[i];
        switch ( update.name ) {
          case 'status':
            this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
            break;
          // case 'invoiceFile':
          //   if (updates[0] == update || updates.length == 0) {
          //     this.invoiceReceivedHistoryItem.outputRecord(parentView, record);
          //     break;
          //   }
        }
      }
    }
  ]
});
