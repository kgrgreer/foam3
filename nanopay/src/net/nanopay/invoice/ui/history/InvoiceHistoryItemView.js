foam.CLASS({
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
  ],

  documentation: 'View displaying history for each history object.',

  methods: [
    function outputRecord(parentView, record) {
      var updates = record.updates;
      // if no updates then this is a new account, so show the status page
      // if ( ! updates || updates.length === 0 ) {
      //   return this.invitationStatusHistoryItem.outputRecord(parentView, record);
      // }

      // for ( var i = 0 ; i < updates.length ; i++ ) {
      //   var update = updates[i];
      //   switch ( update.name ) {
      //     case 'inviteAttempts':
      //       this.inviteAttemptsHistoryItem.outputRecord(parentView, record);
      //       break;

      //     case 'status':
      //       this.invitationStatusHistoryItem.outputRecord(parentView, record);
      //       break;

      //     case 'compliance':
      //       this.complianceStatusHistoryItem.outputRecord(parentView, record);
      //       break;

      //     case 'additionalDocuments':
      //       this.documentStatusHistoryItem.outputRecord(parentView, record);
      //       break;
      //   }
      // }
    }
  ]
});
