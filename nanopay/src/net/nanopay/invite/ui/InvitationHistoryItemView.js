foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationHistoryItemView',
  extends: 'foam.u2.View',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invite.ui.InvitationStatusHistoryItemView',
    'net.nanopay.invite.ui.ComplianceStatusHistoryItemView'
  ],

  documentation: 'View displaying history for invitation item',

  methods: [
    function outputRecord(parentView, record) {
      var updates = record.updates;
      // if no updates then this is a new account, so show the status page
      if ( ! updates || updates.length === 0 ) {
        return this.InvitationStatusHistoryItemView.create().outputRecord(parentView, record);
      }

      for ( var i = 0 ; i < updates.length ; i++ ) {
        var update = updates[i];
        switch ( update.name ) {
          case 'inviteStatus':
            this.InvitationStatusHistoryItemView.create().outputRecord(parentView, record);
            break;

          case 'complianceStatus':
            this.ComplianceStatusHistoryItemView.create().outputRecord(parentView, record);
            break;
        }
      }
    }
  ]
});
