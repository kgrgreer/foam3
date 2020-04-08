foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',
  documentation: 'View displaying history for each history object.',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.ui.history.InvoiceStatusHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceCreatedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceApprovedHistoryItemView',
  ],

  imports: [
    'user'
  ],

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
      const currentUser = this.user.id;
      const recordUser = this.getId(record.user);
      const isFirstHistoryEvent = record.updates.length === 0;
      const updatesContainRelevantChange = record.updates.some((update) => {
        if ( update.name === 'status' ) {
          return update.oldValue.name !== 'DRAFT';
        }
        return update.name === 'paymentDate';
      });
      const updatesContainApprovalChange = record.updates.some((update) => {
        return update.name === 'approvedBy';
      });

      if ( isFirstHistoryEvent ) {
        if ( currentUser === recordUser ) {
          this.invoiceCreatedHistoryItemView.outputRecord(parentView, record);
        } else {
          this.invoiceReceivedHistoryItemView.outputRecord(parentView, record);
        }
      } else if ( updatesContainRelevantChange ) {
        this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
        if ( updatesContainApprovalChange && currentUser === recordUser ) {
          this.invoiceApprovedHistoryItemView.outputRecord(parentView, record);
        }
      }
    },

    /* a function that extracts id from a formatted user string */
    function getId(formattedUser) {
      // a string has a format 'lastName, firstName(id)'
      const start = formattedUser.lastIndexOf('(') + 1;
      const end = formattedUser.lastIndexOf(')');
      const id = parseInt(formattedUser.slice(start, end));
      return id;
    }
  ]
});
