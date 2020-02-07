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
    'net.nanopay.invoice.ui.history.InvoiceApprovedHistoryItemView',
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
      name: 'invoiceReceivedHistoryItemView',
      factory: function() {
        return this.InvoiceReceivedHistoryItemView.create();
      }
    },
    {
      name: 'invoiceCreatedHistoryItemView',
      factory: function() {
        return this.InvoiceCreatedHistoryItemView.create();
      }
    },
    {
      name: 'invoiceApprovedHistoryItemView',
      factory: function() {
        return this.InvoiceApprovedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function outputRecord(parentView, record) {
      const isFirstHistoryEvent = record.updates.length === 0;
      const updatesContainRelevantChange = record.updates.some((update) => {
        return update.name === 'status' || update.name === 'paymentDate';
      });
      const updatesContainApprovalChange = record.updates.some((update) => {
        return update.name === 'approvedBy';
      });
      if ( isFirstHistoryEvent ) {
        var user = ctrl.user;
        var currentUser = `${user.lastName}, ${user.firstName}(${user.id})`;
        if ( currentUser === record.user ) {
          this.invoiceCreatedHistoryItemView.outputRecord(parentView, record);
        } else {
          this.invoiceReceivedHistoryItemView.outputRecord(parentView, record);
        }
      } else if ( updatesContainRelevantChange ) {
        this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
        if ( updatesContainApprovalChange ) {
          this.invoiceApprovedHistoryItemView.outputRecord(parentView, record);
        }
      }
    }
  ]
});
