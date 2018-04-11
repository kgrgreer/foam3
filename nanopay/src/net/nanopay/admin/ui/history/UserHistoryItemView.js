foam.CLASS({
  package: 'net.nanopay.admin.ui.history',
  name: 'UserHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.admin.ui.history.AccountStatusHistoryItemView',
    'net.nanopay.admin.ui.history.ComplianceStatusHistoryItemView',
    'net.nanopay.admin.ui.history.DocumentStatusHistoryItemView',
    'net.nanopay.admin.ui.history.InviteAttemptsHistoryItemView'
  ],

  documentation: 'View displaying history for invitation item',

  properties: [
    {
      name: 'inviteAttemptsHistoryItem',
      factory: function () {
        return this.InviteAttemptsHistoryItemView.create();
      }
    },
    {
      name: 'invitationStatusHistoryItem',
      factory: function () {
        return this.AccountStatusHistoryItemView.create();
      }
    },
    {
      name: 'complianceStatusHistoryItem',
      factory: function () {
        return this.ComplianceStatusHistoryItemView.create();
      }
    },
    {
      name: 'documentStatusHistoryItem',
      factory: function () {
        return this.DocumentStatusHistoryItemView.create();
      }
    }
  ],

  methods: [
    function outputRecord(parentView, record) {
      var updates = record.updates;
      // if no updates then this is a new account, so show the status page
      if ( ! updates || updates.length === 0 ) {
        return this.invitationStatusHistoryItem.outputRecord(parentView, record);
      }

      for ( var i = 0 ; i < updates.length ; i++ ) {
        var update = updates[i];
        switch ( update.name ) {
          case 'inviteAttempts':
            this.inviteAttemptsHistoryItem.outputRecord(parentView, record);
            break;

          case 'status':
            this.invitationStatusHistoryItem.outputRecord(parentView, record);
            break;

          case 'compliance':
            this.complianceStatusHistoryItem.outputRecord(parentView, record);
            break;

          case 'additionalDocuments':
            this.documentStatusHistoryItem.outputRecord(parentView, record);
            break;
        }
      }
    }
  ]
});
