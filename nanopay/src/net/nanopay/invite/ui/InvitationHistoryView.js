foam.CLASS({
  package: 'net.nanopay.invite.ui',
  name: 'InvitationHistoryView',
  extends: 'foam.u2.View',

  documentation: 'History view of invitation',

  requires: [
    'net.nanopay.invite.ui.InvitationHistoryItemView'
  ],

  imports: [
    'invitationHistoryDAO'
  ],

  properties: [
    'selection',
    {
      name: 'data',
      factory: function () {
        return this.invitationHistoryDAO;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .tag({
          class: 'foam.u2.history.HistoryView',
          data: this.invitationHistoryDAO,
          historyItemView: this.InvitationHistoryItemView.create()
        });
    }
  ]
});
