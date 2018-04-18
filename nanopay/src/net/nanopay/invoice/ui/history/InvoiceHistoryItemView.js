foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.ui.history.InvoiceStatusHistoryItemView'
  ],

  documentation: 'View displaying history for each history object.',
  
  properties: [
    {
      name: 'invoiceStatusHistoryItemView',
      factory: function(){
        return this.InvoiceStatusHistoryItemView.create();
      }
    }
  ],

  methods: [
    function outputRecord(parentView, record) {
      var updates = record.updates;
      for ( var i = 0 ; i < updates.length ; i++ ) {
        var update = updates[i];
        switch ( update.name ) {
          case 'status':
            this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
            break;
        }
      }
    }
  ]
});
