foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invite.ui.ComplianceStatusHistoryItemView',
    'net.nanopay.invite.ui.DocumentStatusHistoryItemView',
    'net.nanopay.invite.ui.InvitationStatusHistoryItemView'
  ],

  documentation: 'View displaying history for invitation item',

  properties: [
    {
      name: 'invitationStatusHistoryItem',
      factory: function () {
        return this.InvitationStatusHistoryItemView.create();
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
          case 'inviteStatus':
            this.invitationStatusHistoryItem.outputRecord(parentView, record);
            break;

          case 'complianceStatus':
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
